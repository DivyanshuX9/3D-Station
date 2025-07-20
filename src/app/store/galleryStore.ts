import { create } from 'zustand'

interface GalleryState {
  isDarkMode: boolean
  isMapOpen: boolean
  currentZone: string | null
  setDarkMode: (value: boolean) => void
  setMapOpen: (value: boolean) => void
  setCurrentZone: (zone: string | null) => void
}

export const useGalleryStore = create<GalleryState>((set) => ({
  isDarkMode: false,
  isMapOpen: false,
  currentZone: null,
  setDarkMode: (value) => set({ isDarkMode: value }),
  setMapOpen: (value) => set({ isMapOpen: value }),
  setCurrentZone: (zone) => set({ currentZone: zone }),
})) 