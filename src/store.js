import { create } from 'zustand'

export const useStore = create((set) => ({
  currentDesertIndex: 0,
  dayNightCycle: 0.5, // 0 to 1, where 0/1 is midnight, 0.5 is noon
  isDay: true,
  showInfo: false,

  nextDesert: () => set((state) => ({
    currentDesertIndex: (state.currentDesertIndex + 1) % 5
  })),

  prevDesert: () => set((state) => ({
    currentDesertIndex: (state.currentDesertIndex - 1 + 5) % 5
  })),

  setDesert: (index) => set({ currentDesertIndex: index }),

  setDayNightCycle: (value) => set({ dayNightCycle: value, isDay: value > 0.25 && value < 0.75 }),

  toggleInfo: () => set((state) => ({ showInfo: !state.showInfo })),
}))
