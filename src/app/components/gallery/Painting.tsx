import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

interface PaintingProps {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  type: string
  title: string
  description: string
}

export const Painting = ({ position, rotation, scale, type, title, description }: PaintingProps) => {
  const meshRef = useRef<THREE.Mesh>(null)

  // Simple subtle animation
  useFrame((state) => {
    if (meshRef.current) {
      // Add a slight breathing effect
      meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime()) * 0.02
    }
  })

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Frame */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[1.1, 1.6, 0.1]} />
        <meshStandardMaterial color={0xA67C52} roughness={0.5} emissive={0x553311} emissiveIntensity={0.3} />
      </mesh>
      
      {/* Painting canvas */}
      <mesh ref={meshRef}>
        <planeGeometry args={[1, 1.5]} />
        <meshStandardMaterial 
          color={0xFFFFFF} 
          roughness={0.1}
          metalness={0.1}
          emissive={0xFFFFFF}
          emissiveIntensity={0.4}
          userData={{ type }}
        />
      </mesh>
      
      {/* Plaque */}
      <mesh position={[0, -0.85, 0.1]}>
        <planeGeometry args={[0.8, 0.2]} />
        <meshStandardMaterial color={0xF5F5DC} metalness={0.3} roughness={0.2} emissive={0xF5F5DC} emissiveIntensity={0.2} />
        
        <Html position={[0, 0, 0.1]} center transform scale={0.05}>
          <div style={{ 
            width: '300px', 
            textAlign: 'center', 
            background: 'rgba(255, 255, 255, 0.9)', 
            color: '#000',
            fontFamily: 'serif',
            padding: '10px',
            borderRadius: '5px',
            boxShadow: '0 0 10px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{title}</h2>
            <p style={{ margin: '5px 0 0 0', fontSize: '16px' }}>{description}</p>
          </div>
        </Html>
      </mesh>
      
      {/* Add a small spotlight to illuminate the painting */}
      <pointLight
        position={[0, 0, 1]}
        intensity={2}
        color={0xFFFFDD}
        distance={3}
        decay={1}
      />
    </group>
  )
} 