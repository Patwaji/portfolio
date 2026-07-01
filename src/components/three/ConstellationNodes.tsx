import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

const NODE_COUNT = 8;

export function ConstellationNodes() {
  const groupRef = useRef<THREE.Group>(null);
  const nodeRefs = useRef<(THREE.Mesh | null)[]>([]);

  const nodes = useMemo(() => {
    return Array.from({ length: NODE_COUNT }, (_, i) => {
      const radius = 3.4 + Math.random() * 2.3;
      const theta = (i / NODE_COUNT) * Math.PI * 2 + Math.random() * 0.6;
      const phi = Math.acos(2 * Math.random() - 1);
      const position = new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
      );
      return {
        position,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 0.8,
        color: i % 2 === 0 ? "#22d3ee" : "#c4b5fd",
      };
    });
  }, []);

  useFrame(({ clock }, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.035;
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.05) * 0.15;
    }
    const t = clock.getElapsedTime();
    nodes.forEach((n, i) => {
      const mesh = nodeRefs.current[i];
      if (!mesh) return;
      const s = 1 + Math.sin(t * n.speed + n.phase) * 0.35;
      mesh.scale.setScalar(s);
    });
  });

  return (
    <group ref={groupRef}>
      {nodes.map((n, i) => (
        <Line
          key={`line-${i}`}
          points={[[0, 0, 0], n.position.toArray()]}
          color={n.color}
          transparent
          opacity={0.18}
          lineWidth={1}
        />
      ))}
      {nodes.map((n, i) => (
        <mesh
          key={`node-${i}`}
          position={n.position}
          ref={(el) => {
            nodeRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.085, 16, 16]} />
          <meshBasicMaterial color={n.color} />
        </mesh>
      ))}
    </group>
  );
}
