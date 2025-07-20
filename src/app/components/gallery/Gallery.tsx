import { Grid, PerspectiveCamera } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { LoadingScreen } from '../ui/LoadingScreen'
import { GalleryRoom } from './GalleryRoom'
import { PlayerController } from './PlayerController'

// Add global type definitions for window functions
declare global {
  interface Window {
    __initializePlayerControls?: () => void;
    __appendTouchControls?: () => void;
  }
}

// Add environment mapping for reflections
const DynamicReflection = () => {
  
  return (
    <mesh visible={false}>
      <sphereGeometry args={[500, 64, 64]} />
      <meshBasicMaterial color="#87ceeb" side={THREE.BackSide} />
    </mesh>
  );
};

// Initial spawn position for the player (entrance)
const spawnPosition = new THREE.Vector3(-150, 1.8, -250);

// Simple color-based sky component instead of using Environment
const CustomSky = () => {
  const skyColor = '#87ceeb';
  
  return (
    <color attach="background" args={[skyColor]} />
  );
};

// Custom fog that changes based on night mode
const CustomFog = () => {
  const fogColor = '#c0c0c0';
  const fogDensity = 0.002;
  
  return (
    <fogExp2 args={[fogColor, fogDensity]} />
  );
};

// Custom lighting that changes based on night mode
const CustomLighting = () => {
  
  return (
    <>
      <ambientLight 
        intensity={1} 
        color="#fff" 
      />
      
      <directionalLight
          position={[10, 10, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-100}
          shadow-camera-right={100}
          shadow-camera-top={100}
          shadow-camera-bottom={-100}
        />
      
      {/* Add a subtle blue moonlight in night mode */}
      {/* This block is removed as per the edit hint */}
      
      {/* Add subtle rim light to highlight silhouettes */}
      {/* This block is removed as per the edit hint */}
    </>
  );
};

// Entrance component for the gallery
const Entrance = () => {
  
  return (
    <group position={spawnPosition.toArray()}>
      {/* Entrance platform */}
      <mesh position={[0, -1, 0]} receiveShadow>
        <boxGeometry args={[30, 2, 30]} />
        <meshStandardMaterial 
          color="#888"
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>
      
      {/* Entrance light */}
      <pointLight
        position={[0, 5, 0]}
        intensity={2}
        color="#ffffff"
        distance={30}
        castShadow
      />
      
      {/* Welcome sign */}
      <mesh position={[0, 3, -10]} rotation={[0, 0, 0]}>
        <planeGeometry args={[15, 5]} />
        <meshStandardMaterial
          color="#4477aa"
          emissive="#000000"
          emissiveIntensity={0}
        />
      </mesh>
    </group>
  );
};

// Night mode dust particles effect
const NightDustParticles = () => {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Create particles only once and with reduced count
  const particles = useMemo(() => {
    
    const particleCount = 100; // Reduced from 200
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      // Distribute particles in a large volume
      positions[i * 3] = (Math.random() - 0.5) * 800;
      positions[i * 3 + 1] = Math.random() * 150 + 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 800;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);
  
  // Animate dust particles
  useFrame((state) => {
    if (pointsRef.current) {
      // Slow rotation
      pointsRef.current.rotation.y += 0.0002;
      
      // Subtle up and down motion
      const time = state.clock.getElapsedTime();
      pointsRef.current.position.y = Math.sin(time * 0.05) * 2;
    }
  });
  
  // Only render if in night mode and particles are created
  if (!particles) return null;
  
  return (
    <points ref={pointsRef}>
      <primitive object={particles} />
      <pointsMaterial
        size={0.6}
        color="#5555ff"
        transparent
        opacity={0.15}
      />
    </points>
  );
};

export const Gallery = () => {
  const [isLocked, setIsLocked] = useState(false)
  const [useFallbackControls, setUseFallbackControls] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)

  // Wait for everything to load before allowing start interaction
  useEffect(() => {
    // Small delay to ensure everything is properly loaded
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 800)
    
    return () => clearTimeout(timer)
  }, [])

  // Effect to show/hide instructions based on lock state
  useEffect(() => {
    if (!isLocked && !isPaused) {
      setShowInstructions(true)
    }
  }, [isLocked, isPaused])

  const handleStartClick = () => {
    if (!isReady) return
    
    // First hide instructions, this ensures the UI won't disappear before user interaction
    setShowInstructions(false)
    
    // After a brief delay to handle UI animation, set isLocked and initialize controls
    setTimeout(() => {
      setIsLocked(true)
      
      // Initialize controls after UI change
      if (typeof window !== 'undefined') {
        if (window.__initializePlayerControls) {
          window.__initializePlayerControls()
        }
        
        // Initialize touch controls if available and on mobile
        if (window.__appendTouchControls && 'ontouchstart' in window) {
          window.__appendTouchControls()
        }
      }
    }, 100)
  }

  const handleLock = () => {
    setIsLocked(true)
  }

  const handleUnlock = () => {
    // Only unlock if we're not paused
    if (!isPaused) {
      setIsLocked(false)
      setShowInstructions(true)
    }
  }

  // Handle fallback to orbit controls when pointer lock fails
  const handleUseFallbackControls = () => {
    setUseFallbackControls(true)
    setIsLocked(true)
  }

  const handleTogglePause = (paused: boolean) => {
    setIsPaused(paused)
  }

  return (
    <div className="w-full h-screen relative">
      {showInstructions && (
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 transition-opacity duration-500"
        >
          <h1 className="text-white text-4xl mb-4 font-bold">Modern Art Gallery</h1>
          <p className="text-white mb-8 text-center max-w-md">
            Click Start to explore this immersive gallery.<br/>
            Use WASD to move, SPACE to jump, ESC to pause.<br/>
            Click the moon icon to toggle night mode.
          </p>
          <button
            onClick={handleStartClick}
            className={`px-8 py-4 text-lg ${
              isReady 
                ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' 
                : 'bg-gray-600 cursor-not-allowed'
            } text-white rounded-lg transition-colors duration-300 shadow-lg`}
            disabled={!isReady}
          >
            {isReady ? 'Enter Gallery' : 'Loading...'}
          </button>
        </div>
      )}
      
      {isPaused && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-white text-2xl mb-4 font-bold">Gallery Paused</h2>
            <p className="text-white mb-6">Press ESC to resume exploration</p>
          </div>
        </div>
      )}
      
      {/* Night Mode Toggle */}
      {/* This component is removed as per the edit hint */}
      
      <Canvas 
        shadows={{ 
          type: THREE.PCFSoftShadowMap,
          enabled: true
        }}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          precision: 'lowp',
          depth: true,
          stencil: false
        }}
        performance={{ min: 0.5 }}
        dpr={[0.8, 1.5]}
      >
        <Suspense fallback={<LoadingScreen />}>
          <PerspectiveCamera 
            makeDefault 
            position={spawnPosition.toArray()} 
            fov={75}
            near={0.1}
            far={1000}
          />
          <CustomFog />
          <CustomSky />
          <CustomLighting />
          <GalleryRoom />
          <Entrance />
          <PlayerController 
            onLock={handleLock} 
            onUnlock={handleUnlock} 
            onFallback={handleUseFallbackControls}
            onPause={handleTogglePause}
          />
          <DynamicReflection />
          <NightDustParticles />
          <Grid
            position={[0, 0.01, 0]}
            args={[1000, 1000]}
            cellSize={20}
            cellThickness={0.5}
            cellColor="#2196f3"
            sectionSize={100}
            sectionThickness={1}
            sectionColor="#64b5f6"
            fadeDistance={1000}
            infiniteGrid={true}
          />
        </Suspense>
      </Canvas>
      <div className="absolute bottom-5 left-5 text-white bg-black/70 p-3 rounded">
        {useFallbackControls ? (
          <>
            <h3 className="font-bold mb-1">Orbit Controls Mode:</h3>
            <p>WASD to move, Shift to sprint</p>
            <p>Mouse drag to look around, Mouse wheel to zoom</p>
          </>
        ) : (
          <>
            <h3 className="font-bold mb-1">First Person Controls:</h3>
            <p>WASD to move, Shift to sprint (5x faster)</p>
            <p>Space to jump, ESC to pause</p>
          </>
        )}
      </div>
    </div>
  )
} 