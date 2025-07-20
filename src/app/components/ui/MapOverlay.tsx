import { AnimatePresence, motion } from 'framer-motion'
import { useGalleryStore } from '../../store/galleryStore'

const zones = [
  { id: 'skills', label: 'Skills & Projects', position: { x: -8, z: -10 } },
  { id: 'about', label: 'About Me', position: { x: 8, z: -10 } },
  { id: 'hobbies', label: 'Hobbies', position: { x: 0, z: 10 } },
  { id: 'humor', label: 'Fun Zone', position: { x: -8, z: 10 } },
]

export const MapOverlay = () => {
  const { isMapOpen, setMapOpen, currentZone, setCurrentZone } = useGalleryStore()

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setMapOpen(!isMapOpen)}
        className="bg-white/90 dark:bg-black/90 p-2 rounded-lg shadow-lg"
      >
        {isMapOpen ? 'Close Map' : 'Open Map'}
      </button>

      <AnimatePresence>
        {isMapOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-12 right-0 w-64 h-64 bg-white/90 dark:bg-black/90 rounded-lg shadow-lg p-4"
          >
            <div className="relative w-full h-full">
              {zones.map((zone) => (
                <motion.button
                  key={zone.id}
                  className={`absolute p-2 rounded-full ${
                    currentZone === zone.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  style={{
                    left: `${((zone.position.x + 10) / 20) * 100}%`,
                    top: `${((zone.position.z + 10) / 20) * 100}%`,
                  }}
                  onClick={() => setCurrentZone(zone.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {zone.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 