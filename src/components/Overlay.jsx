import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '../store'
import { deserts } from '../data/deserts'
import { Soundscape } from './Soundscape'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'

const MagneticButton = ({ children, onClick, className = "", "aria-label": ariaLabel }) => {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const bounds = useRef({ left: 0, top: 0, width: 0, height: 0 })

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const handleMouseEnter = () => {
    if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        bounds.current = {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
        };
    }
  }

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e
    const { left, top, width, height } = bounds.current
    const centerX = left + width / 2
    const centerY = top + height / 2
    const distanceX = clientX - centerX
    const distanceY = clientY - centerY

    if (Math.abs(distanceX) < width && Math.abs(distanceY) < height) {
        x.set(distanceX * 0.2)
        y.set(distanceY * 0.2)
    } else {
        x.set(0)
        y.set(0)
    }
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.9 }}
      aria-label={ariaLabel}
    >
      {children}
    </motion.button>
  )
}

const Tilt = ({ children }) => {
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const mouseX = useSpring(x, { stiffness: 50, damping: 20 })
    const mouseY = useSpring(y, { stiffness: 50, damping: 20 })

    useEffect(() => {
        const handleMouseMove = (e) => {
            const { clientX, clientY } = e
            const { innerWidth, innerHeight } = window
            const xPct = (clientX / innerWidth - 0.5)
            const yPct = (clientY / innerHeight - 0.5)
            x.set(xPct * 10)
            y.set(yPct * -10)
        }
        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [x, y])

    return (
        <motion.div style={{ rotateX: mouseY, rotateY: mouseX, perspective: 1000, transformStyle: "preserve-3d" }}>
            {children}
        </motion.div>
    )
}

export const Overlay = ({ started }) => {
  const currentDesertIndex = useStore((state) => state.currentDesertIndex)
  const nextDesert = useStore((state) => state.nextDesert)
  const prevDesert = useStore((state) => state.prevDesert)
  const setDesert = useStore((state) => state.setDesert)
  const dayNightCycle = useStore((state) => state.dayNightCycle)
  const setDayNightCycle = useStore((state) => state.setDayNightCycle)

  const desert = deserts[currentDesertIndex]
  const [zenMode, setZenMode] = useState(false)

  const handleKeyDown = (e, index) => {
      if (e.key === 'Enter' || e.key === ' ') {
          setDesert(index);
      }
  }

  return (
    <motion.div
        className="absolute top-0 left-0 w-full h-full z-10 flex flex-col justify-between p-8 md:p-12"
        initial={{ opacity: 0, pointerEvents: 'none' }}
        animate={{ opacity: started ? 1 : 0, pointerEvents: started ? 'auto' : 'none' }}
        transition={{ duration: 1.5, ease: "easeOut" }}
    >
        {/* Zen Mode Toggle */}
        <div className="absolute top-8 left-8 pointer-events-auto z-50">
           <MagneticButton
             onClick={() => setZenMode(!zenMode)}
             className="text-white/40 hover:text-white transition-colors duration-300 group flex items-center gap-2 p-2"
             aria-label={zenMode ? "Show UI" : "Enable Zen Mode"}
           >
             <div className="bg-white/5 backdrop-blur-sm p-3 rounded-full border border-white/5 hover:bg-white/10 transition-colors shadow-lg">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
             </div>
             <span className="text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 font-mono -ml-2 drop-shadow-md">
               {zenMode ? "Show UI" : "Zen Mode"}
             </span>
           </MagneticButton>
        </div>

        {/* Header */}
        <div className={`pointer-events-auto max-w-4xl mt-8 transition-all duration-1000 ease-[0.2,0.65,0.3,0.9] ${zenMode ? 'opacity-0 -translate-x-20 blur-sm pointer-events-none' : 'opacity-100 translate-x-0 blur-0'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentDesertIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <Tilt>
                  <div className="overflow-hidden mb-6 py-2">
                    <h1 className="text-7xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/40 drop-shadow-glow tracking-tighter font-serif flex flex-wrap gap-x-6 pb-2">
                      {desert.name.split(" ").map((word, wIndex) => (
                        <span key={wIndex} className="inline-block whitespace-nowrap">
                          {word.split("").map((char, cIndex) => (
                            <motion.span
                              key={`${wIndex}-${cIndex}`}
                              initial={{ y: 40, opacity: 0, filter: 'blur(10px)' }}
                              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                              exit={{ y: -40, opacity: 0, filter: 'blur(10px)' }}
                              transition={{
                                duration: 1.0,
                                ease: [0.2, 0.65, 0.3, 0.9],
                                delay: (wIndex * word.length + cIndex) * 0.04
                              }}
                              className="inline-block hover:text-pastel-apricot transition-colors duration-300"
                            >
                              {char}
                            </motion.span>
                          ))}
                        </span>
                      ))}
                    </h1>
                  </div>

                  <div className="overflow-hidden max-w-lg">
                    <motion.p
                      initial={{ x: -20, opacity: 0, filter: 'blur(5px)' }}
                      animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
                      exit={{ x: 20, opacity: 0, filter: 'blur(5px)' }}
                      transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                      className="text-white/80 text-lg md:text-xl font-light leading-relaxed drop-shadow-md border-l border-white/30 pl-6 backdrop-blur-sm"
                    >
                      {desert.description}
                    </motion.p>
                  </div>
              </Tilt>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-auto z-20 transition-all duration-1000 ease-[0.2,0.65,0.3,0.9] ${zenMode ? 'translate-y-20 opacity-0 pointer-events-none blur-sm' : 'translate-y-0 opacity-100 blur-0'}`}>

          <div className="glass-panel rounded-full px-10 py-5 flex items-center gap-8">
            <MagneticButton
              onClick={prevDesert}
              className="text-white/50 hover:text-white transition-colors p-2"
              aria-label="Previous Desert"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </MagneticButton>

            <div className="flex gap-4 items-center mx-4">
               {deserts.map((_, index) => (
                  <motion.div
                      key={index}
                      className="relative cursor-pointer group py-2"
                      onClick={() => setDesert(index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      whileHover={{ scale: 1.5 }}
                      whileTap={{ scale: 0.9 }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Select ${deserts[index].name}`}
                  >
                      <motion.div
                          className={`rounded-full transition-all duration-500 box-content border-2 ${index === currentDesertIndex ? 'bg-white border-white shadow-[0_0_15px_rgba(255,255,255,0.9)]' : 'bg-transparent border-white/30 group-hover:border-white/80'}`}
                          animate={{
                              width: index === currentDesertIndex ? 8 : 6,
                              height: index === currentDesertIndex ? 8 : 6,
                          }}
                      />
                  </motion.div>
               ))}
            </div>

            <MagneticButton
              onClick={nextDesert}
              className="text-white/50 hover:text-white transition-colors p-2"
              aria-label="Next Desert"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </MagneticButton>
          </div>
        </div>

        {/* Controls */}
        <div className={`absolute top-8 right-8 pointer-events-auto flex flex-col gap-6 items-end transition-all duration-1000 ease-[0.2,0.65,0.3,0.9] ${zenMode ? 'translate-x-20 opacity-0 pointer-events-none blur-sm' : 'translate-x-0 opacity-100 blur-0'}`}>
          <Soundscape />
          <div className="glass-panel p-6 rounded-2xl w-72 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <label className="text-white text-[10px] font-bold tracking-[0.2em] uppercase opacity-70">Time of Day</label>
                <span className="text-[10px] text-white font-mono bg-white/10 px-2 py-1 rounded border border-white/5 shadow-inner">
                  {Math.floor(dayNightCycle * 24).toString().padStart(2, '0')}:00
                </span>
            </div>

            <div className="relative h-12 flex items-center group cursor-pointer">
              {/* Track Background */}
              <div className="absolute left-0 right-0 h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/5 group-hover:h-3 transition-all duration-300">
                 <div
                   className="h-full bg-gradient-to-r from-pastel-apricot via-pastel-lilac to-pastel-mint opacity-80 transition-all duration-300"
                   style={{ width: `${dayNightCycle * 100}%` }}
                 />
              </div>

              {/* Sun/Moon Indicator Visual */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.6)] flex items-center justify-center z-10 pointer-events-none border-2 border-transparent group-hover:border-pastel-azure transition-colors"
                style={{ left: `${dayNightCycle * 100}%`, x: '-50%' }}
                whileHover={{ scale: 1.2, boxShadow: "0 0 25px rgba(255,255,255,0.8)" }}
                layout
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
          </div>
        </div>

        {/* Footer / Instructions */}
        <div className={`absolute bottom-8 right-8 text-white/60 text-[10px] pointer-events-none font-mono tracking-widest uppercase hidden md:block transition-all duration-1000 ease-[0.2,0.65,0.3,0.9] ${zenMode ? 'opacity-0 translate-y-10 blur-sm' : 'opacity-100 translate-y-0 blur-0'}`}>
          Drag to explore • Scroll to zoom
        </div>
    </motion.div>
  )
}
