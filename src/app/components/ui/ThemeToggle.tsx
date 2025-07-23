import { useGalleryStore } from '../../store/galleryStore'

export const ThemeToggle = () => {
  const { isDarkMode, setDarkMode } = useGalleryStore()

  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={() => setDarkMode(!isDarkMode)}
        className="bg-white/90 dark:bg-black/90 p-2 rounded-lg shadow-lg"
      >
        {isDarkMode ? '🌞' : '🌙'}
      </button>
    </div>
  )
} 