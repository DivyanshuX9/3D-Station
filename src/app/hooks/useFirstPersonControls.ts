import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Vector3 } from 'three'
import { useSoundManager } from './useSoundManager'

const MOVEMENT_SPEED = 5
const JUMP_FORCE = 5
const GRAVITY = 9.8
const ROOM_WIDTH = 20
const ROOM_LENGTH = 30
const WALL_THICKNESS = 0.2

export const useFirstPersonControls = () => {
  const { camera } = useThree()
  const velocity = useRef(new Vector3())
  const direction = useRef(new Vector3())
  const isJumping = useRef(false)
  const { playFootstep } = useSoundManager()
  const lastFootstepTime = useRef(0)
  const FOOTSTEP_INTERVAL = 0.5 // seconds between footsteps

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
          direction.current.z = 1
          break
        case 'KeyS':
          direction.current.z = -1
          break
        case 'KeyA':
          direction.current.x = -1
          break
        case 'KeyD':
          direction.current.x = 1
          break
        case 'Space':
          if (!isJumping.current) {
            velocity.current.y = JUMP_FORCE
            isJumping.current = true
          }
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'KeyS':
          direction.current.z = 0
          break
        case 'KeyA':
        case 'KeyD':
          direction.current.x = 0
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame((state, delta) => {
    // Apply gravity
    velocity.current.y -= GRAVITY * delta

    // Calculate movement direction relative to camera orientation
    const moveX = direction.current.x
    const moveZ = direction.current.z

    // Create forward and right vectors from camera's rotation
    const forward = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
    forward.y = 0 // Lock movement to horizontal plane
    forward.normalize()
    
    const right = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
    right.y = 0 // Lock movement to horizontal plane
    right.normalize()

    // Calculate movement vector
    const moveVector = new Vector3()
    if (moveZ !== 0) {
      moveVector.addScaledVector(forward, moveZ)
    }
    if (moveX !== 0) {
      moveVector.addScaledVector(right, moveX)
    }
    
    // Normalize the movement vector to maintain consistent speed in all directions
    if (moveVector.length() > 0) {
      moveVector.normalize()
    }

    // Calculate next position
    const moveDistance = MOVEMENT_SPEED * delta
    const nextPosition = camera.position.clone().add(moveVector.multiplyScalar(moveDistance))

    // Wall collision detection
    const halfWidth = ROOM_WIDTH / 2
    const halfLength = ROOM_LENGTH / 2
    const playerRadius = 0.5 // Player collision radius

    // Check wall collisions
    if (nextPosition.x - playerRadius > -halfWidth + WALL_THICKNESS && 
        nextPosition.x + playerRadius < halfWidth - WALL_THICKNESS) {
      camera.position.x = nextPosition.x
    }
    
    if (nextPosition.z - playerRadius > -halfLength + WALL_THICKNESS && 
        nextPosition.z + playerRadius < halfLength - WALL_THICKNESS) {
      camera.position.z = nextPosition.z
    }

    // Update vertical position
    camera.position.y += velocity.current.y * delta

    // Ground collision
    if (camera.position.y < 1.6) {
      camera.position.y = 1.6
      velocity.current.y = 0
      isJumping.current = false
    }

    // Play footstep sound when moving
    if ((direction.current.x !== 0 || direction.current.z !== 0) && !isJumping.current) {
      const currentTime = state.clock.getElapsedTime()
      if (currentTime - lastFootstepTime.current > FOOTSTEP_INTERVAL) {
        playFootstep()
        lastFootstepTime.current = currentTime
      }
    }
  })
} 