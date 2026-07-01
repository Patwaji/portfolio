import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

export function MindCore() {
  const wireRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (wireRef.current) {
      wireRef.current.rotation.y += delta * 0.1;
      wireRef.current.rotation.x += delta * 0.03;
    }
  });

  return (
    <Float speed={1.1} rotationIntensity={0.35} floatIntensity={0.8}>
      <mesh>
        <icosahedronGeometry args={[1.5, 4]} />
        <MeshDistortMaterial
          color="#b8502f"
          distort={0.28}
          speed={1.2}
          roughness={0.85}
          metalness={0}
        />
      </mesh>
      <mesh ref={wireRef}>
        <icosahedronGeometry args={[1.92, 1]} />
        <meshBasicMaterial color="#1c1a17" wireframe transparent opacity={0.18} />
      </mesh>
    </Float>
  );
}
