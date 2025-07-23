import { useMemo, useRef } from 'react'
import * as THREE from 'three'

interface SculptureProps {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
}

export const Sculpture = ({ position, rotation, scale }: SculptureProps) => {
  const groupRef = useRef<THREE.Group>(null)

  // Memoize geometry and material
  const geometry = useMemo(() => new THREE.CylinderGeometry(1, 1.5, 4, 6), [])
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xd4c4a8,
    metalness: 0.8,
    roughness: 0.2,
    envMapIntensity: 1,
  }), [])

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Base */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[2, 2.5, 0.5, 8]} />
        <meshStandardMaterial
          color={0x8b7355}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      {/* Statue body */}
      <mesh>
        <primitive object={geometry} />
        <primitive object={material} />
      </mesh>
      {/* Plaque */}
      <mesh position={[0, -2.5, 0]}>
        <boxGeometry args={[3, 0.2, 1]} />
        <meshStandardMaterial color={0x4a4a4a} />
      </mesh>
    </group>
  )
} 