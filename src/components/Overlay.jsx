import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '../store'
import { deserts } from '../data/deserts'
import { Soundscape } from './Soundscape'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { useUISound } from '../hooks/useUISound'

const MagneticButton = ({ children, onClick, className = "", "aria-label": ariaLabel, onMouseEnter }) => {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const bounds = useRef({ left: 0, top: 0, width: 0, height: 0 })

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 }
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
    if (onMouseEnter) onMouseEnter();
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

  const { play } = useUISound()

  const desert = deserts[currentDesertIndex]
  const [zenMode, setZenMode] = useState(false)
  const [isTimeFocused, setIsTimeFocused] = useState(false)

  const handleKeyDown = (e, index) => {
      if (e.key === 'Enter' || e.key === ' ') {
          setDesert(index);
          play('click');
      }
  }

  return (
    <motion.div
        className="absolute top-0 left-0 w-full h-full z-10 flex flex-col justify-between p-8 md:p-12"
        initial={{ opacity: 0, pointerEvents: 'none' }}
        animate={{ opacity: started ? 1 : 0, pointerEvents: started ? 'auto' : 'none' }}
        transition={{ duration: 1.5, ease: "easeOut" }}
    >
        {/* Vignette Overlay */}
        <div className="pointer-events-none fixed inset-0 z-0 bg-radial-vignette opacity-50" />

        {/* Zen Mode Toggle */}
        <div className="absolute top-8 left-8 pointer-events-auto z-50">
           <MagneticButton
             onClick={() => {
                setZenMode(!zenMode);
                play('click');
             }}
             onMouseEnter={() => play('hover')}
             className="group relative"
             aria-label={zenMode ? "Show UI" : "Enable Zen Mode"}
           >
             <div className="glass-panel p-3 rounded-full hover:bg-white/20 transition-all duration-300">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/90">
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

             <div className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-2 pointer-events-none">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/90 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded border border-white/10 whitespace-nowrap shadow-xl">
                  {zenMode ? "Show UI" : "Zen Mode"}
                </span>
             </div>
           </MagneticButton>
        </div>

        {/* Header */}
        <div className={`pointer-events-auto max-w-4xl mt-8 transition-all duration-1000 ease-[0.2,0.65,0.3,0.9] relative z-10 ${zenMode ? 'opacity-0 -translate-x-20 blur-sm pointer-events-none' : 'opacity-100 translate-x-0 blur-0'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentDesertIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { staggerChildren: 0.05 } }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <Tilt>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="mb-4 flex items-center gap-4"
                  >
                     <span className="font-serif italic text-2xl text-white/40">
                       {(currentDesertIndex + 1).toString().padStart(2, '0')}
                     </span>
                     <div className="h-[1px] w-12 bg-white/20" />
                     <span className="font-serif italic text-xl text-white/40">
                       {deserts.length.toString().padStart(2, '0')}
                     </span>
                  </motion.div>

                  <div className="overflow-hidden mb-6 py-2">
                    <h1 className="text-8xl md:text-10xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/50 drop-shadow-text-strong tracking-tighter font-serif flex flex-wrap gap-x-8 pb-4">
                      {desert.name.split(" ").map((word, wIndex) => (
                        <span key={wIndex} className="inline-block whitespace-nowrap">
                          {word.split("").map((char, cIndex) => (
                            <motion.span
                              key={`${wIndex}-${cIndex}`}
                              variants={{
                                hidden: { y: 100, opacity: 0, filter: 'blur(20px)' },
                                visible: { y: 0, opacity: 1, filter: 'blur(0px)' }
                              }}
                              initial="hidden"
                              animate="visible"
                              exit="hidden"
                              transition={{
                                duration: 1.2,
                                ease: [0.2, 0.65, 0.3, 0.9],
                                delay: (wIndex * 5 + cIndex) * 0.03
                              }}
                              className="inline-block hover:text-pastel-apricot transition-colors duration-300 cursor-default"
                              onMouseEnter={() => play('hover')}
                            >
                              {char}
                            </motion.span>
                          ))}
                        </span>
                      ))}
                    </h1>
                  </div>

                  <div className="overflow-hidden max-w-xl">
                    <motion.p
                      initial={{ x: -20, opacity: 0, filter: 'blur(5px)' }}
                      animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
                      exit={{ x: 20, opacity: 0, filter: 'blur(5px)' }}
                      transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                      className="text-white/90 text-lg md:text-xl font-sans font-light leading-relaxed drop-shadow-text-strong border-l-2 border-white/20 pl-8 backdrop-blur-sm selection:bg-white/30"
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
              onClick={() => { prevDesert(); play('click'); }}
              onMouseEnter={() => play('hover')}
              className="text-white/80 hover:text-white transition-colors p-2"
              aria-label="Previous Desert"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </MagneticButton>

            <div className="flex gap-6 items-center mx-6">
               {deserts.map((d, index) => (
                  <div key={index} className="relative flex flex-col items-center group">
                      {/* Tooltip */}
                      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-1 pointer-events-none">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-white/90 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded border border-white/10 whitespace-nowrap shadow-xl">
                              {d.name}
                          </span>
                      </div>

                      <motion.button
                          onClick={() => { setDesert(index); play('click'); }}
                          onMouseEnter={() => play('hover')}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          className="relative p-2 focus:outline-none"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label={`Select ${d.name}`}
                      >
                          {/* Active Ring Pulse */}
                          {index === currentDesertIndex && (
                              <motion.div
                                  className="absolute inset-0 rounded-full border border-white/30"
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1.8, opacity: [0, 0.5, 0] }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                              />
                          )}

                          {/* Dot */}
                          <motion.div
                              className={`rounded-full transition-all duration-500 ${index === currentDesertIndex ? 'bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)]' : 'bg-white/20 group-hover:bg-white/60'}`}
                              animate={{
                                  width: index === currentDesertIndex ? 12 : 8,
                                  height: index === currentDesertIndex ? 12 : 8,
                              }}
                          />
                      </motion.button>
                  </div>
               ))}
            </div>

            <MagneticButton
              onClick={() => { nextDesert(); play('click'); }}
              onMouseEnter={() => play('hover')}
              className="text-white/80 hover:text-white transition-colors p-2"
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
          <div title="Toggle Ambient Sound" className="hover:scale-105 transition-transform duration-300">
            <Soundscape />
          </div>
          <div className="glass-panel p-6 rounded-2xl w-80 shadow-2xl mt-6 border border-white/10 backdrop-blur-2xl">
            <div className="flex justify-between items-end mb-6">
                <label className="text-xs font-bold tracking-[0.2em] uppercase text-white/60">Time of Day</label>
                <div className="flex flex-col items-end">
                     <span className="text-xl font-mono text-white font-light tracking-wider drop-shadow-lg">
                         {Math.floor(dayNightCycle * 24).toString().padStart(2, '0')}:{(Math.floor((dayNightCycle * 24 * 60) % 60)).toString().padStart(2, '0')}
                     </span>
                </div>
            </div>

            <div
                className="relative h-24 flex items-center group"
                onMouseEnter={() => play('hover')}
            >
              {/* Custom Track - Horizon */}
              <div className="absolute left-0 right-0 top-1/2 h-px bg-white/20"></div>

              {/* Draggable Thumb - Orbiting Sun/Moon */}
              <motion.div
                  className={`absolute top-1/2 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center z-10 pointer-events-none transition-all duration-200 ${isTimeFocused ? 'scale-110 border-white/40 ring-2 ring-white ring-offset-2 ring-offset-transparent' : ''}`}
                  style={{
                      left: `${dayNightCycle * 100}%`,
                      x: '-50%',
                      y: '-50%'
                  }}
              >
                   <motion.div
                      animate={{ rotate: dayNightCycle * 360 }}
                      className="text-white relative"
                   >
                      {/* Icon */}
                      {dayNightCycle > 0.25 && dayNightCycle < 0.75 ? (
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1.5" className="drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                      ) : (
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="#6366F1" stroke="#6366F1" strokeWidth="1.5" className="drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                      )}
                   </motion.div>
              </motion.div>

              {/* Input */}
              <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.001"
                  value={dayNightCycle}
                  onChange={(e) => setDayNightCycle(parseFloat(e.target.value))}
                  onFocus={() => setIsTimeFocused(true)}
                  onBlur={() => setIsTimeFocused(false)}
                  className="w-full relative z-20 opacity-0 cursor-pointer h-full"
                  aria-label="Time of Day"
              />
            </div>

            <div className="flex justify-between text-[10px] text-white/40 mt-2 font-mono uppercase tracking-widest">
                <span>Midnight</span>
                <span>Noon</span>
                <span>Midnight</span>
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
