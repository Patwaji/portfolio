import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from "gsap";
import { nodes, thoughtFragments, type MindNode } from "../lib/data";
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

export type SceneSignal = "core-touch" | "zoom-min" | "shockwave" | "well-drop";

export type RestoreResult = { caught: number; total: number; ms: number };

export type SceneEvents = {
  onNodeHover: (id: MindNode["id"] | null) => void;
  onNodeClick: (id: MindNode["id"]) => void;
  onTourProgress: (p: number) => void;
  onSignal: (signal: SceneSignal) => void;
  onRestoreTick: (caught: number, total: number, msLeft: number) => void;
  onRestoreEnd: (result: RestoreResult) => void;
  onThoughtSpawn: (id: number, phrase: string) => void;
  onThoughtGone: (id: number, caught: boolean) => void;
  onThoughtScore: (score: number, combo: number, misses: number) => void;
  onThoughtGameOver: (score: number) => void;
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

  // --- dropped gravity wells (click-to-place toy) ---
  private static readonly MAX_WELLS = 4;
  private static readonly WELL_LIFE = 9; // seconds
  private wells: { pos: THREE.Vector3; bornAt: number }[] = [];
  private wellPosUniform: THREE.Vector3[] = Array.from(
    { length: MindScene.MAX_WELLS },
    () => new THREE.Vector3()
  );
  private wellStrengthUniform = new Float32Array(MindScene.MAX_WELLS);

  // --- Restore the Mind (catch-the-motes game) ---
  private motes: {
    id: number;
    mesh: THREE.Mesh;
    mat: THREE.ShaderMaterial;
    hit: THREE.Mesh;
    pos: THREE.Vector3;
    vel: THREE.Vector3;
    phase: number;
    caught: boolean;
    caughtAt: number;
  }[] = [];
  private restoreActive = false;
  private restoreStartedAt = 0;
  private restoreEndsAt = 0;
  private restoreCaught = 0;
  private restoreTotal = 0;
  private moteIdSeq = 0;

  // --- adaptive quality ---
  private fpsFrames = 0;
  private fpsAcc = 0;
  private fpsLowStreak = 0;
  private fpsHighStreak = 0;
  private dprCap = 2;
  private dprCurrent = 2;

  // --- pinch zoom ---
  private touches = new Map<number, { x: number; y: number }>();
  private pinchDist = 0;

  // --- gyro parallax + drowsy idle ---
  private gyro = { x: 0, y: 0, tx: 0, ty: 0 };
  private drowsy = false;
  private bloomTarget = 0.62;

  // --- Catch the Thought (endless DOM-label game) ---
  private thoughts: {
    id: number;
    phrase: string;
    pos: THREE.Vector3;
    vel: THREE.Vector3;
    bornAt: number;
    life: number;
    phase: number;
    el: HTMLElement | null;
    caught: boolean;
  }[] = [];
  private thoughtActive = false;
  private thoughtSpawnAt = 0;
  private thoughtIdSeq = 0;
  private thoughtScore = 0;
  private thoughtCombo = 0;
  private thoughtMisses = 0;
  private thoughtBag: string[] = [];

  /** "Mind seed" RNG — deterministic per day so the field differs day to day. */
  private rand: () => number = Math.random;
  private hueSeed = 0;

  // --- generated artifacts riding the nodes (Mint models) ---
  /** billboard artifacts tracked each frame; tumble artifacts ride the cage directly */
  private billboards: { holder: THREE.Group; visual: NodeVisual; spin: number }[] =
    [];
  private loadedModels: THREE.Object3D[] = [];
  private envRT: THREE.WebGLRenderTarget | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    opts: {
      quality: "high" | "low";
      reducedMotion: boolean;
      events: SceneEvents;
      rand?: () => number;
      hueSeed?: number;
    }
  ) {
    this.events = opts.events;
    this.reducedMotion = opts.reducedMotion;
    this.timeScaleBase = opts.reducedMotion ? 0.35 : 1;
    if (opts.rand) this.rand = opts.rand;
    if (opts.hueSeed !== undefined) this.hueSeed = opts.hueSeed;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: "high-performance",
    });
    this.dprCap = Math.min(
      window.devicePixelRatio,
      opts.quality === "high" ? 2 : 1.5
    );
    this.dprCurrent = this.dprCap;
    this.renderer.setPixelRatio(this.dprCurrent);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(new THREE.Color("#030308"), 1);
    canvas.style.touchAction = "none";

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
    this.buildEnvironment();
    this.buildArtifacts();

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

  /** Uniform point on the unit sphere from our seeded RNG (Vector3.randomDirection, deseeded). */
  private randomDirection(out: THREE.Vector3): THREE.Vector3 {
    const theta = this.rand() * Math.PI * 2;
    const z = this.rand() * 2 - 1;
    const r = Math.sqrt(1 - z * z);
    return out.set(r * Math.cos(theta), r * Math.sin(theta), z);
  }

  private buildCore(count: number) {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const v = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      // Oblate nebula ball with a sparse outer halo.
      const halo = this.rand() < 0.14;
      const rMax = halo ? 5.4 : 2.9;
      const r = Math.pow(this.rand(), halo ? 0.5 : 0.62) * rMax;
      this.randomDirection(v).multiplyScalar(r);
      v.y *= 0.72;
      positions[i * 3] = v.x;
      positions[i * 3 + 1] = v.y;
      positions[i * 3 + 2] = v.z;
      seeds[i] = this.rand();
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
        uWellPos: { value: this.wellPosUniform },
        uWellStrength: { value: this.wellStrengthUniform },
        uHueShift: { value: this.hueSeed },
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
      this.randomDirection(v).multiplyScalar(13 + this.rand() * 26);
      positions[i * 3] = v.x;
      positions[i * 3 + 1] = v.y;
      positions[i * 3 + 2] = v.z;
      seeds[i] = this.rand();
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

  /**
   * The node artifacts are PBR metal — pure metal is pure reflection, so with no
   * lights and no environment they render black. Bake a tiny neutral equirect
   * gradient (cool key + warm fill) into a PMREM so metals catch highlights while
   * each model's own baked accent still reads. Only the artifacts use a standard
   * material; particles are shader/basic and ignore this.
   */
  private buildEnvironment() {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 128;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#05060a";
    ctx.fillRect(0, 0, 256, 128);
    // cool key highlight, upper-left
    let g = ctx.createRadialGradient(70, 34, 3, 70, 34, 78);
    g.addColorStop(0, "#c6cffb");
    g.addColorStop(0.45, "#4b568c");
    g.addColorStop(1, "rgba(5,6,10,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 128);
    // dim neutral warm fill, right side — gives metal a second reflection
    // without forcing a hue onto the differently-accented nodes
    g = ctx.createRadialGradient(198, 82, 3, 198, 82, 104);
    g.addColorStop(0, "#7d7a68");
    g.addColorStop(0.5, "#3a352c");
    g.addColorStop(1, "rgba(5,6,10,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 128);

    const tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envRT = pmrem.fromEquirectangular(tex);
    this.scene.environment = this.envRT.texture;
    tex.dispose();
    pmrem.dispose();
  }

  /**
   * Load one generated artifact per node and seat it inside that node's cage.
   * The Cogniflow iris is a flat disc, so it billboards to the camera and spins
   * on its own Z (parenting it to the tumbling cage would turn it edge-on and
   * make it vanish). The volumetric artifacts simply ride the cage, inheriting
   * its position tracking and X/Y tumble for free.
   */
  private buildArtifacts() {
    const table = [
      { id: "cogniflow", file: "cogniflow-iris", motion: "billboard", fit: 1.18, glow: false },
      { id: "philosophy", file: "philosophy-keystone", motion: "tumble", fit: 1.15, glow: true },
      { id: "arsenal", file: "arsenal-cluster", motion: "tumble", fit: 1.15, glow: true },
      { id: "lab", file: "lab-capsule", motion: "tumble", fit: 1.15, glow: true },
      { id: "signal", file: "signal-beacon", motion: "tumble", fit: 1.15, glow: true },
    ] as const;
    // ponytail: shipped GLBs are repacked derivatives with extensionsRequired:[]
    // (no draco/meshopt/ktx2), so a bare GLTFLoader is sufficient. If a raw
    // Mint-optimized GLB is ever swapped in, attach a DRACOLoader here.
    const loader = new GLTFLoader();
    for (const cfg of table) {
      const visual = this.visuals.find((v) => v.node.id === cfg.id);
      if (!visual) continue;
      loader.load(
        `/models/${cfg.file}.glb`,
        (gltf) => {
          const model = gltf.scene;
          if (this.disposed) {
            this.disposeObject(model);
            return;
          }
          // fit the model's bounding sphere just proud of the wireframe cage,
          // then recenter it so the cage and the model share an origin
          const box = new THREE.Box3().setFromObject(model);
          const sphere = box.getBoundingSphere(new THREE.Sphere());
          const cageR = 0.52 * visual.node.scale;
          const s = (cageR * cfg.fit) / sphere.radius;
          model.scale.setScalar(s);
          model.position.copy(sphere.center).multiplyScalar(-s);
          this.loadedModels.push(model);

          // These artifacts bake their accent glow into baseColor, not an
          // emissive map, so in this near-unlit scene the bright seams would
          // render dark. Reuse the delivered baseColor as an emissive source at
          // low intensity: dark metal stays dark, only the bright accent lines
          // self-illuminate and cross the bloom threshold. No map is altered.
          if (cfg.glow) {
            model.traverse((o) => {
              const mat = (o as THREE.Mesh).material as
                | THREE.MeshStandardMaterial
                | undefined;
              if (mat && mat.isMeshStandardMaterial && mat.map) {
                mat.emissiveMap = mat.map;
                mat.emissive = new THREE.Color(0xffffff);
                mat.emissiveIntensity = 0.55;
                mat.needsUpdate = true;
              }
            });
          }

          if (cfg.motion === "tumble") {
            visual.icosa.add(model);
          } else {
            const holder = new THREE.Group();
            holder.add(model);
            holder.position.copy(visual.glow.position);
            this.scene.add(holder);
            this.billboards.push({
              holder,
              visual,
              spin: this.rand() * Math.PI * 2,
            });
          }
        },
        undefined,
        (err) => console.error(`[MindScene] ${cfg.file} load failed`, err)
      );
    }
  }

  /** Recursively dispose a loaded model's geometry, materials, and textures. */
  private disposeObject(obj: THREE.Object3D) {
    obj.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (!mat) return;
      for (const m of Array.isArray(mat) ? mat : [mat]) {
        for (const k in m) {
          const val = (m as unknown as Record<string, unknown>)[k];
          if (val instanceof THREE.Texture) val.dispose();
        }
        m.dispose();
      }
    });
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

  private zoomBy(delta: number) {
    this.spherical.radius = THREE.MathUtils.clamp(
      this.spherical.radius + delta,
      9,
      34 * this.distScale
    );
    if (this.spherical.radius <= 9.01) this.emitSignal("zoom-min");
  }

  private bindPointer() {
    const el = this.canvas;
    el.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch") {
        this.touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (this.touches.size === 2) {
          const [a, b] = [...this.touches.values()];
          this.pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
          this.dragging = false; // two fingers = zoom, not orbit
          return;
        }
      }
      if (this.mode !== "free") return;
      this.dragging = true;
      this.dragMoved = 0;
      this.lastPointer = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
    });
    window.addEventListener("pointermove", (e) => this.onPointerMove(e));
    const endDrag = (e?: PointerEvent) => {
      this.dragging = false;
      if (e && e.pointerType === "touch") {
        this.touches.delete(e.pointerId);
        if (this.touches.size < 2) this.pinchDist = 0;
      }
    };
    window.addEventListener("pointerup", (e) => {
      const wasTap = this.dragging && this.dragMoved < 6;
      endDrag(e);
      if (this.mode === "free" && wasTap && e.target === el) this.onCanvasTap(e);
    });
    window.addEventListener("pointercancel", (e) => endDrag(e));
    document.documentElement.addEventListener("pointerleave", () => {
      this.mouseActive = 0;
    });
    el.addEventListener(
      "wheel",
      (e) => {
        if (this.mode !== "free") return;
        e.preventDefault();
        this.zoomBy(e.deltaY * 0.012);
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

  /** A clean tap on empty canvas: catch a mote, open a node, or drop a well. */
  private onCanvasTap(e: PointerEvent) {
    this.pointerNdc.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );
    if (this.restoreActive) {
      this.tryCatchMote();
      return;
    }
    const hit = this.raycastNodes();
    if (hit) this.events.onNodeClick(hit);
    else this.dropWell();
  }

  private onPointerMove(e: PointerEvent) {
    this.pointerNdc.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );
    this.mouseActive = 1;
    if (e.pointerType === "touch" && this.touches.has(e.pointerId)) {
      this.touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this.touches.size === 2 && this.mode === "free") {
        const [a, b] = [...this.touches.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (this.pinchDist > 0) this.zoomBy((this.pinchDist - dist) * 0.035);
        this.pinchDist = dist;
        return;
      }
    }
    if (this.dragging && this.mode === "free") {
      const dx = e.clientX - this.lastPointer.x;
      const dy = e.clientY - this.lastPointer.y;
      this.dragMoved += Math.abs(dx) + Math.abs(dy);
      this.lastPointer = { x: e.clientX, y: e.clientY };
      this.orbitVel.theta = -dx * 0.0035;
      this.orbitVel.phi = -dy * 0.0028;
    }
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

  /** Click-to-place gravity well (empty-space tap in free-roam). Fades over ~9s. */
  dropWell(ndcX?: number, ndcY?: number) {
    const ndc = new THREE.Vector2(
      ndcX ?? this.pointerNdc.x,
      ndcY ?? this.pointerNdc.y
    );
    this.raycaster.setFromCamera(ndc, this.camera);
    const ray = this.raycaster.ray;
    const along = Math.max(-ray.origin.dot(ray.direction), 0);
    const pos = ray.origin.clone().addScaledVector(ray.direction, along);
    this.wells.push({ pos, bornAt: this.clock.elapsedTime });
    if (this.wells.length > MindScene.MAX_WELLS) this.wells.shift();
    this.emitSignal("well-drop");
    return this.wells.length;
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

  /** Force-compile every shader while the preloader is still up. */
  async warmup() {
    try {
      await this.renderer.compileAsync(this.scene, this.camera);
    } catch {
      // compilation happens lazily on first render anyway — never block boot
    }
  }

  // ---------------------------------------------------- idle & device input

  /** Whisper mode: the mind falls asleep when the visitor goes idle. */
  setDrowsy(on: boolean) {
    this.drowsy = on;
    this.bloomTarget = on ? 0.3 : 0.62;
  }

  /** Gyroscope parallax for touch devices (no-op where unsupported). */
  enableGyro() {
    window.addEventListener("deviceorientation", (e) => {
      if (e.gamma === null || e.beta === null) return;
      this.gyro.tx = THREE.MathUtils.clamp(e.gamma / 45, -1, 1) * 1.4;
      this.gyro.ty = THREE.MathUtils.clamp((e.beta - 45) / 45, -1, 1) * 1.0;
    });
  }

  // -------------------------------------------------- Restore the Mind game

  /** Spawns catchable "lost thought" motes ejected from the core. */
  startRestoreGame(count = 12, seconds = 24) {
    this.clearMotes();
    this.restoreCaught = 0;
    this.restoreTotal = count;
    this.restoreStartedAt = this.clock.elapsedTime;
    this.restoreEndsAt = this.clock.elapsedTime + seconds;
    this.restoreActive = true;

    const accent = new THREE.Color("#ffd98a");
    for (let i = 0; i < count; i++) {
      const dir = new THREE.Vector3();
      this.randomDirection(dir);
      const pos = dir.clone().multiplyScalar(1.2 + this.rand() * 0.8);
      const vel = dir.clone().multiplyScalar(2.6 + this.rand() * 2.2);

      const mat = new THREE.ShaderMaterial({
        vertexShader: glowVertex,
        fragmentShader: glowFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uAccent: { value: accent },
          uTime: { value: 0 },
          uHover: { value: 0.55 },
          uSeed: { value: this.rand() * 40 },
          uScale: { value: 0.34 },
        },
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
      mesh.position.copy(pos);
      mesh.frustumCulled = false;
      this.scene.add(mesh);

      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(0.85, 8, 8),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hit.position.copy(pos);
      hit.userData.moteId = this.moteIdSeq;
      this.scene.add(hit);

      this.motes.push({
        id: this.moteIdSeq++,
        mesh,
        mat,
        hit,
        pos,
        vel,
        phase: this.rand() * 100,
        caught: false,
        caughtAt: -1,
      });
    }
  }

  private clearMotes() {
    for (const m of this.motes) {
      this.scene.remove(m.mesh, m.hit);
      m.mat.dispose();
      m.mesh.geometry.dispose();
      (m.hit.material as THREE.Material).dispose();
      m.hit.geometry.dispose();
    }
    this.motes = [];
  }

  private endRestoreGame() {
    if (!this.restoreActive) return;
    this.restoreActive = false;
    this.events.onRestoreEnd({
      caught: this.restoreCaught,
      total: this.restoreTotal,
      ms: Math.round((this.clock.elapsedTime - this.restoreStartedAt) * 1000),
    });
    // let uncaught motes drift and fade rather than vanish abruptly
    window.setTimeout(() => this.clearMotes(), 1400);
  }

  private tryCatchMote(): boolean {
    if (!this.restoreActive) return false;
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    const hits = this.raycaster.intersectObjects(
      this.motes.filter((m) => !m.caught).map((m) => m.hit),
      false
    );
    if (!hits.length) return false;
    const id = hits[0].object.userData.moteId as number;
    const mote = this.motes.find((m) => m.id === id);
    if (!mote || mote.caught) return false;
    mote.caught = true;
    mote.caughtAt = this.clock.elapsedTime;
    this.restoreCaught++;
    this.events.onRestoreTick(
      this.restoreCaught,
      this.restoreTotal,
      Math.max(0, (this.restoreEndsAt - this.clock.elapsedTime) * 1000)
    );
    if (this.restoreCaught >= this.restoreTotal) this.endRestoreGame();
    return true;
  }

  private updateRestoreGame(dt: number, t: number) {
    if (this.restoreActive && t >= this.restoreEndsAt) {
      this.endRestoreGame();
    } else if (this.restoreActive) {
      this.events.onRestoreTick(
        this.restoreCaught,
        this.restoreTotal,
        Math.max(0, (this.restoreEndsAt - t) * 1000)
      );
    }

    for (const m of this.motes) {
      if (m.caught) {
        // fly back into the core and shrink away
        const age = t - m.caughtAt;
        const k = Math.min(age / 0.45, 1);
        m.pos.lerp(new THREE.Vector3(0, 0, 0), 0.16);
        m.mesh.position.copy(m.pos);
        m.mat.uniforms.uScale.value = 0.34 * (1 - k);
        m.mat.uniforms.uTime.value = t;
        if (k >= 1) m.mat.uniforms.uScale.value = 0;
        continue;
      }
      // gentle wander + soft containment so motes stay in play
      const r = m.pos.length();
      const containment = r > 5.5 ? (r - 5.5) * 0.9 : 0;
      m.vel.addScaledVector(m.pos, containment > 0 ? (-containment / r) * dt : 0);
      m.vel.multiplyScalar(1 - Math.min(dt * 0.6, 0.9));
      m.vel.x += Math.sin(t * 0.7 + m.phase) * 0.35 * dt;
      m.vel.y += Math.cos(t * 0.5 + m.phase * 1.3) * 0.35 * dt;
      m.vel.z += Math.sin(t * 0.6 + m.phase * 0.8) * 0.35 * dt;
      m.pos.addScaledVector(m.vel, dt);
      m.mesh.position.copy(m.pos);
      m.hit.position.copy(m.pos);
      m.mat.uniforms.uTime.value = t;
    }
  }

  // -------------------------------------------------- Catch the Thought game

  private nextPhrase(): string {
    if (!this.thoughtBag.length) {
      this.thoughtBag = [...thoughtFragments];
      // shuffle (seeded) so it never plays the same order twice in a row
      for (let i = this.thoughtBag.length - 1; i > 0; i--) {
        const j = Math.floor(this.rand() * (i + 1));
        [this.thoughtBag[i], this.thoughtBag[j]] = [this.thoughtBag[j], this.thoughtBag[i]];
      }
    }
    return this.thoughtBag.pop()!;
  }

  startThoughtGame() {
    this.stopThoughtGame();
    this.thoughtActive = true;
    this.thoughtScore = 0;
    this.thoughtCombo = 0;
    this.thoughtMisses = 0;
    this.thoughtSpawnAt = this.clock.elapsedTime + 0.4;
  }

  stopThoughtGame() {
    this.thoughtActive = false;
    for (const th of this.thoughts) this.events.onThoughtGone(th.id, false);
    this.thoughts = [];
  }

  registerThoughtLabel(id: number, el: HTMLElement | null) {
    const th = this.thoughts.find((t) => t.id === id);
    if (th) th.el = el;
  }

  catchThought(id: number): boolean {
    const th = this.thoughts.find((t) => t.id === id);
    if (!th || th.caught) return false;
    th.caught = true;
    this.thoughtScore++;
    this.thoughtCombo++;
    this.events.onThoughtScore(this.thoughtScore, this.thoughtCombo, this.thoughtMisses);
    window.setTimeout(() => {
      this.thoughts = this.thoughts.filter((t) => t.id !== id);
      this.events.onThoughtGone(id, true);
    }, 220);
    return true;
  }

  private spawnThought(t: number) {
    const dir = new THREE.Vector3();
    this.randomDirection(dir);
    const pos = dir.clone().multiplyScalar(1.5 + this.rand() * 1.8);
    const vel = dir.clone().multiplyScalar(0.5 + this.rand() * 0.5);
    // difficulty ramps with score: shorter life, tighter spacing, floor out
    const lifeBase = Math.max(2.6, 5.2 - this.thoughtScore * 0.09);
    const id = this.thoughtIdSeq++;
    this.thoughts.push({
      id,
      phrase: this.nextPhrase(),
      pos,
      vel,
      bornAt: t,
      life: lifeBase + this.rand() * 1.2,
      phase: this.rand() * 100,
      el: null,
      caught: false,
    });
    this.events.onThoughtSpawn(id, this.thoughts[this.thoughts.length - 1].phrase);
    const interval = Math.max(0.85, 1.9 - this.thoughtScore * 0.035);
    this.thoughtSpawnAt = t + interval * (0.75 + this.rand() * 0.5);
  }

  private updateThoughtGame(dt: number, t: number) {
    if (this.thoughtActive && t >= this.thoughtSpawnAt) this.spawnThought(t);

    const w = window.innerWidth;
    const h = window.innerHeight;
    const proj = new THREE.Vector3();
    for (const th of [...this.thoughts]) {
      if (th.caught) {
        if (th.el) {
          th.el.style.opacity = "1";
          th.el.classList.add("caught");
        }
        continue;
      }
      const age = t - th.bornAt;
      if (this.thoughtActive && age > th.life) {
        this.thoughts = this.thoughts.filter((x) => x.id !== th.id);
        this.thoughtCombo = 0;
        this.thoughtMisses++;
        this.events.onThoughtGone(th.id, false);
        this.events.onThoughtScore(this.thoughtScore, this.thoughtCombo, this.thoughtMisses);
        if (this.thoughtMisses >= 3) {
          this.thoughtActive = false;
          this.events.onThoughtGameOver(this.thoughtScore);
          window.setTimeout(() => this.stopThoughtGame(), 50);
        }
        continue;
      }

      th.vel.x += Math.sin(t * 0.6 + th.phase) * 0.25 * dt;
      th.vel.y += Math.cos(t * 0.45 + th.phase * 1.4) * 0.25 * dt;
      th.vel.z += Math.sin(t * 0.5 + th.phase * 0.7) * 0.25 * dt;
      th.vel.multiplyScalar(1 - Math.min(dt * 0.5, 0.9));
      th.pos.addScaledVector(th.vel, dt);

      if (!th.el) continue;
      proj.copy(th.pos).project(this.camera);
      const behind = proj.z > 1;
      const x = (proj.x * 0.5 + 0.5) * w;
      const y = (-proj.y * 0.5 + 0.5) * h;
      th.el.style.transform = `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      const fadeIn = Math.min(age / 0.35, 1);
      const fadeOut = 1 - Math.max(0, (age - (th.life - 0.8)) / 0.8);
      th.el.style.opacity = behind ? "0" : Math.min(fadeIn, fadeOut).toFixed(3);
      th.el.style.pointerEvents = behind ? "none" : "auto";
    }
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
    this.clearMotes();
    this.stopThoughtGame();
    for (const m of this.loadedModels) this.disposeObject(m);
    this.envRT?.dispose();
    this.renderer.dispose();
  }

  // ------------------------------------------------------------------ loop

  /** Adaptive quality: trade pixel ratio for frame rate, both directions. */
  private updateQuality(dt: number) {
    this.fpsFrames++;
    this.fpsAcc += dt;
    if (this.fpsAcc < 1) return;
    const fps = this.fpsFrames / this.fpsAcc;
    this.fpsFrames = 0;
    this.fpsAcc = 0;
    if (fps < 45) {
      this.fpsLowStreak++;
      this.fpsHighStreak = 0;
    } else if (fps > 57) {
      this.fpsHighStreak++;
      this.fpsLowStreak = 0;
    } else {
      this.fpsLowStreak = 0;
      this.fpsHighStreak = 0;
    }
    if (this.fpsLowStreak >= 3 && this.dprCurrent > 0.75) {
      this.dprCurrent = Math.max(0.75, this.dprCurrent * 0.85);
      this.applyPixelRatio();
      this.fpsLowStreak = 0;
    } else if (this.fpsHighStreak >= 8 && this.dprCurrent < this.dprCap) {
      this.dprCurrent = Math.min(this.dprCap, this.dprCurrent * 1.12);
      this.applyPixelRatio();
      this.fpsHighStreak = 0;
    }
  }

  private applyPixelRatio() {
    this.renderer.setPixelRatio(this.dprCurrent);
    this.composer.setSize(window.innerWidth, window.innerHeight);
    this.coreMat.uniforms.uPixelRatio.value = this.dprCurrent;
    this.dustMat.uniforms.uPixelRatio.value = this.dprCurrent;
  }

  private loop = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;
    this.updateQuality(dt);

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
      this.calmed || this.drowsy ? 0.1 : this.timeScaleBase,
      0.04
    );
    this.dustMat.uniforms.uTime.value = t;
    this.bloom.strength += (this.bloomTarget - this.bloom.strength) * 0.03;

    // -- Restore the Mind game (no-op unless active or resolving)
    if (this.restoreActive || this.motes.length) this.updateRestoreGame(dt, t);

    // -- Catch the Thought game (no-op unless active or resolving)
    if (this.thoughtActive || this.thoughts.length) this.updateThoughtGame(dt, t);

    // -- dropped gravity wells: decay strength, drop expired ones, sync uniforms
    if (this.wells.length) {
      this.wells = this.wells.filter((w) => t - w.bornAt < MindScene.WELL_LIFE);
    }
    for (let i = 0; i < MindScene.MAX_WELLS; i++) {
      const w = this.wells[i];
      if (w) {
        const age = t - w.bornAt;
        this.wellPosUniform[i].copy(w.pos);
        this.wellStrengthUniform[i] =
          Math.sin(Math.min(age / 0.6, 1) * Math.PI * 0.5) *
          Math.exp(-age / (MindScene.WELL_LIFE * 0.45));
      } else {
        this.wellStrengthUniform[i] = 0;
      }
    }

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

    // -- billboard artifacts (the iris): follow the node, face the camera,
    // spin on their own axis; tumble artifacts ride the cage and need nothing here
    for (const b of this.billboards) {
      b.holder.position.copy(b.visual.glow.position);
      b.spin += dt * (0.5 + b.visual.hoverT * 2.2);
      b.holder.quaternion.copy(this.camera.quaternion);
      b.holder.rotateZ(b.spin);
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
      // gyroscope parallax (touch devices): tilt shifts the viewpoint slightly
      this.gyro.x = THREE.MathUtils.lerp(this.gyro.x, this.gyro.tx, 0.05);
      this.gyro.y = THREE.MathUtils.lerp(this.gyro.y, this.gyro.ty, 0.05);
      this.camera.position.x += this.gyro.x;
      this.camera.position.y += this.gyro.y;
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
