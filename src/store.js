import { create } from 'zustand'
import { deserts } from './data/deserts'

export const useStore = create((set) => ({
  currentDesertIndex: 0,
  dayNightCycle: 0.5, // 0 to 1, where 0/1 is midnight, 0.5 is noon
  isDay: true,
  showInfo: false,
  visitedDeserts: [0],

  markVisited: (index) => set((state) => {
    if (state.visitedDeserts.includes(index)) return {}
    return { visitedDeserts: [...state.visitedDeserts, index] }
  }),

  nextDesert: () => set((state) => ({
    currentDesertIndex: (state.currentDesertIndex + 1) % deserts.length
  })),

  prevDesert: () => set((state) => ({
    currentDesertIndex: (state.currentDesertIndex - 1 + deserts.length) % deserts.length
  })),

  setDesert: (index) => set({ currentDesertIndex: index }),

  setDayNightCycle: (value) => set({ dayNightCycle: value, isDay: value > 0.25 && value < 0.75 }),

  toggleInfo: () => set((state) => ({ showInfo: !state.showInfo })),
}))
