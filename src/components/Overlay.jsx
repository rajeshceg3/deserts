import React, { useState, useEffect } from 'react'
import { useStore } from '../store'
import { deserts } from '../data/deserts'
import { Soundscape } from './Soundscape'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'

export const Overlay = () => {
  const currentDesertIndex = useStore((state) => state.currentDesertIndex)
  const nextDesert = useStore((state) => state.nextDesert)
  const prevDesert = useStore((state) => state.prevDesert)
  const setDesert = useStore((state) => state.setDesert)
  const dayNightCycle = useStore((state) => state.dayNightCycle)
  const setDayNightCycle = useStore((state) => state.setDayNightCycle)

  const desert = deserts[currentDesertIndex]
  const [introFinished, setIntroFinished] = useState(false)
  const [zenMode, setZenMode] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIntroFinished(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <AnimatePresence>
        {!introFinished && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white pointer-events-none"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
             <motion.h1
               initial={{ opacity: 0, scale: 0.9, letterSpacing: '0.1em' }}
               animate={{ opacity: 1, scale: 1, letterSpacing: '0.2em' }}
               transition={{ duration: 1.2, ease: "easeOut" }}
               className="text-4xl md:text-6xl font-serif italic text-white/90"
             >
                Desert Dreams
             </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 flex flex-col justify-between p-8 md:p-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: introFinished ? 1 : 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        {/* Zen Mode Toggle */}
        <div className="absolute top-8 left-8 pointer-events-auto z-50">
           <button
             onClick={() => setZenMode(!zenMode)}
             className="text-white/40 hover:text-white transition-colors duration-300 group flex items-center gap-2"
           >
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
               {zenMode ? (
                 <>
                   <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                   <line x1="1" y1="1" x2="23" y2="23" />
                 </>
               ) : (
                 <>
                   <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                   <circle cx="12" cy="12" r="3" />
                 </>
               )}
             </svg>
             <span className="text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity font-mono">
               {zenMode ? "Show UI" : "Zen Mode"}
             </span>
           </button>
        </div>

        {/* Header */}
        <div className={`pointer-events-auto max-w-xl mt-8 transition-opacity duration-700 ${zenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentDesertIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <div className="overflow-hidden mb-4">
                <h1 className="text-7xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50 drop-shadow-2xl tracking-tighter font-serif flex flex-wrap gap-x-4">
                  {desert.name.split(" ").map((word, wIndex) => (
                    <span key={wIndex} className="inline-block whitespace-nowrap">
                      {word.split("").map((char, cIndex) => (
                        <motion.span
                          key={`${wIndex}-${cIndex}`}
                          initial={{ y: 100, opacity: 0, rotate: 5 }}
                          animate={{ y: 0, opacity: 1, rotate: 0 }}
                          exit={{ y: -50, opacity: 0 }}
                          transition={{
                            duration: 0.8,
                            ease: [0.2, 0.65, 0.3, 0.9],
                            delay: (wIndex * word.length + cIndex) * 0.03
                          }}
                          className="inline-block"
                        >
                          {char}
                        </motion.span>
                      ))}
                    </span>
                  ))}
                </h1>
              </div>

              <div className="overflow-hidden">
                <motion.p
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                  className="text-white/80 text-lg md:text-xl font-light leading-relaxed drop-shadow-md border-l-2 border-white/20 pl-6 backdrop-blur-[2px]"
                >
                  {desert.description}
                </motion.p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8 pointer-events-auto z-20 transition-all duration-700 ${zenMode ? 'translate-y-20 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>

          <div className="flex items-center gap-6 bg-white/5 backdrop-blur-md px-8 py-4 rounded-full border border-white/10 shadow-2xl">
            <motion.button
              whileHover={{ scale: 1.2, x: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevDesert}
              className="text-white/50 hover:text-white transition-colors p-2"
              aria-label="Previous Desert"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </motion.button>

            <div className="flex gap-4 items-center mx-4">
               {deserts.map((_, index) => (
                  <motion.div
                      key={index}
                      className="relative cursor-pointer group py-2" // Added py-2 for larger hit area
                      onClick={() => setDesert(index)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                  >
                      <motion.div
                          className={`rounded-full transition-colors duration-500 ${index === currentDesertIndex ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'bg-white/20 hover:bg-white/40'}`}
                          animate={{
                              width: index === currentDesertIndex ? 12 : 8,
                              height: index === currentDesertIndex ? 12 : 8,
                          }}
                      />
                  </motion.div>
               ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.2, x: 2 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextDesert}
              className="text-white/50 hover:text-white transition-colors p-2"
              aria-label="Next Desert"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Controls */}
        <div className={`absolute top-8 right-8 pointer-events-auto flex flex-col gap-6 items-end transition-all duration-700 ${zenMode ? 'translate-x-20 opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}`}>
          <Soundscape />

          <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl w-72"
          >
            <div className="flex justify-between items-center mb-6">
                <label className="text-white text-[10px] font-bold tracking-[0.2em] uppercase opacity-70">Time of Day</label>
                <span className="text-[10px] text-white font-mono bg-white/10 px-2 py-1 rounded border border-white/5">
                  {Math.floor(dayNightCycle * 24).toString().padStart(2, '0')}:00
                </span>
            </div>

            <div className="relative h-12 flex items-center group cursor-pointer">
              {/* Track Background */}
              <div className="absolute left-0 right-0 h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                 <div
                   className="h-full bg-gradient-to-r from-pastel-apricot to-pastel-lilac opacity-50 transition-all duration-300"
                   style={{ width: `${dayNightCycle * 100}%` }}
                 />
              </div>

              {/* Sun/Moon Indicator Visual */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)] flex items-center justify-center z-10 pointer-events-none"
                style={{ left: `${dayNightCycle * 100}%`, x: '-50%' }}
                whileHover={{ scale: 1.1 }}
              >
                 {dayNightCycle > 0.25 && dayNightCycle < 0.75 ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" className="animate-spin-slow"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                 ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                 )}
              </motion.div>

              {/* Invisible Range Input */}
              <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.001"
                  value={dayNightCycle}
                  onChange={(e) => setDayNightCycle(parseFloat(e.target.value))}
                  className="w-full relative z-20 opacity-0 cursor-pointer h-full"
                  aria-label="Time of Day"
              />
            </div>

            <div className="flex justify-between text-[8px] text-white/30 mt-4 font-mono uppercase tracking-widest">
                <span>Night</span>
                <span>Day</span>
                <span>Night</span>
            </div>
          </motion.div>
        </div>

        {/* Footer / Instructions */}
        <div className={`absolute bottom-8 right-8 text-white/30 text-[10px] pointer-events-none font-mono tracking-widest uppercase hidden md:block transition-opacity duration-700 ${zenMode ? 'opacity-0' : 'opacity-100'}`}>
          Drag to explore • Scroll to zoom
        </div>
      </motion.div>
    </>
  )
}
