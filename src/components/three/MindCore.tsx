import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

export function MindCore() {
  const wireRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (wireRef.current) {
      wireRef.current.rotation.y += delta * 0.15;
      wireRef.current.rotation.x += delta * 0.05;
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={0.5} floatIntensity={1.1}>
      <mesh>
        <icosahedronGeometry args={[1.5, 4]} />
        <MeshDistortMaterial
          color="#8b5cf6"
          emissive="#6d28d9"
          emissiveIntensity={0.5}
          distort={0.35}
          speed={1.8}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>
      <mesh ref={wireRef}>
        <icosahedronGeometry args={[1.95, 1]} />
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.22} />
      </mesh>
    </Float>
  );
}
