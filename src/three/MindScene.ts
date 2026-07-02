import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import gsap from "gsap";
import { nodes, type MindNode } from "../lib/data";
import {
  coreVertex,
  coreFragment,
  dustVertex,
  dustFragment,
  linkVertex,
  linkFragment,
  glowVertex,
  glowFragment,
} from "./shaders";

export type SceneMode = "boot" | "tour" | "free" | "focus";

export type SceneSignal = "core-touch" | "zoom-min" | "shockwave";

export type SceneEvents = {
  onNodeHover: (id: MindNode["id"] | null) => void;
  onNodeClick: (id: MindNode["id"]) => void;
  onTourProgress: (p: number) => void;
  onSignal: (signal: SceneSignal) => void;
};

export const TOUR_SEGMENTS = nodes.length + 1; // intro -> 5 nodes -> overview

type NodeVisual = {
  node: MindNode;
  glow: THREE.Mesh;
  glowMat: THREE.ShaderMaterial;
  linkMat: THREE.ShaderMaterial;
  linkGeo: THREE.BufferGeometry;
  linkBase: Float32Array;
  linkTs: Float32Array;
  icosa: THREE.LineSegments;
  hitSphere: THREE.Mesh;
  label: HTMLElement | null;
  hoverT: number;
  basePos: THREE.Vector3;
  baseAnchor: THREE.Vector3;
  anchor: THREE.Vector3;
  // spring physics — shockwaves and bursts knock nodes off their anchor
  offset: THREE.Vector3;
  vel: THREE.Vector3;
};

export class MindScene {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private composer: EffectComposer;
  private bloom: UnrealBloomPass;
  private clock = new THREE.Clock();
  private raf = 0;
  private disposed = false;

  private coreMat!: THREE.ShaderMaterial;
  private dustMat!: THREE.ShaderMaterial;
  private visuals: NodeVisual[] = [];

  private mode: SceneMode = "boot";
  private events: SceneEvents;
  private reducedMotion: boolean;

  // --- tour ---
  private camCurve!: THREE.CatmullRomCurve3;
  private targetCurve!: THREE.CatmullRomCurve3;
  private tourTarget = 0;
  private tourCurrent = 0;

  // --- camera state ---
  private camTarget = new THREE.Vector3(0, 0, 0); // what the camera looks at
  private desiredTarget = new THREE.Vector3(0, 0, 0);

  // --- free roam orbit ---
  private spherical = new THREE.Spherical(19, Math.PI / 2.3, 0);
  private orbitVel = { theta: 0, phi: 0 };
  private dragging = false;
  private dragMoved = 0;
  private lastPointer = { x: 0, y: 0 };
  private focusedId: MindNode["id"] | null = null;
  private savedSpherical: THREE.Spherical | null = null;

  // --- pointer / interaction ---
  private pointerNdc = new THREE.Vector2(2, 2); // offscreen until moved
  private raycaster = new THREE.Raycaster();
  private mouseWorld = new THREE.Vector3(0, 0, 999);
  private mouseActive = 0;
  private excite = 0;
  private exciteTarget = 0;
  private coreHit!: THREE.Mesh;
  private hoveredId: MindNode["id"] | null = null;
  private externalHoverId: MindNode["id"] | null = null;
  private burstAt = -100;
  /** portrait screens need the wide shots pulled back to fit the constellation */
  private distScale = 1;

  // --- terminal-controllable world state ---
  private shockAt = -100;
  private shockPos = new THREE.Vector3();
  private exciteUntil = -1;
  private forceUntil = -1;
  private monoUntil = -1;
  private calmed = false;
  private timeScaleBase = 1;
  private signalled = new Set<SceneSignal>();

