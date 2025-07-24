import { create } from 'zustand'

interface GalleryState {
  isMapOpen: boolean
  currentZone: string | null
  setMapOpen: (value: boolean) => void
  setCurrentZone: (zone: string | null) => void
}

export const useGalleryStore = create<GalleryState>((set) => ({
  isMapOpen: false,
  currentZone: null,
  setMapOpen: (value) => set({ isMapOpen: value }),
  setCurrentZone: (zone) => set({ currentZone: zone }),
})) 