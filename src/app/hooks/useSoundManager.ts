import { Howl } from 'howler'
import { useEffect, useRef } from 'react'
import { useGalleryStore } from '../store/galleryStore'

export const useSoundManager = () => {
  const { isDarkMode } = useGalleryStore()
  
  // Sound effects
  const footstepSound = useRef<Howl | null>(null)
  const ambientSound = useRef<Howl | null>(null)
  const visitorSound = useRef<Howl | null>(null)
  
  // Initialize sounds
  useEffect(() => {
    // Footstep sound
    footstepSound.current = new Howl({
      src: ['/sounds/footstep.mp3'],
      volume: 0.3,
      loop: false,
    })
    
    // Ambient sound (different for day/night)
    ambientSound.current = new Howl({
      src: [isDarkMode ? '/sounds/ambient-night.mp3' : '/sounds/ambient-day.mp3'],
      volume: 0.2,
      loop: true,
    })
    
    // Visitor sound (random chatter)
    visitorSound.current = new Howl({
      src: ['/sounds/visitor-chatter.mp3'],
      volume: 0.1,
      loop: false,
    })
    
    // Start ambient sound
    ambientSound.current.play()
    
    // Cleanup
    return () => {
      footstepSound.current?.unload()
      ambientSound.current?.unload()
      visitorSound.current?.unload()
    }
  }, [isDarkMode])
  
  // Play footstep sound
  const playFootstep = () => {
    if (footstepSound.current && !footstepSound.current.playing()) {
      footstepSound.current.play()
    }
  }
  
  // Play visitor sound
  const playVisitorSound = () => {
    if (visitorSound.current && !visitorSound.current.playing()) {
      visitorSound.current.play()
    }
  }
  
  return {
    playFootstep,
    playVisitorSound,
  }
} 