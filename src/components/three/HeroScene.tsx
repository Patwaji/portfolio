import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { ParticleField } from "./ParticleField";
import { MindCore } from "./MindCore";
import { ConstellationNodes } from "./ConstellationNodes";
import { useIsMobile, usePrefersReducedMotion } from "../../hooks/useMediaQuery";

type PointerPos = { current: { x: number; y: number } };

function PointerRig({ pointer, enabled }: { pointer: PointerPos; enabled: boolean }) {
  useFrame((state) => {
    if (!enabled) return;
    const { x, y } = pointer.current;
    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, x * 0.6, 4, 0.016);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, -y * 0.4, 4, 0.016);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export function HeroScene() {
  const pointer = useRef({ x: 0, y: 0 });
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const handleMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, [reducedMotion]);

  return (
    <Canvas
      className="pointer-events-none h-full w-full"
      dpr={[1, isMobile ? 1.3 : 2]}
      camera={{ position: [0, 0, 9], fov: 40 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#fbf8f2"]} />
      <fog attach="fog" args={["#fbf8f2", 11, 20]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 6, 6]} intensity={1.1} color="#fff8ec" />
      <pointLight position={[-5, -3, -3]} intensity={12} color="#b8502f" />

      <MindCore />
      <ConstellationNodes />
      <ParticleField count={isMobile ? 350 : 650} />
      <PointerRig pointer={pointer} enabled={!reducedMotion} />

      {!isMobile && (
        <EffectComposer>
          <Vignette eskil={false} offset={0.15} darkness={0.6} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
