
"use client"

function GreenParticles() {
  const count = 200;
  const meshRef = useRef<THREE.Points>(null);
  // Spread particles over a larger area for a more immersive effect
  const spread = 18;
  const positions = Array.from({ length: count }, () => [
    (Math.random() - 0.5) * spread,
    (Math.random() - 0.5) * spread,
    (Math.random() - 0.5) * spread
  ]);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.07;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.04;
    }
  });
  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(positions.flat()), 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.13} color="#A3C9A8" transparent opacity={0.55} />
    </points>
  );
}

import { Canvas, useFrame, extend } from "@react-three/fiber"
import { useRef, useMemo } from "react"
import * as THREE from "three"

function RotatingWireframeCube({ color = "#A3C9A8", speed = 1, size = 4 }) {
  const group = useRef<THREE.Group>(null)
  const edges = useMemo(() => {
    const geometry = new THREE.BoxGeometry(size, size, size)
    return new THREE.EdgesGeometry(geometry)
  }, [size])
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.x = state.clock.elapsedTime * 0.5 * speed
      group.current.rotation.y = state.clock.elapsedTime * 0.7 * speed
    }
  })
  return (
    <group ref={group}>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#A3C9A8" opacity={1} transparent linewidth={4} />
      </lineSegments>
    </group>
  )
}

function RotatingWireframeInnerCube({ color = "#C7E8C5", speed = 0.5, size = 2.5 }) {
  const group = useRef<THREE.Group>(null)
  const edges = useMemo(() => {
    const geometry = new THREE.BoxGeometry(size, size, size)
    return new THREE.EdgesGeometry(geometry)
  }, [size])
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.x = state.clock.elapsedTime * 0.2 * speed
      group.current.rotation.y = state.clock.elapsedTime * 0.25 * speed
    }
  })
  return (
    <group ref={group}>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#A3C9A8" opacity={1} transparent linewidth={4} />
      </lineSegments>
    </group>
  )
}



export function Scene3D() {
  return (
    <div className="fixed inset-0 z-0" style={{ opacity: 0.6 }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.7} color="#A3C9A8" />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#C7E8C5" />
        <GreenParticles />
          <RotatingWireframeCube color="#d6ffe3" speed={1} size={3} />
          <RotatingWireframeInnerCube color="#eafff2" speed={0.5} size={3} />
      </Canvas>
    </div>
  )
}
