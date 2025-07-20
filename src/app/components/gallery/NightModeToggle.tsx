import { useEffect, useState } from 'react';
import { create } from 'zustand';

// Store for global night mode state
interface NightModeState {
  isNightMode: boolean;
  toggleNightMode: () => void;
}

export const useNightModeStore = create<NightModeState>((set) => ({
  isNightMode: false,
  toggleNightMode: () => set((state) => ({ isNightMode: !state.isNightMode })),
}));

interface NightModeToggleProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const NightModeToggle = ({ position = 'top-right' }: NightModeToggleProps) => {
  const { isNightMode, toggleNightMode } = useNightModeStore();
  const [mounted, setMounted] = useState(false);

  // Ensure component only renders client-side to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Position styling
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <button
        onClick={toggleNightMode}
        className={`flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 shadow-lg ${
          isNightMode ? 'bg-indigo-900 text-white' : 'bg-amber-400 text-gray-900'
        }`}
        aria-label={isNightMode ? 'Switch to day mode' : 'Switch to night mode'}
      >
        {isNightMode ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
            <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
          </svg>
        )}
      </button>
    </div>
  );
}; 