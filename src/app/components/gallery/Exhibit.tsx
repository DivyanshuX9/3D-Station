import { Html, Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import { useGalleryStore } from '../../store/galleryStore'

interface ExhibitProps {
  position: [number, number, number]
  title: string
  description: string
  type: 'skills' | 'about' | 'hobbies' | 'humor'
}

export const Exhibit = ({ position, title, description, type }: ExhibitProps) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [isHovered, setIsHovered] = useState(false)
  const { currentZone } = useGalleryStore()

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
    }
  })

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={currentZone === type ? '#4a90e2' : '#e0e0e0'}
          emissive={isHovered ? '#4a90e2' : '#000000'}
          emissiveIntensity={isHovered ? 0.5 : 0}
        />
      </mesh>

      <Text
        position={[0, 1.5, 0]}
        fontSize={0.2}
        color="#000000"
        anchorX="center"
        anchorY="middle"
      >
        {title}
      </Text>

      {isHovered && (
        <Html position={[0, 2, 0]}>
          <div className="bg-white/90 dark:bg-black/90 p-4 rounded-lg shadow-lg max-w-xs">
            <p className="text-sm">{description}</p>
          </div>
        </Html>
      )}
    </group>
  )
} 