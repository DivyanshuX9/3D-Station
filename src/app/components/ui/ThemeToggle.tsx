import { motion } from 'framer-motion'
import { useGalleryStore } from '../../store/galleryStore'

export const ThemeToggle = () => {
  const { isDarkMode, setDarkMode } = useGalleryStore()

  return (
    <div className="fixed top-4 left-4 z-50">
      <motion.button
        onClick={() => setDarkMode(!isDarkMode)}
        className="bg-white/90 dark:bg-black/90 p-2 rounded-lg shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isDarkMode ? '🌞' : '🌙'}
      </motion.button>
    </div>
  )
} 