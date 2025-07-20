import { OrbitControls, PointerLockControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls as OrbitControlsImpl, PointerLockControls as PointerLockControlsImpl } from 'three-stdlib'
import { useSoundManager } from '../../hooks/useSoundManager'

// Add explicit type definition for window global functions
declare global {
  interface Window {
    __initializePlayerControls?: () => void;
    __appendTouchControls?: () => void;
  }

  // Add vendor prefixes for pointer lock (for TypeScript)
  interface Document {
    mozPointerLockElement?: Element;
    webkitPointerLockElement?: Element;
  }
}

interface PlayerControllerProps {
  onLock?: () => void;
  onUnlock?: () => void;
  onFallback?: () => void;
  onPause?: (paused: boolean) => void;
}

export const PlayerController = ({ onLock, onUnlock, onFallback, onPause }: PlayerControllerProps = {}) => {
  // Use correct typing for refs
  const controlsRef = useRef<PointerLockControlsImpl>(null)
  const orbitControlsRef = useRef<OrbitControlsImpl>(null)
  
  // Movement physics
  const velocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())
  
  // State management
  const [useOrbitControls, setUseOrbitControls] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  
  // Movement state
  const moveForward = useRef(false)
  const moveBackward = useRef(false)
  const moveLeft = useRef(false)
  const moveRight = useRef(false)
  
  // Jump physics
  const canJump = useRef(true)
  const jumpTimer = useRef<number | null>(null)
  const verticalVelocity = useRef(0)
  const isOnGround = useRef(true)
  
  // Position tracking
  const playerHeight = 1.8
  const walkingSpeed = 900.0  // 4x increase from 25.0
  const runningSpeed = 1800.0  // 5x increase from 80.0
  const spawnPosition = new THREE.Vector3(-150, playerHeight, -250)
  const lastPosition = useRef(new THREE.Vector3().copy(spawnPosition))
  const isMoving = useRef(false)
  const movementTime = useRef(0)
  const isSprinting = useRef(false)
  
  // Room dimensions
  const roomHeight = 160
  const roomWidth = 400
  const roomLength = 600
  
  // Collision detection
  const playerRadius = 5 // Player collision radius
  // const playerCollider = useRef(new THREE.Box3())  // Removing unused variable
  const objectColliders = useRef<THREE.Box3[]>([])
  
  // Track the ground status with raycasting
  const raycaster = useRef(new THREE.Raycaster())
  const downDirection = new THREE.Vector3(0, -1, 0)
  const groundCheckDistance = 2.5 // How far down to check for ground
  
  // Add a ref for the camera's current euler rotation to prevent flipping
  const eulerRotation = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  const prevMouseMovement = useRef({x: 0, y: 0})
  
  // Access to three.js objects
  const { camera, scene } = useThree()
  
  // Access sound effects
  const { playFootstep } = useSoundManager()
  
  // Set up camera and initialize controls
  useEffect(() => {
    // Position camera at spawn point
    camera.position.copy(spawnPosition)
    
    // Check for Pointer Lock API support
    const isPointerLockSupported = 
      'pointerLockElement' in document || 
      'mozPointerLockElement' in document || 
      'webkitPointerLockElement' in document
    
    // Fall back to orbit controls if pointer lock not supported
    if (!isPointerLockSupported) {
      console.warn("Pointer Lock API not supported, using OrbitControls fallback")
      setUseOrbitControls(true)
      if (onFallback) onFallback()
      return
    }
    
    // Set up error listeners for pointer lock
    const lockErrorHandler = () => {
      console.warn("Pointer Lock API error detected")
      setUseOrbitControls(true)
      if (onFallback) onFallback()
    }
    
    document.addEventListener('pointerlockerror', lockErrorHandler)
    document.addEventListener('mozpointerlockerror', lockErrorHandler)
    document.addEventListener('webkitpointerlockerror', lockErrorHandler)
    
    return () => {
      document.removeEventListener('pointerlockerror', lockErrorHandler)
      document.removeEventListener('mozpointerlockerror', lockErrorHandler)
      document.removeEventListener('webkitpointerlockerror', lockErrorHandler)
      
      // Clear any jump timeout when component unmounts
      if (jumpTimer.current !== null) {
        window.clearTimeout(jumpTimer.current)
      }
    }
  }, [camera, onFallback])
  
  // Set up controls event listeners
  useEffect(() => {
    if (!useOrbitControls && controlsRef.current) {
      // Create a custom mouse movement handler
      const onMouseMove = (event: MouseEvent) => {
        if (!controlsRef.current?.isLocked) return;
        
        const movementX = event.movementX || 0;
        const movementY = event.movementY || 0;
        
        // Ignore extreme mouse movements that could cause flipping
        if (Math.abs(movementX) > 50 || Math.abs(movementY) > 50) return;
        
        // Store raw movements for verification
        prevMouseMovement.current = { x: movementX, y: movementY };
        
        // Get the camera object
        const cameraObject = controlsRef.current.getObject();
        
        // Update the euler rotation with limits on pitch (vertical rotation)
        eulerRotation.current.setFromQuaternion(cameraObject.quaternion);
        eulerRotation.current.y -= movementX * 0.002;
        eulerRotation.current.x -= movementY * 0.002;
        
        // Clamp the vertical rotation to prevent flipping (stricter limits)
        const maxPitch = Math.PI / 2 * 0.89; // 80 degrees to prevent flipping issues
        eulerRotation.current.x = Math.max(-maxPitch, Math.min(maxPitch, eulerRotation.current.x));
        
        // Apply the rotation to the camera
        cameraObject.quaternion.setFromEuler(eulerRotation.current);
      };
      
      // Add event listener for mouse movement
      document.addEventListener('mousemove', onMouseMove);
      
      const lockChangeHandler = () => {
        if (document.pointerLockElement || 
            document.mozPointerLockElement || 
            document.webkitPointerLockElement) {
          // Pointer is locked - user is controlling
          if (onLock) onLock()
          setIsInitialized(true)
        } else {
          // Pointer is unlocked - user has exited control
          if (!isPaused && onUnlock) onUnlock()
        }
      }
      
      // Handle lock/unlock via document events
      document.addEventListener('pointerlockchange', lockChangeHandler)
      document.addEventListener('mozpointerlockchange', lockChangeHandler)
      document.addEventListener('webkitpointerlockchange', lockChangeHandler)
      
      return () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('pointerlockchange', lockChangeHandler)
        document.removeEventListener('mozpointerlockchange', lockChangeHandler)
        document.removeEventListener('webkitpointerlockchange', lockChangeHandler)
      }
    }
  }, [onLock, onUnlock, useOrbitControls, isPaused])
  
  // Initialize controls when user explicitly starts the experience
  const initializeControls = () => {
    if (controlsRef.current && !useOrbitControls) {
      try {
        // Set proper camera position before locking
        camera.position.copy(spawnPosition)
        
        // Lock controls
        controlsRef.current.lock()
      } catch (error) {
        console.error("Failed to lock pointer:", error)
        setUseOrbitControls(true)
        if (onFallback) onFallback()
      }
    }
  }
  
  // Expose the initialization function to parent components
  useEffect(() => {
    window.__initializePlayerControls = initializeControls
    
    return () => {
      window.__initializePlayerControls = undefined
    }
  }, [])
  
  // Build collision shapes for the gallery
  useEffect(() => {
    // Position the camera at spawn point
    camera.position.copy(spawnPosition)
    
    // Set target for orbit controls
    if (useOrbitControls && orbitControlsRef.current) {
      orbitControlsRef.current.target.set(spawnPosition.x, playerHeight, spawnPosition.z)
    }
    
    // Create colliders for the scene
    const tempColliders: THREE.Box3[] = []
    
    // Find glass display cases for collision detection
    scene.traverse((object) => {
      if (object.userData && object.userData.type === 'glass-case') {
        const box = new THREE.Box3().setFromObject(object)
        tempColliders.push(box)
      }
    })
    
    // Add pedestal colliders
    Array.from({ length: 5 }).forEach((_, i) => {
      const row = Math.floor(i / 3)
      const col = i % 3
      const sectionWidth = roomWidth / 4
      const sectionLength = roomLength / 4
      
      const x = (col - 1) * sectionWidth * 1.2
      const z = (row - 1) * sectionLength * 1.2
      
      const caseSize = 25 // Slightly larger for better collision
      const caseBox = new THREE.Box3(
        new THREE.Vector3(x - caseSize/2, 0, z - caseSize/2),
        new THREE.Vector3(x + caseSize/2, 30, z + caseSize/2)
      )
      tempColliders.push(caseBox)
    })
    
    // Add central pillar colliders
    Array.from({ length: 6 }).forEach((_, i) => {
      // Get same pillar positions as in GalleryRoom
      const pillarOffsetFromWall = 30
      const totalWidth = roomWidth - (pillarOffsetFromWall * 2)
      const totalLength = roomLength - (pillarOffsetFromWall * 2)
      
      const cols = 3
      const rows = 2
      
      const colSpacing = totalWidth / (cols - 1)
      const rowSpacing = totalLength / (rows - 1)
      
      const col = i % 3
      const row = Math.floor(i / 3)
      
      const x = (col * colSpacing) - (totalWidth / 2)
      const z = (row * rowSpacing) - (totalLength / 2)
      
      const pillarRadius = 15 // Slightly larger for better collision
      const pillarBox = new THREE.Box3(
        new THREE.Vector3(x - pillarRadius, 0, z - pillarRadius),
        new THREE.Vector3(x + pillarRadius, roomHeight, z + pillarRadius)
      )
      tempColliders.push(pillarBox)
    })
    
    // Add wall pillar colliders
    Array.from({ length: 5 }).forEach((_, i) => {
      const x = (i - 2) * 80
      
      // Front wall pillars
      const frontBox = new THREE.Box3(
        new THREE.Vector3(x - 10, 0, -roomLength/2),
        new THREE.Vector3(x + 10, roomHeight, -roomLength/2 + 20)
      )
      tempColliders.push(frontBox)
      
      // Back wall pillars
      const backBox = new THREE.Box3(
        new THREE.Vector3(x - 10, 0, roomLength/2 - 20),
        new THREE.Vector3(x + 10, roomHeight, roomLength/2)
      )
      tempColliders.push(backBox)
    })
    
    // Central column colliders
    Array.from({ length: 3 }).forEach((_, i) => {
      const x = roomWidth / 4 * (i - 1)
      
      const columnRadius = 8
      const columnBox = new THREE.Box3(
        new THREE.Vector3(x - columnRadius, 0, -columnRadius),
        new THREE.Vector3(x + columnRadius, roomHeight, columnRadius)
      )
      tempColliders.push(columnBox)
    })
    
    // Room boundary colliders - create thick walls
    // Floor - extends below the visible floor
    tempColliders.push(new THREE.Box3(
      new THREE.Vector3(-roomWidth/2 - 20, -20, -roomLength/2 - 20),
      new THREE.Vector3(roomWidth/2 + 20, 0, roomLength/2 + 20)
    ))
    
    // Walls with thickness
    const wallThickness = 10
    
    // Left wall
    tempColliders.push(new THREE.Box3(
      new THREE.Vector3(-roomWidth/2 - wallThickness, 0, -roomLength/2 - wallThickness),
      new THREE.Vector3(-roomWidth/2, roomHeight, roomLength/2 + wallThickness)
    ))
    
    // Right wall
    tempColliders.push(new THREE.Box3(
      new THREE.Vector3(roomWidth/2, 0, -roomLength/2 - wallThickness),
      new THREE.Vector3(roomWidth/2 + wallThickness, roomHeight, roomLength/2 + wallThickness)
    ))
    
    // Front wall
    tempColliders.push(new THREE.Box3(
      new THREE.Vector3(-roomWidth/2 - wallThickness, 0, -roomLength/2 - wallThickness),
      new THREE.Vector3(roomWidth/2 + wallThickness, roomHeight, -roomLength/2)
    ))
    
    // Back wall
    tempColliders.push(new THREE.Box3(
      new THREE.Vector3(-roomWidth/2 - wallThickness, 0, roomLength/2),
      new THREE.Vector3(roomWidth/2 + wallThickness, roomHeight, roomLength/2 + wallThickness)
    ))
    
    // Ceiling
    tempColliders.push(new THREE.Box3(
      new THREE.Vector3(-roomWidth/2 - wallThickness, roomHeight, -roomLength/2 - wallThickness),
      new THREE.Vector3(roomWidth/2 + wallThickness, roomHeight + wallThickness, roomLength/2 + wallThickness)
    ))
    
    // Save all colliders
    objectColliders.current = tempColliders
    
  }, [camera, scene, spawnPosition, playerHeight, useOrbitControls, roomHeight, roomWidth, roomLength])
  
  // Handle key events for navigation and pause
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Handle pause
      if (event.code === 'Escape') {
        const newPausedState = !isPaused
        setIsPaused(newPausedState)
        
        if (controlsRef.current) {
          if (newPausedState) {
            // Store position
            lastPosition.current.copy(camera.position)
            document.exitPointerLock()
          } else if (isInitialized) {
            // Don't relock if not initialized
            controlsRef.current.lock()
          }
        }
        
        if (onPause) onPause(newPausedState)
        return
      }
      
      // Don't handle movement when paused
      if (isPaused) return
      
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          moveForward.current = true
          break
          
        case 'ArrowLeft':
        case 'KeyA':
          moveLeft.current = true
          break
          
        case 'ArrowDown':
        case 'KeyS':
          moveBackward.current = true
          break
          
        case 'ArrowRight':
        case 'KeyD':
          moveRight.current = true
          break
          
        case 'ShiftLeft':
        case 'ShiftRight':
          isSprinting.current = true
          break
          
        case 'Space':
          // Only jump if on the ground and can jump
          if (isOnGround.current && canJump.current) {
            verticalVelocity.current = 15 // Increased jump strength for better feel
            isOnGround.current = false
            canJump.current = false
            
            // Reset the jump ability after a cooldown
            if (jumpTimer.current !== null) {
              window.clearTimeout(jumpTimer.current)
            }
            
            jumpTimer.current = window.setTimeout(() => {
              canJump.current = true
              jumpTimer.current = null
            }, 200) // Reduced cooldown time for better responsiveness
          }
          break
      }
    }
    
    const onKeyUp = (event: KeyboardEvent) => {
      if (isPaused) return
      
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          moveForward.current = false
          break
          
        case 'ArrowLeft':
        case 'KeyA':
          moveLeft.current = false
          break
          
        case 'ArrowDown':
        case 'KeyS':
          moveBackward.current = false
          break
          
        case 'ArrowRight':
        case 'KeyD':
          moveRight.current = false
          break
          
        case 'ShiftLeft':
        case 'ShiftRight':
          isSprinting.current = false
          break
      }
    }
    
    // Add event listeners
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
    }
  }, [camera, isPaused, isInitialized, onPause])
  
  // Register mobile touch controls
  useEffect(() => {
    if ("ontouchstart" in window) {
      // Create mobile UI elements here
      const container = document.createElement('div')
      container.style.position = 'fixed'
      container.style.bottom = '100px'
      container.style.left = '20px'
      container.style.width = '150px'
      container.style.height = '150px'
      container.style.zIndex = '1000'
      
      // Create mobile joystick
      const joystick = document.createElement('div')
      joystick.style.position = 'fixed'
      joystick.style.bottom = '100px'
      joystick.style.right = '20px'
      joystick.style.width = '120px'
      joystick.style.height = '120px'
      joystick.style.borderRadius = '50%'
      joystick.style.backgroundColor = 'rgba(255,255,255,0.2)'
      joystick.style.zIndex = '1000'
      
      // Export function to append touch controls
      const appendTouchControls = () => {
        document.body.appendChild(container)
        document.body.appendChild(joystick)
      }
      
      window.__appendTouchControls = appendTouchControls
      
      return () => {
        if (document.body.contains(container)) {
          document.body.removeChild(container)
        }
        if (document.body.contains(joystick)) {
          document.body.removeChild(joystick)
        }
        window.__appendTouchControls = undefined
      }
    }
  }, [])
  
  // Check if player collides with any obstacles
  const checkCollisions = (nextPosition: THREE.Vector3) => {
    // Boundary collisions - walls
    if (nextPosition.x < -roomWidth / 2 + playerRadius ||
        nextPosition.x > roomWidth / 2 - playerRadius ||
        nextPosition.z < -roomLength / 2 + playerRadius ||
        nextPosition.z > roomLength / 2 - playerRadius) {
      return true
    }
    
    return false
  }
  
  // Check if player is grounded using raycasting
  const checkGroundedState = (position: THREE.Vector3) => {
    // Set raycaster origin to slightly above player position
    raycaster.current.set(
      new THREE.Vector3(position.x, position.y, position.z),
      downDirection
    );
    
    // Check for intersections with the floor or any platforms
    const intersects = raycaster.current.intersectObjects(scene.children, true);
    
    // Player is grounded if there's an intersection within our threshold distance
    return intersects.length > 0 && intersects[0].distance < groundCheckDistance;
  };
  
  // Handle first person movement with pointer lock controls
  useFrame((state, delta) => {
    if (useOrbitControls || isPaused || !isInitialized) return
    
    if (!controlsRef.current?.isLocked) return
    
    // Get controls object
    const controls = controlsRef.current
    const cameraObject = controls.getObject()
    
    // Apply drag to horizontal velocity
    const drag = 12.0
    velocity.current.x -= velocity.current.x * drag * delta
    velocity.current.z -= velocity.current.z * drag * delta
    
    // Check if player is on the ground
    const isGrounded = checkGroundedState(cameraObject.position);
    if (isGrounded !== isOnGround.current) {
      isOnGround.current = isGrounded;
      
      // If we just landed, reset vertical velocity
      if (isGrounded && verticalVelocity.current < 0) {
        verticalVelocity.current = 0;
      }
    }
    
    // Calculate movement direction based on camera orientation
    direction.current.z = Number(moveForward.current) - Number(moveBackward.current)
    direction.current.x = Number(moveRight.current) - Number(moveLeft.current)
    
    // Get camera's forward direction vector (corrected to be properly aligned with POV)
    const forward = new THREE.Vector3();
    cameraObject.getWorldDirection(forward);
    forward.y = 0; // Keep movement on horizontal plane
    forward.normalize();
    
    // Calculate right vector perpendicular to forward (properly aligned with camera)
    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    
    // Apply movement relative to camera direction (fixed WASD alignment)
    const moveVector = new THREE.Vector3();
    
    if (moveForward.current) {
      moveVector.add(forward);
    }
    if (moveBackward.current) {
      moveVector.sub(forward);
    }
    if (moveRight.current) {
      moveVector.add(right);
    }
    if (moveLeft.current) {
      moveVector.sub(right);
    }
    
    // Normalize if diagonal movement to prevent speed boost
    if (moveVector.length() > 0) {
      moveVector.normalize();
      
      // Apply speed based on sprint state
      const speed = isSprinting.current ? runningSpeed : walkingSpeed;
      moveVector.multiplyScalar(speed * delta);
      
      // Apply movement to velocity
      velocity.current.x = moveVector.x; // Removed negative signs for proper movement
      velocity.current.z = moveVector.z; // Removed negative signs for proper movement
    }
    
    // Apply gravity if not on ground
    if (!isOnGround.current) {
      verticalVelocity.current -= 30 * delta; // Increased gravity for better jumping feel
    }
    
    // Head bobbing effect when moving on ground
    if ((moveForward.current || moveBackward.current || moveLeft.current || moveRight.current) && isOnGround.current) {
      const speed = isSprinting.current ? 2.0 : 1.0; // Faster bobbing when sprinting
      const bobAmount = Math.min(0.04, Math.abs(velocity.current.length()) * 0.0003) * speed;
      const bobFrequency = 8 * speed;
      const time = state.clock.getElapsedTime();
      
      // Apply only vertical bobbing - no rotation
      cameraObject.position.y += Math.sin(time * bobFrequency) * bobAmount;
    }
    
    // Get camera position
    const currentPosition = cameraObject.position.clone()
    
    // Try vertical movement first
    const verticalPosition = currentPosition.clone()
    verticalPosition.y += verticalVelocity.current * delta
    
    // Hard floor constraint
    if (verticalPosition.y < playerHeight) {
      verticalPosition.y = playerHeight
      verticalVelocity.current = 0
      isOnGround.current = true
    }
    
    // Apply vertical movement if no collision
    if (!checkCollisions(verticalPosition)) {
      cameraObject.position.y = verticalPosition.y
    } else {
      // Stop upward movement if hit ceiling
      if (verticalVelocity.current > 0) {
        verticalVelocity.current = 0
      } else {
        // Landed on something
        isOnGround.current = true
        verticalVelocity.current = 0
      }
    }
    
    // Try horizontal X movement - fixed direction
    const horizontalXPosition = cameraObject.position.clone()
    horizontalXPosition.x += velocity.current.x * delta  // Changed from -= to += for proper alignment
    
    if (!checkCollisions(horizontalXPosition)) {
      cameraObject.position.x = horizontalXPosition.x
    } else {
      // Reset velocity on collision
      velocity.current.x = 0
    }
    
    // Try horizontal Z movement - fixed direction
    const horizontalZPosition = cameraObject.position.clone()
    horizontalZPosition.z += velocity.current.z * delta  // Changed from -= to += for proper alignment
    
    if (!checkCollisions(horizontalZPosition)) {
      cameraObject.position.z = horizontalZPosition.z
    } else {
      // Reset velocity on collision
      velocity.current.z = 0
    }
    
    // Play footstep sounds when moving
    const distanceMoved = cameraObject.position.distanceTo(lastPosition.current)
    
    if (distanceMoved > 0.1 && isOnGround.current) {
      isMoving.current = true
      movementTime.current += delta
      
      // Adjust footstep frequency based on movement speed
      const stepInterval = isSprinting.current ? 0.2 : 0.4
      
      // Play footstep sound on interval
      if (movementTime.current > stepInterval) {
        playFootstep()
        movementTime.current = 0
      }
    } else {
      isMoving.current = false
    }
    
    // Update last position
    lastPosition.current.copy(cameraObject.position)
  })
  
  // Handle orbit controls movement as fallback
  useFrame((state, delta) => {
    if (!useOrbitControls || !orbitControlsRef.current || isPaused) return
    
    const currentSpeed = isSprinting.current ? runningSpeed : walkingSpeed
    const moveSpeed = currentSpeed * delta
    
    // Get forward and right vectors from orbit controls
    const target = orbitControlsRef.current.target
    const forward = new THREE.Vector3().subVectors(target, camera.position).normalize()
    forward.y = 0 // Keep movement on horizontal plane
    forward.normalize()
    
    // Right vector is perpendicular to forward
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), forward).normalize()
    
    // Apply movement
    const moveVector = new THREE.Vector3(0, 0, 0)
    
    if (moveForward.current) {
      moveVector.add(forward)
    }
    if (moveBackward.current) {
      moveVector.sub(forward)
    }
    if (moveLeft.current) {
      moveVector.add(right)
    }
    if (moveRight.current) {
      moveVector.sub(right)
    }
    
    // Normalize if moving diagonally to prevent speed boost
    if (moveVector.length() > 0) {
      moveVector.normalize()
      moveVector.multiplyScalar(moveSpeed)
      
      // Apply movement
      camera.position.add(moveVector)
      orbitControlsRef.current.target.add(moveVector)
    }
    
    // Apply floor constraint
    if (camera.position.y < playerHeight) {
      camera.position.y = playerHeight
    }
    
    // Play footstep sounds
    if (moveForward.current || moveBackward.current || moveLeft.current || moveRight.current) {
      movementTime.current += delta
      // Adjust footstep frequency based on sprint state
      const stepInterval = isSprinting.current ? 0.2 : 0.4
      if (movementTime.current > stepInterval) {
        playFootstep()
        movementTime.current = 0
      }
    }
  })
  
  // Render the appropriate controls
  return (
    <>
      {!useOrbitControls && (
        <PointerLockControls 
          ref={controlsRef} 
          pointerSpeed={1.8}
        />
      )}
      
      {useOrbitControls && (
        <OrbitControls
          ref={orbitControlsRef}
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          zoomSpeed={0.5}
          panSpeed={0.5}
          rotateSpeed={0.5}
          minPolarAngle={0.1}
          maxPolarAngle={Math.PI - 0.1}
        />
      )}
    </>
  )
} 