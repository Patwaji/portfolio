import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
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
    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, x * 1.1, 4, 0.016);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, -y * 0.8, 4, 0.016);
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
      className="pointer-events-none absolute inset-0"
      dpr={[1, isMobile ? 1.3 : 2]}
      camera={{ position: [0, 0, 9], fov: 45 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#030308"]} />
      <fog attach="fog" args={["#030308", 10, 22]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[6, 4, 6]} intensity={40} color="#8b5cf6" />
      <pointLight position={[-6, -3, -4]} intensity={30} color="#22d3ee" />

      <MindCore />
      <ConstellationNodes />
      <ParticleField count={isMobile ? 500 : 1100} />
      <PointerRig pointer={pointer} enabled={!reducedMotion} />

      {!isMobile && (
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            intensity={0.7}
            mipmapBlur
          />
        </EffectComposer>
      )}
    </Canvas>
  );
}
