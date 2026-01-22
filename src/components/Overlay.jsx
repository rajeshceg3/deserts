import React from 'react'
import { useStore } from '../store'
import { deserts } from '../data/deserts'
import { Soundscape } from './Soundscape'

export const Overlay = () => {
  const currentDesertIndex = useStore((state) => state.currentDesertIndex)
  const nextDesert = useStore((state) => state.nextDesert)
  const prevDesert = useStore((state) => state.prevDesert)
  const dayNightCycle = useStore((state) => state.dayNightCycle)
  const setDayNightCycle = useStore((state) => state.setDayNightCycle)

  const desert = deserts[currentDesertIndex]

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 flex flex-col justify-between p-8">
      {/* Header */}
      <div className="pointer-events-auto">
        <h1 className="text-4xl font-bold text-white drop-shadow-md">{desert.name}</h1>
        <p className="text-white/80 max-w-md mt-2 drop-shadow-sm">{desert.description}</p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-8 pointer-events-auto">
        <button
          onClick={prevDesert}
          className="bg-white/10 hover:bg-white/20 text-white rounded-full p-4 backdrop-blur-sm transition-all border border-white/20"
        >
          ← Prev
        </button>

        <div className="text-white/50 text-sm">
           {currentDesertIndex + 1} / {deserts.length}
        </div>

        <button
          onClick={nextDesert}
          className="bg-white/10 hover:bg-white/20 text-white rounded-full p-4 backdrop-blur-sm transition-all border border-white/20"
        >
          Next →
        </button>
      </div>

      {/* Controls */}
      <Soundscape />
      <div className="absolute top-8 right-8 pointer-events-auto bg-black/30 backdrop-blur-md p-4 rounded-xl border border-white/10">
        <label className="block text-white text-sm mb-2">Time of Day</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={dayNightCycle}
          onChange={(e) => setDayNightCycle(parseFloat(e.target.value))}
          className="w-48 accent-orange-500"
        />
        <div className="flex justify-between text-xs text-white/50 mt-1 w-48">
            <span>Midnight</span>
            <span>Noon</span>
            <span>Midnight</span>
        </div>
      </div>

      {/* Footer / Instructions */}
      <div className="absolute bottom-8 right-8 text-white/40 text-sm pointer-events-none">
        <p>Drag to explore • Scroll to zoom</p>
      </div>
    </div>
  )
}