  constructor(
    private canvas: HTMLCanvasElement,
    opts: { quality: "high" | "low"; reducedMotion: boolean; events: SceneEvents }
  ) {
    this.events = opts.events;
    this.reducedMotion = opts.reducedMotion;
    this.timeScaleBase = opts.reducedMotion ? 0.35 : 1;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: "high-performance",
    });
    const dprCap = opts.quality === "high" ? 2 : 1.5;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprCap));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(new THREE.Color("#030308"), 1);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      140
    );
    // portrait screens crop the mind badly with a vertical-FOV camera
    this.camera.fov = this.camera.aspect < 0.8 ? 68 : 50;
    this.distScale = this.camera.aspect < 0.8 ? 1.55 : 1;

    this.buildTourPath();
    this.camera.position.copy(this.camCurve.getPoint(0));
    this.camera.lookAt(0, 0, 0);

    const count = opts.quality === "high" ? 52000 : 16000;
    this.buildCore(count);
    this.buildDust(opts.quality === "high" ? 1600 : 700);
    this.buildNodes();

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.62,
      0.55,
      0.28
    );
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    this.bindPointer();
    this.loop();
  }

  // ------------------------------------------------------------------ build

  /** Node world position — pulled inward on portrait so the layout fits. */
  private nodePos(node: MindNode): THREE.Vector3 {
    const p = new THREE.Vector3(...node.position);
    if (this.distScale > 1) {
      p.x *= 0.72;
      p.z *= 0.72;
    }
    return p;
  }

  private buildCore(count: number) {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const v = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      // Oblate nebula ball with a sparse outer halo.
      const halo = Math.random() < 0.14;
      const rMax = halo ? 5.4 : 2.9;
      const r = Math.pow(Math.random(), halo ? 0.5 : 0.62) * rMax;
      v.randomDirection().multiplyScalar(r);
      v.y *= 0.72;
      positions[i * 3] = v.x;
      positions[i * 3 + 1] = v.y;
      positions[i * 3 + 2] = v.z;
      seeds[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    this.coreMat = new THREE.ShaderMaterial({
      vertexShader: coreVertex,
      fragmentShader: coreFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uTimeScale: { value: this.reducedMotion ? 0.35 : 1 },
        uSize: { value: 2.8 },
        uPixelRatio: { value: this.renderer.getPixelRatio() },
        uMouse: { value: this.mouseWorld },
        uMouseActive: { value: 0 },
        uExcite: { value: 0 },
        uBurstAge: { value: -1 },
        uForce: { value: 1 },
        uShockPos: { value: this.shockPos },
        uShockAge: { value: -1 },
        uHueShift: { value: 0 },
        uMono: { value: 0 },
      },
    });
    const points = new THREE.Points(geo, this.coreMat);
    points.frustumCulled = false;
    this.scene.add(points);

    // Invisible sphere so we can tell when the cursor is "touching" the mind.
    this.coreHit = new THREE.Mesh(
      new THREE.SphereGeometry(3.1, 12, 12),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this.scene.add(this.coreHit);
  }

  private buildDust(count: number) {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const v = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      v.randomDirection().multiplyScalar(13 + Math.random() * 26);
      positions[i * 3] = v.x;
      positions[i * 3 + 1] = v.y;
      positions[i * 3 + 2] = v.z;
      seeds[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    this.dustMat = new THREE.ShaderMaterial({
      vertexShader: dustVertex,
      fragmentShader: dustFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: this.renderer.getPixelRatio() },
      },
    });
    const points = new THREE.Points(geo, this.dustMat);
    points.frustumCulled = false;
    this.scene.add(points);
  }

  private buildNodes() {
    for (const node of nodes) {
      const pos = this.nodePos(node);
      const accent = new THREE.Color(node.accent);
      const seed = node.index * 0.37;

      const glowMat = new THREE.ShaderMaterial({
        vertexShader: glowVertex,
        fragmentShader: glowFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uAccent: { value: accent },
          uTime: { value: 0 },
          uHover: { value: 0 },
          uSeed: { value: seed },
          uScale: { value: 1.15 * node.scale },
        },
      });
      const glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), glowMat);
      glow.position.copy(pos);
      glow.frustumCulled = false;
      this.scene.add(glow);

      const icosa = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.52 * node.scale, 0)),
        new THREE.LineBasicMaterial({
          color: accent,
          transparent: true,
          opacity: 0.4,
        })
      );
      icosa.position.copy(pos);
      this.scene.add(icosa);

      // Synapse from the core surface out to the node, slightly bowed.
      const start = pos.clone().normalize().multiplyScalar(2.4);
      const mid = start
        .clone()
        .lerp(pos, 0.5)
        .add(
          new THREE.Vector3(
            Math.sin(seed * 12) * 1.6,
            Math.cos(seed * 9) * 1.6,
            Math.sin(seed * 7) * 1.2
          )
        );
      const curve = new THREE.QuadraticBezierCurve3(start, mid, pos);
      const linkPoints = curve.getPoints(64);
      const linkGeo = new THREE.BufferGeometry().setFromPoints(linkPoints);
      const ts = new Float32Array(linkPoints.length);
      for (let i = 0; i < ts.length; i++) ts[i] = i / (ts.length - 1);
      linkGeo.setAttribute("aT", new THREE.BufferAttribute(ts, 1));
      const linkMat = new THREE.ShaderMaterial({
        vertexShader: linkVertex,
        fragmentShader: linkFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uAccent: { value: accent },
          uHover: { value: 0 },
          uSeed: { value: seed },
        },
      });
      this.scene.add(new THREE.Line(linkGeo, linkMat));

      const hitSphere = new THREE.Mesh(
        new THREE.SphereGeometry(1.25 * node.scale, 10, 10),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hitSphere.position.copy(pos);
      hitSphere.userData.nodeId = node.id;
      this.scene.add(hitSphere);

      const baseAnchor = pos
        .clone()
        .add(new THREE.Vector3(0, 1.15 * node.scale + 0.35, 0));
      this.visuals.push({
        node,
        glow,
        glowMat,
        linkMat,
        linkGeo,
        linkBase: Float32Array.from(
          linkGeo.getAttribute("position").array as Float32Array
        ),
        linkTs: ts,
        icosa,
        hitSphere,
        label: null,
        hoverT: 0,
        basePos: pos.clone(),
        baseAnchor,
        anchor: baseAnchor.clone(),
        offset: new THREE.Vector3(),
        vel: new THREE.Vector3(),
      });
    }
  }

  private buildTourPath() {
    const s = this.distScale;
    const camPts: THREE.Vector3[] = [new THREE.Vector3(0, 1.2 * s, 26 * s)];
    const lookPts: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0)];
    for (const node of nodes) {
      const pos = this.nodePos(node);
      const out = pos.clone().normalize();
      camPts.push(
        pos
          .clone()
          .add(out.multiplyScalar(2.4 + 1.6 * node.scale))
          .add(new THREE.Vector3(0, 1.15, 0))
      );
      lookPts.push(pos.clone());
    }
    camPts.push(new THREE.Vector3(2.5 * s, 6.5 * s, 19 * s));
    lookPts.push(new THREE.Vector3(0, 0, 0));
    this.camCurve = new THREE.CatmullRomCurve3(camPts, false, "centripetal");
    this.targetCurve = new THREE.CatmullRomCurve3(lookPts, false, "centripetal");
  }

  /** Ease within each segment so the camera settles at every node. */
  private easedProgress(p: number) {
    const s = Math.min(Math.max(p, 0), 1) * TOUR_SEGMENTS;
    const i = Math.min(Math.floor(s), TOUR_SEGMENTS - 1);
    const l = s - i;
    const eased = l * l * (3 - 2 * l);
    return (i + eased) / TOUR_SEGMENTS;
  }

  // ------------------------------------------------------------ interaction

  private bindPointer() {
    const el = this.canvas;
    el.addEventListener("pointerdown", (e) => {
      if (this.mode !== "free") return;
      this.dragging = true;
      this.dragMoved = 0;
      this.lastPointer = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
    });
    window.addEventListener("pointermove", (e) => {
      this.pointerNdc.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
      this.mouseActive = 1;
      if (this.dragging && this.mode === "free") {
        const dx = e.clientX - this.lastPointer.x;
        const dy = e.clientY - this.lastPointer.y;
        this.dragMoved += Math.abs(dx) + Math.abs(dy);
        this.lastPointer = { x: e.clientX, y: e.clientY };
        this.orbitVel.theta = -dx * 0.0035;
        this.orbitVel.phi = -dy * 0.0028;
      }
    });
    const endDrag = () => {
      this.dragging = false;
    };
    window.addEventListener("pointerup", (e) => {
      const wasTap = this.dragging && this.dragMoved < 6;
      endDrag();
      if (this.mode === "free" && wasTap && e.target === el) {
        this.pointerNdc.set(
          (e.clientX / window.innerWidth) * 2 - 1,
          -(e.clientY / window.innerHeight) * 2 + 1
        );
        const hit = this.raycastNodes();
        if (hit) this.events.onNodeClick(hit);
      }
    });
    window.addEventListener("pointercancel", endDrag);
    document.documentElement.addEventListener("pointerleave", () => {
      this.mouseActive = 0;
    });
    el.addEventListener(
      "wheel",
      (e) => {
        if (this.mode !== "free") return;
        e.preventDefault();
        this.spherical.radius = THREE.MathUtils.clamp(
          this.spherical.radius + e.deltaY * 0.012,
          9,
          34 * this.distScale
        );
        if (this.spherical.radius <= 9.01) this.emitSignal("zoom-min");
      },
      { passive: false }
    );
    el.addEventListener("dblclick", (e) => {
      if (this.mode !== "free") return;
      this.shockwave(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
    });
  }

  private emitSignal(s: SceneSignal) {
    if (this.signalled.has(s)) return;
    this.signalled.add(s);
    this.events.onSignal(s);
  }

  private raycastNodes(): MindNode["id"] | null {
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    const meshes = this.visuals.map((v) => v.hitSphere);
    const hits = this.raycaster.intersectObjects(meshes, false);
    return hits.length ? (hits[0].object.userData.nodeId as MindNode["id"]) : null;
  }

  // ------------------------------------------------------------- public API

  registerLabel(id: MindNode["id"], el: HTMLElement | null) {
    const v = this.visuals.find((v) => v.node.id === id);
    if (v) v.label = el;
  }

  setMode(mode: SceneMode) {
    this.mode = mode;
  }

  getMode() {
    return this.mode;
  }

  setTourProgress(p: number) {
    this.tourTarget = p;
  }

  /** DOM node-labels drive hover through this (raycast can miss the label). */
  setExternalHover(id: MindNode["id"] | null) {
    this.externalHoverId = id;
  }

  /** Restart the guided tour from the very beginning (camera snaps to start). */
  resetTour() {
    this.focusedId = null;
    this.tourTarget = 0;
    this.tourCurrent = 0;
    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.desiredTarget);
    this.camera.position.copy(this.camCurve.getPoint(0));
    this.desiredTarget.set(0, 0, 0);
    this.camTarget.set(0, 0, 0);
    this.setMode("tour");
  }

  /** Called when the tour finishes or is skipped: hand the camera to the user. */
  enterFreeRoam(animate: boolean) {
    this.focusedId = null;
    const end = this.camCurve.getPoint(1);
    const go = () => {
      this.spherical.setFromVector3(this.camera.position);
      this.orbitVel = { theta: 0, phi: 0 };
      this.setMode("free");
    };
    if (animate) {
      this.setMode("boot"); // camera under our control during the flight
      gsap.to(this.camera.position, {
        x: end.x,
        y: end.y,
        z: end.z,
        duration: 1.6,
        ease: "power3.inOut",
        onComplete: go,
      });
      gsap.to(this.desiredTarget, { x: 0, y: 0, z: 0, duration: 1.6, ease: "power3.inOut" });
    } else {
      this.camera.position.copy(end);
      this.desiredTarget.set(0, 0, 0);
      go();
    }
  }

  focusNode(id: MindNode["id"]) {
    const v = this.visuals.find((v) => v.node.id === id);
    if (!v) return;
    if (this.mode === "free") {
      this.savedSpherical = this.spherical.clone();
    }
    this.focusedId = id;
    this.setMode("focus");
    const pos = this.nodePos(v.node);
    const out = pos.clone().normalize();
    const camPos = pos
      .clone()
      .add(out.multiplyScalar(3.4 + 2.3 * v.node.scale))
      .add(new THREE.Vector3(0, 0.9, 0));

    // Push the node off-center so the panel doesn't cover it.
    const portrait = window.innerWidth < window.innerHeight || window.innerWidth < 760;
    const dir = camPos.clone().sub(pos).normalize();
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), dir).normalize();
    const look = portrait
      ? pos.clone().add(new THREE.Vector3(0, -0.9, 0))
      : pos.clone().add(right.multiplyScalar(-1.5));

    gsap.to(this.camera.position, {
      x: camPos.x,
      y: camPos.y,
      z: camPos.z,
      duration: 1.4,
      ease: "power3.inOut",
    });
    gsap.to(this.desiredTarget, {
      x: look.x,
      y: look.y,
      z: look.z,
      duration: 1.4,
      ease: "power3.inOut",
    });
  }

  unfocus() {
    this.focusedId = null;
    const sph = this.savedSpherical ?? new THREE.Spherical(19, Math.PI / 2.3, 0.3);
    const back = new THREE.Vector3().setFromSpherical(sph);
    gsap.to(this.camera.position, {
      x: back.x,
      y: back.y,
      z: back.z,
      duration: 1.3,
      ease: "power3.inOut",
      onComplete: () => {
        this.spherical.copy(sph);
        this.orbitVel = { theta: 0, phi: 0 };
        this.setMode("free");
      },
    });
    gsap.to(this.desiredTarget, { x: 0, y: 0, z: 0, duration: 1.3, ease: "power3.inOut" });
  }

  /** The Lab toy: kick every particle outward, let it settle back. */
  burst() {
    this.burstAt = this.clock.elapsedTime;
    const dir = new THREE.Vector3();
    for (const v of this.visuals) {
      dir.copy(v.basePos).normalize();
      v.vel.addScaledVector(dir, 2.0);
    }
  }

  /** Ripple from a screen point (double-click) or the current pointer. */
  shockwave(ndcX?: number, ndcY?: number) {
    const ndc = new THREE.Vector2(
      ndcX ?? this.pointerNdc.x,
      ndcY ?? this.pointerNdc.y
    );
    this.raycaster.setFromCamera(ndc, this.camera);
    const ray = this.raycaster.ray;
    const along = Math.max(-ray.origin.dot(ray.direction), 0);
    this.shockPos.copy(ray.origin).addScaledVector(ray.direction, along);
    this.shockAt = this.clock.elapsedTime;
    const dir = new THREE.Vector3();
    for (const v of this.visuals) {
      dir.copy(v.basePos).sub(this.shockPos);
      const dist = Math.max(dir.length(), 0.5);
      v.vel.addScaledVector(dir.normalize(), 3.2 * Math.exp(-dist / 7));
    }
    this.emitSignal("shockwave");
  }

  /** Terminal toys — temporary alterations of the world. */
  exciteFor(seconds: number) {
    this.exciteUntil = this.clock.elapsedTime + seconds;
  }

  gravityFor(seconds: number) {
    this.forceUntil = this.clock.elapsedTime + seconds;
  }

  matrixFor(seconds: number) {
    this.monoUntil = this.clock.elapsedTime + seconds;
  }

  toggleCalm(): boolean {
    this.calmed = !this.calmed;
    return this.calmed;
  }

  setHueShift(v: number) {
    this.coreMat.uniforms.uHueShift.value = v;
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.fov = this.camera.aspect < 0.8 ? 68 : 50;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.renderer.dispose();
  }

  // ------------------------------------------------------------------ loop

  private loop = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;

    // -- uniforms shared by everything
    this.coreMat.uniforms.uTime.value = t;
    this.coreMat.uniforms.uBurstAge.value = this.burstAt < 0 ? -1 : t - this.burstAt;
    this.coreMat.uniforms.uShockAge.value = this.shockAt < 0 ? -1 : t - this.shockAt;
    this.coreMat.uniforms.uForce.value = t < this.forceUntil ? -2.4 : 1;
    this.coreMat.uniforms.uMono.value = THREE.MathUtils.lerp(
      this.coreMat.uniforms.uMono.value,
      t < this.monoUntil ? 1 : 0,
      0.06
    );
    this.coreMat.uniforms.uTimeScale.value = THREE.MathUtils.lerp(
      this.coreMat.uniforms.uTimeScale.value,
      this.calmed ? 0.1 : this.timeScaleBase,
      0.04
    );
    this.dustMat.uniforms.uTime.value = t;

    // -- pointer -> world (closest point on the pointer ray to the core)
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    const ray = this.raycaster.ray;
    const tRay = -ray.origin.dot(ray.direction);
    this.mouseWorld.copy(ray.origin).addScaledVector(ray.direction, Math.max(tRay, 0));
    this.coreMat.uniforms.uMouseActive.value = THREE.MathUtils.lerp(
      this.coreMat.uniforms.uMouseActive.value,
      this.mouseActive,
      0.06
    );

    // -- core excitement when the cursor touches the mind
    const touchingCore =
      this.raycaster.intersectObject(this.coreHit, false).length > 0 && this.mouseActive > 0;
    this.exciteTarget = touchingCore || t < this.exciteUntil ? 1 : 0;
    this.excite = THREE.MathUtils.lerp(this.excite, this.exciteTarget, 0.045);
    this.coreMat.uniforms.uExcite.value = this.excite;
    if (touchingCore && this.excite > 0.5) this.emitSignal("core-touch");

    // -- node hover (free roam only)
    if (this.mode === "free" && !this.dragging) {
      const hit = this.raycastNodes();
      if (hit !== this.hoveredId) {
        this.hoveredId = hit;
        this.events.onNodeHover(hit);
      }
    } else if (this.hoveredId && this.mode !== "free") {
      this.hoveredId = null;
      this.events.onNodeHover(null);
    }

    // -- node spring physics (shockwaves / bursts knock them off anchor)
    for (const v of this.visuals) {
      if (v.offset.lengthSq() < 1e-7 && v.vel.lengthSq() < 1e-7) continue;
      v.vel.addScaledVector(v.offset, -7.0 * dt).addScaledVector(v.vel, -3.4 * dt);
      v.offset.addScaledVector(v.vel, dt);
      v.glow.position.copy(v.basePos).add(v.offset);
      v.icosa.position.copy(v.glow.position);
      v.hitSphere.position.copy(v.glow.position);
      v.anchor.copy(v.baseAnchor).add(v.offset);
      // synapse follows, weighted toward the node end
      const attr = v.linkGeo.getAttribute("position") as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      for (let i = 0; i < v.linkTs.length; i++) {
        const w = Math.pow(v.linkTs[i], 1.7);
        arr[i * 3] = v.linkBase[i * 3] + v.offset.x * w;
        arr[i * 3 + 1] = v.linkBase[i * 3 + 1] + v.offset.y * w;
        arr[i * 3 + 2] = v.linkBase[i * 3 + 2] + v.offset.z * w;
      }
      attr.needsUpdate = true;
    }

    // -- per-node visuals
    for (const v of this.visuals) {
      const hovered =
        this.hoveredId === v.node.id || this.externalHoverId === v.node.id;
      // focused node gets a mild boost only — the camera sits right next to
      // it, and a full hover glow blows out to white at that distance
      const target = hovered ? 1 : this.focusedId === v.node.id ? 0.3 : 0;
      v.hoverT = THREE.MathUtils.lerp(v.hoverT, target, 0.08);
      v.glowMat.uniforms.uTime.value = t;
      v.glowMat.uniforms.uHover.value = v.hoverT;
      v.linkMat.uniforms.uTime.value = t;
      v.linkMat.uniforms.uHover.value = v.hoverT;
      v.icosa.rotation.x += dt * (0.15 + v.hoverT * 0.9);
      v.icosa.rotation.y += dt * (0.22 + v.hoverT * 1.2);
    }

    // -- camera per mode
    if (this.mode === "tour") {
      this.tourCurrent = THREE.MathUtils.lerp(this.tourCurrent, this.tourTarget, 0.07);
      const pe = this.easedProgress(this.tourCurrent);
      this.camera.position.copy(this.camCurve.getPoint(pe));
      this.desiredTarget.copy(this.targetCurve.getPoint(pe));
      this.events.onTourProgress(this.tourCurrent);
    } else if (this.mode === "free") {
      this.spherical.theta += this.orbitVel.theta;
      this.spherical.phi = THREE.MathUtils.clamp(
        this.spherical.phi + this.orbitVel.phi,
        0.3,
        Math.PI - 0.35
      );
      this.orbitVel.theta *= 0.92;
      this.orbitVel.phi *= 0.92;
      if (!this.dragging && !this.reducedMotion) this.spherical.theta += dt * 0.03; // idle drift
      this.camera.position.setFromSpherical(this.spherical);
      this.desiredTarget.set(0, 0, 0);
    }
    // "boot" and "focus": GSAP owns camera.position / desiredTarget.

    this.camTarget.lerp(this.desiredTarget, 0.12);
    this.camera.lookAt(this.camTarget);

    // -- project node labels into screen space
    const w = window.innerWidth;
    const h = window.innerHeight;
    const proj = new THREE.Vector3();
    for (const v of this.visuals) {
      if (!v.label) continue;
      proj.copy(v.anchor).project(this.camera);
      const behind = proj.z > 1;
      const x = (proj.x * 0.5 + 0.5) * w;
      const y = (-proj.y * 0.5 + 0.5) * h;
      v.label.style.transform = `translate(-50%, -100%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      const dimmed = this.focusedId !== null && this.focusedId !== v.node.id;
      v.label.style.opacity = behind || this.mode === "boot" ? "0" : dimmed ? "0.15" : "";
      v.label.style.pointerEvents = behind || this.mode !== "free" ? "none" : "";
    }

    this.composer.render();
  };
}
