import { Html } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

interface PaintingProps {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  title: string
  description: string
}

export const Painting = ({ position, rotation, scale, title, description }: PaintingProps) => {
  // Memoize geometry and material
  const frameGeometry = useMemo(() => new THREE.BoxGeometry(1.1, 1.6, 0.1), [])
  const frameMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xA67C52, roughness: 0.5, emissive: 0x553311, emissiveIntensity: 0.3 }), [])
  const canvasGeometry = useMemo(() => new THREE.PlaneGeometry(1, 1.5), [])
  const canvasMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.1, metalness: 0.1, emissive: 0xFFFFFF, emissiveIntensity: 0.4 }), [])
  const plaqueGeometry = useMemo(() => new THREE.PlaneGeometry(0.8, 0.2), [])
  const plaqueMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xF5F5DC, metalness: 0.3, roughness: 0.2, emissive: 0xF5F5DC, emissiveIntensity: 0.2 }), [])

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Frame */}
      <mesh position={[0, 0, -0.05]} geometry={frameGeometry} material={frameMaterial} />
      {/* Painting canvas */}
      <mesh geometry={canvasGeometry} material={canvasMaterial} />
      {/* Plaque */}
      <mesh position={[0, -0.85, 0.1]} geometry={plaqueGeometry} material={plaqueMaterial}>
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
    </group>
  )
} 