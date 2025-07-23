import { Grid, PerspectiveCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useState } from 'react'
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

// Initial spawn position for the player (entrance)
const spawnPosition = new THREE.Vector3(-150, 1.8, -250);

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
        shadows={false}
        gl={{ 
          antialias: false,
          alpha: false,
          powerPreference: 'high-performance',
          precision: 'lowp',
          depth: true,
          stencil: false
        }}
        performance={{ min: 0.2 }}
        dpr={[0.5, 1]}
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
          {/* Remove CustomLighting, Entrance, DynamicReflection, NightDustParticles for perf */}
          <GalleryRoom />
          <PlayerController 
            onLock={handleLock} 
            onUnlock={handleUnlock} 
            onFallback={handleUseFallbackControls}
            onPause={handleTogglePause}
          />
          <Grid
            position={[0, 0.01, 0]}
            args={[200, 200]}
            cellSize={20}
            cellThickness={0.5}
            cellColor="#2196f3"
            sectionSize={100}
            sectionThickness={1}
            sectionColor="#64b5f6"
            fadeDistance={200}
            infiniteGrid={false}
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