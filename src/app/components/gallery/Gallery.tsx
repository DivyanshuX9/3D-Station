import { Grid, PerspectiveCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
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

// Animated 3D-styled logo for entry
const AnimatedLogo = () => {
  const logoRef = useRef<HTMLDivElement>(null)
  return (
    <div
      ref={logoRef}
      className="mb-6 flex flex-col items-center select-none"
      style={{
        perspective: '600px',
        userSelect: 'none',
      }}
    >
      <span
        className="text-6xl font-extrabold tracking-tight text-blue-400 drop-shadow-lg"
        style={{
          transform: 'rotateX(18deg) rotateY(-12deg) scale(1.1)',
          letterSpacing: '0.05em',
          textShadow: '0 8px 32px #1e3a8a, 0 1px 0 #fff',
        }}
      >
        3D-Station
      </span>
      <span className="text-lg text-blue-200 mt-2 tracking-widest animate-pulse">
        Immersive Virtual Gallery
      </span>
    </div>
  )
}

// Animated background for entry screen
const EntryBackground = () => (
  <div
    className="absolute inset-0 z-0 animate-gradient-x bg-gradient-to-br from-blue-900 via-indigo-800 to-blue-400 opacity-80"
    style={{
      backgroundSize: '200% 200%',
      filter: 'blur(2px)',
    }}
  />
)

export const Gallery = () => {
  const [isLocked, setIsLocked] = useState(false)
  const [useFallbackControls, setUseFallbackControls] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)
  const [speedMultiplier, setSpeedMultiplier] = useState(1)

  // Handle mouse wheel to adjust sprint speed
  const handleWheel = useCallback((e: WheelEvent) => {
    setSpeedMultiplier(prev => {
      let next = prev + (e.deltaY < 0 ? 0.1 : -0.1)
      next = Math.max(1, Math.min(4, next))
      return Math.round(next * 10) / 10
    })
  }, [])

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

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
      {/* Speed slider is now in the pause menu */}
      
      {showInstructions && (
        <>
          <EntryBackground />
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center z-10 transition-opacity duration-500"
          >
            <AnimatedLogo />
            <p className="text-white mb-8 text-center max-w-md text-lg drop-shadow">
              Click Start to explore this immersive gallery.<br/>
              Use <b>WASD</b> to move, <b>SPACE</b> to jump, <b>ESC</b> to pause.
            </p>
            <button
              onClick={handleStartClick}
              className={`px-8 py-4 text-lg font-bold shadow-xl border-2 border-blue-400 rounded-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 text-white ${
                isReady 
                  ? 'hover:scale-105 cursor-pointer' 
                  : 'bg-gray-600 cursor-not-allowed opacity-60'
              }`}
              disabled={!isReady}
            >
              {isReady ? 'Enter 3D-Station' : (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-4 border-blue-300 border-t-transparent rounded-full animate-spin" />
                  Loading...
                </span>
              )}
            </button>
          </div>
        </>
      )}
      
      {/* Sprint speed indicator at top center */}
      <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-black/70 text-white px-4 py-1 rounded-full text-xs font-mono shadow">
        Sprint Speed: {(speedMultiplier * 5).toFixed(1)}x (Scroll to adjust)
      </div>
      
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
            speedMultiplier={speedMultiplier}
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
            <p>WASD to move, Shift to sprint (5x faster or more)</p>
            <p>Space to jump,Scroll to adjust sprint speed, ESC to pause</p>
          </>
        )}
      </div>
    </div>
  )
} 