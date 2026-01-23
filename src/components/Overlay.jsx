import React from 'react'
import { useStore } from '../store'
import { deserts } from '../data/deserts'
import { Soundscape } from './Soundscape'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'

export const Overlay = () => {
  const currentDesertIndex = useStore((state) => state.currentDesertIndex)
  const nextDesert = useStore((state) => state.nextDesert)
  const prevDesert = useStore((state) => state.prevDesert)
  const dayNightCycle = useStore((state) => state.dayNightCycle)
  const setDayNightCycle = useStore((state) => state.setDayNightCycle)

  const desert = deserts[currentDesertIndex]

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 flex flex-col justify-between p-8 md:p-12">
      {/* Header */}
      <div className="pointer-events-auto max-w-xl mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDesertIndex}
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-6xl md:text-8xl font-bold text-white drop-shadow-lg mb-6 tracking-tighter">
              {desert.name}
            </h1>
            <p className="text-white/90 text-lg md:text-xl font-light leading-relaxed drop-shadow-md backdrop-blur-md bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl">
              {desert.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8 pointer-events-auto z-20">
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
          whileTap={{ scale: 0.95 }}
          onClick={prevDesert}
          className="bg-black/20 text-white rounded-full p-5 backdrop-blur-xl border border-white/20 shadow-lg hover:border-white/40 transition-colors"
          aria-label="Previous Desert"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </motion.button>

        <div className="text-white/80 font-mono text-sm tracking-widest bg-black/30 px-6 py-3 rounded-full backdrop-blur-xl border border-white/10 shadow-lg">
           0{currentDesertIndex + 1} — 0{deserts.length}
        </div>

        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
          whileTap={{ scale: 0.95 }}
          onClick={nextDesert}
          className="bg-black/20 text-white rounded-full p-5 backdrop-blur-xl border border-white/20 shadow-lg hover:border-white/40 transition-colors"
          aria-label="Next Desert"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </motion.button>
      </div>

      {/* Controls */}
      <div className="absolute top-8 right-8 pointer-events-auto flex flex-col gap-6 items-end">
        <Soundscape />

        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="bg-black/30 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl w-72"
        >
          <div className="flex justify-between items-center mb-4">
              <label className="text-white text-xs font-bold tracking-widest uppercase opacity-80">Time of Day</label>
              <span className="text-xs text-white/60 font-mono bg-white/10 px-2 py-1 rounded">{Math.floor(dayNightCycle * 24).toString().padStart(2, '0')}:00</span>
          </div>

          <div className="relative h-6 flex items-center">
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={dayNightCycle}
                onChange={(e) => setDayNightCycle(parseFloat(e.target.value))}
                className="w-full relative z-10"
                aria-label="Time of Day"
            />
          </div>

          <div className="flex justify-between text-[10px] text-white/40 mt-3 font-mono uppercase tracking-widest">
              <span>Midnight</span>
              <span>Noon</span>
              <span>Midnight</span>
          </div>
        </motion.div>
      </div>

      {/* Footer / Instructions */}
      <div className="absolute bottom-8 right-8 text-white/30 text-[10px] pointer-events-none font-mono tracking-widest uppercase hidden md:block">
        Drag to explore • Scroll to zoom
      </div>
    </div>
  )
}
