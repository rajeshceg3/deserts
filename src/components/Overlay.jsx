import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useStore } from '../store'
import { deserts } from '../data/deserts'
import { getSkyColor } from '../utils/colorUtils'
import { Soundscape } from './Soundscape'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { useUISound } from '../hooks/useUISound'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

const MagneticButton = ({ children, onClick, className = "", "aria-label": ariaLabel, onMouseEnter }) => {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const bounds = useRef({ left: 0, top: 0, width: 0, height: 0 })
  const prefersReducedMotion = usePrefersReducedMotion()

  const springConfig = { damping: 40, stiffness: 300, mass: 0.5 }
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
    if (prefersReducedMotion) return;

    const { clientX, clientY } = e
    const { left, top, width, height } = bounds.current
    const centerX = left + width / 2
    const centerY = top + height / 2
    const distanceX = clientX - centerX
    const distanceY = clientY - centerY

    if (Math.abs(distanceX) < width && Math.abs(distanceY) < height) {
        const moveX = distanceX * 0.2
        const moveY = distanceY * 0.2
        // Clamp movement to avoid excessive displacement
        x.set(Math.max(-15, Math.min(15, moveX)))
        y.set(Math.max(-15, Math.min(15, moveY)))
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
    const prefersReducedMotion = usePrefersReducedMotion()

    useEffect(() => {
        if (prefersReducedMotion) return;

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
    }, [x, y, prefersReducedMotion])

    if (prefersReducedMotion) {
      return <div>{children}</div>
    }

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
  const visitedDeserts = useStore((state) => state.visitedDeserts)
  const markVisited = useStore((state) => state.markVisited)
  const prefersReducedMotion = usePrefersReducedMotion()

  const { play } = useUISound()

  useEffect(() => {
    markVisited(currentDesertIndex)
  }, [currentDesertIndex, markVisited])

  const desert = deserts[currentDesertIndex]
  const [zenMode, setZenMode] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showJournal, setShowJournal] = useState(false)
  const [isTimeFocused, setIsTimeFocused] = useState(false)
  const [copied, setCopied] = useState(false)

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
        if (!started || zenMode) return;

        if (e.key === 'ArrowLeft') {
            prevDesert();
            play('click');
        } else if (e.key === 'ArrowRight') {
            nextDesert();
            play('click');
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [started, zenMode, prevDesert, nextDesert, play]);

  const handleKeyDown = (e, index) => {
      if (e.key === 'Enter' || e.key === ' ') {
          setDesert(index);
          play('click');
      }
  }

  // Greeting Logic
  const getGreeting = () => {
      if (dayNightCycle >= 0.2 && dayNightCycle < 0.45) return "Good Morning";
      if (dayNightCycle >= 0.45 && dayNightCycle < 0.6) return "Good Afternoon";
      if (dayNightCycle >= 0.6 && dayNightCycle < 0.8) return "Good Evening";
      return "Good Night";
  }

  const handleShare = () => {
      const text = `Exploring ${desert?.name} in Desert Realms!`;
      navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          play('click');
          setTimeout(() => setCopied(false), 2000);
      }).catch(err => console.error('Failed to copy:', err));
  };

  const sliderGradient = useMemo(() => {
     if (!desert) return 'linear-gradient(to right, #000, #fff)';
     const points = [0, 0.25, 0.5, 0.75, 1];
     const colors = points.map(p => {
         const c = getSkyColor(p, desert.colors);
         return '#' + c.getHexString();
     });
     return `linear-gradient(to right, ${colors.join(', ')})`;
  }, [desert]);

  return (
    <motion.div
        className="absolute top-0 left-0 w-full h-full z-10 flex flex-col justify-between p-8 md:p-12"
        initial={{ opacity: 0, pointerEvents: 'none' }}
        animate={{ opacity: started ? 1 : 0, pointerEvents: started ? 'auto' : 'none' }}
        transition={{ duration: 1.5, ease: "easeOut" }}
    >
        {/* Vignette Overlay */}
        <div className="pointer-events-none fixed inset-0 z-0 bg-radial-vignette opacity-70" aria-hidden="true" />

        {/* Top Left Controls */}
        <div className="absolute top-8 left-8 pointer-events-auto z-50 flex flex-col gap-4">
           {/* Zen Mode Toggle */}
           <MagneticButton
             onClick={() => {
                setZenMode(!zenMode);
                play('click');
             }}
             onMouseEnter={() => play('hover')}
             className="group relative"
             aria-label={zenMode ? "Show UI" : "Enable Zen Mode"}
           >
             <motion.div
               className="glass-panel p-3 rounded-full hover:bg-white/20 transition-all duration-300"
               animate={{ scale: zenMode ? [1, 1.05, 1] : 1 }}
               transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
             >
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
             </motion.div>

             <div className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-2 pointer-events-none">
                <span className="text-xs font-mono uppercase tracking-widest text-white/90 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded border border-white/10 whitespace-nowrap shadow-xl">
                  {zenMode ? "Show UI" : "Zen Mode"}
                </span>
             </div>
           </MagneticButton>

           {/* Help Button */}
           <MagneticButton
             onClick={() => {
                setShowHelp(true);
                play('click');
             }}
             onMouseEnter={() => play('hover')}
             className={`group relative transition-opacity duration-300 ${zenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
             aria-label="Help & Controls"
           >
             <div className="glass-panel p-3 rounded-full hover:bg-white/20 transition-all duration-300">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/90">
                 <circle cx="12" cy="12" r="10"></circle>
                 <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                 <line x1="12" y1="17" x2="12.01" y2="17"></line>
               </svg>
             </div>

             <div className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-2 pointer-events-none">
                <span className="text-xs font-mono uppercase tracking-widest text-white/90 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded border border-white/10 whitespace-nowrap shadow-xl">
                  Help
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
              aria-live="polite"
            >
              <Tilt>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="mb-2 flex flex-col gap-2"
                  >
                     {/* Greeting */}
                     <span className="text-sm font-mono uppercase tracking-[0.2em] text-white/60 drop-shadow-md">
                        {getGreeting()}
                     </span>

                     <div className="flex items-center gap-4">
                        <span className="font-serif italic text-2xl text-white/80 drop-shadow-md">
                        {(currentDesertIndex + 1).toString().padStart(2, '0')}
                        </span>
                        <div className="h-[1px] w-12 bg-white/50" />
                        <span className="font-serif italic text-xl text-white/80 drop-shadow-md">
                        {deserts.length.toString().padStart(2, '0')}
                        </span>
                     </div>
                  </motion.div>

                  <div className="overflow-hidden mb-6 py-2">
                    <h1 className="text-8xl md:text-10xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/50 drop-shadow-text-strong tracking-tighter font-serif flex flex-wrap gap-x-8 pb-4">
                      {(desert?.name?.split(" ") || []).map((word, wIndex) => (
                        <span key={wIndex} className="inline-block whitespace-nowrap">
                          {word.split("").map((char, cIndex) => (
                            <motion.span
                              key={`${wIndex}-${cIndex}`}
                              variants={{
                                hidden: { y: prefersReducedMotion ? 0 : 100, opacity: 0, filter: 'blur(20px)' },
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

                  <div className="overflow-hidden max-w-xl space-y-4">
                    {/* Lore / Description */}
                    <motion.div
                      initial={{ x: prefersReducedMotion ? 0 : -20, opacity: 0, filter: 'blur(5px)' }}
                      animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
                      exit={{ x: prefersReducedMotion ? 0 : 20, opacity: 0, filter: 'blur(5px)' }}
                      transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                      className="bg-black/10 backdrop-blur-sm rounded-lg p-6 border-l-2 border-white/20"
                    >
                      <p className="text-white/90 text-lg md:text-xl font-sans font-light leading-relaxed drop-shadow-text-strong selection:bg-white/30">
                        {desert?.lore || desert?.description}
                      </p>

                      {/* Factoid */}
                      {desert?.factoid && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                              <p className="italic text-white/70 text-sm">
                                  <span className="font-bold not-italic text-white/50 uppercase text-xs tracking-wider mr-2">Did You Know?</span>
                                  {desert.factoid}
                              </p>
                          </div>
                      )}
                    </motion.div>

                    {/* Features & Info Badges */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="flex flex-wrap gap-2 max-w-xl"
                    >
                        {desert?.climate && (
                             <span className="px-3 py-1 bg-white/5 backdrop-blur-md rounded-full text-xs font-mono uppercase tracking-wider text-white/80 border border-white/10 shadow-sm" title="Climate">
                                🌡️ {desert.climate}
                             </span>
                        )}

                        {/* Sound Profile */}
                        {desert?.soundProfile && (
                             <span className="px-3 py-1 bg-white/5 backdrop-blur-md rounded-full text-xs font-mono uppercase tracking-wider text-white/80 border border-white/10 shadow-sm" title="Soundscape">
                                🔊 {desert.soundProfile}
                             </span>
                        )}

                        {/* Creatures */}
                         {desert?.creatures?.map((creature, i) => (
                             <span key={`cr-${i}`} className="px-3 py-1 bg-white/5 backdrop-blur-md rounded-full text-xs font-mono uppercase tracking-wider text-white/80 border border-white/10 shadow-sm" title="Native Fauna">
                                🐾 {creature}
                             </span>
                        ))}

                        {/* Flora */}
                        {desert?.flora?.map((plant, i) => (
                             <span key={`fl-${i}`} className="px-3 py-1 bg-white/5 backdrop-blur-md rounded-full text-xs font-mono uppercase tracking-wider text-white/80 border border-white/10 shadow-sm" title="Native Flora">
                                🌿 {plant}
                             </span>
                        ))}

                        {/* Standard Features */}
                        {desert?.features?.map((feature, i) => (
                             <span key={i} className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs text-white/90 border border-white/20 shadow-sm">
                                {feature}
                             </span>
                        ))}
                    </motion.div>
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
                          <span className="text-xs font-mono uppercase tracking-widest text-white/90 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded border border-white/10 whitespace-nowrap shadow-xl">
                              {d?.name}
                          </span>
                      </div>

                      <motion.button
                          onClick={() => { setDesert(index); play('click'); }}
                          onMouseEnter={() => play('hover')}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          className="relative p-2 focus:outline-none"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label={`Select ${d?.name}`}
                      >
                          {/* Active Ring Pulse */}
                          {index === currentDesertIndex && (
                              <motion.div
                                  className="absolute inset-0 rounded-full border border-white/30"
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={prefersReducedMotion ? { scale: 1.2, opacity: 1 } : { scale: 1.8, opacity: [0, 0.5, 0] }}
                                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: "easeOut" }}
                              />
                          )}

                          {/* Dot */}
                          <motion.div
                              className={`rounded-full transition-all duration-500 ${index === currentDesertIndex ? 'bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)]' : (visitedDeserts.includes(index) ? 'bg-white/50 group-hover:bg-white/80' : 'bg-white/20 group-hover:bg-white/40')}`}
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
          <div className="flex flex-col gap-4 items-end">
             {/* Journal Button */}
             <div className="relative group">
                <button
                    onClick={() => { setShowJournal(true); play('click'); }}
                    onMouseEnter={() => play('hover')}
                    className="bg-black/30 backdrop-blur-md text-white p-4 rounded-full border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300"
                    aria-label="Open Journal"
                    title="Explorer's Journal"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                </button>
             </div>

             {/* Share Button */}
             <div className="relative group">
                <button
                    onClick={handleShare}
                    onMouseEnter={() => play('hover')}
                    className="bg-black/30 backdrop-blur-md text-white p-4 rounded-full border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300"
                    aria-label="Share Location"
                    title="Copy Link"
                >
                    {copied ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3"></circle>
                            <circle cx="6" cy="12" r="3"></circle>
                            <circle cx="18" cy="19" r="3"></circle>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                    )}
                </button>
                {/* Copied Tooltip */}
                <AnimatePresence>
                    {copied && (
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute right-16 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded border border-white/10 whitespace-nowrap"
                        >
                            Copied to clipboard!
                        </motion.div>
                    )}
                </AnimatePresence>
             </div>

             <div title="Toggle Ambient Sound" className="hover:scale-105 transition-transform duration-300">
                <Soundscape />
             </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl w-80 shadow-2xl mt-6 border border-white/10 backdrop-blur-2xl">
            <div className="flex justify-between items-end mb-6">
                <label className="text-xs font-bold tracking-[0.2em] uppercase text-white/90 drop-shadow-md">Time of Day</label>
                <div className="flex flex-col items-end">
                     <span className="text-xl font-mono text-white font-light tracking-wider drop-shadow-lg">
                         {Math.floor(dayNightCycle * 24).toString().padStart(2, '0')}:{(Math.floor((dayNightCycle * 24 * 60) % 60)).toString().padStart(2, '0')}
                     </span>
                </div>
            </div>

            <div
                className={`relative h-24 flex items-center group rounded-xl transition-all duration-300 ${isTimeFocused ? 'bg-white/5 ring-1 ring-white/30' : ''}`}
                onMouseEnter={() => play('hover')}
            >
              {/* Custom Track - Horizon */}
              <div className="absolute left-0 right-0 top-1/2 h-0.5 rounded-full" style={{ background: sliderGradient, opacity: 0.8 }}></div>

              {/* Draggable Thumb - Orbiting Sun/Moon */}
              <motion.div
                  className={`absolute top-1/2 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center z-10 pointer-events-none transition-all duration-200 ${isTimeFocused ? 'scale-110 border-white/40 ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`}
                  style={{
                      left: `${dayNightCycle * 100}%`,
                      x: '-50%',
                      y: '-50%'
                  }}
              >
                   <motion.div
                      animate={{ rotate: prefersReducedMotion ? 0 : dayNightCycle * 360 }}
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
                  className="w-full relative z-20 opacity-0 cursor-pointer h-full focus-visible:outline-none"
                  aria-label="Time of Day"
              />
            </div>

            <div className="flex justify-between text-xs text-white/70 mt-2 font-mono uppercase tracking-widest drop-shadow-sm">
                <span className="flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> Midnight</span>
                <span className="flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> Noon</span>
                <span className="flex items-center gap-2">Midnight <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg></span>
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
               <button onClick={() => { setDayNightCycle(0.25); play('click'); }} className="text-white/50 hover:text-white text-[10px] md:text-xs uppercase tracking-widest transition-colors font-mono" title="Set time to Sunrise">Sunrise</button>
               <button onClick={() => { setDayNightCycle(0.5); play('click'); }} className="text-white/50 hover:text-white text-[10px] md:text-xs uppercase tracking-widest transition-colors font-mono" title="Set time to Noon">Noon</button>
               <button onClick={() => { setDayNightCycle(0.75); play('click'); }} className="text-white/50 hover:text-white text-[10px] md:text-xs uppercase tracking-widest transition-colors font-mono" title="Set time to Sunset">Sunset</button>
               <button onClick={() => { setDayNightCycle(0); play('click'); }} className="text-white/50 hover:text-white text-[10px] md:text-xs uppercase tracking-widest transition-colors font-mono" title="Set time to Midnight">Night</button>
            </div>
          </div>
        </div>

        {/* Footer / Instructions */}
        <div className={`absolute bottom-8 right-8 text-white/90 text-xs pointer-events-none font-mono tracking-widest uppercase hidden md:block transition-all duration-1000 ease-[0.2,0.65,0.3,0.9] ${zenMode ? 'opacity-0 translate-y-10 blur-sm' : 'opacity-100 translate-y-0 blur-0'}`}>
          Drag to explore • Scroll to zoom
        </div>

        {/* Exploration Progress */}
        <div className={`absolute bottom-8 left-8 text-white/90 text-xs pointer-events-none font-mono tracking-widest uppercase transition-all duration-1000 ease-[0.2,0.65,0.3,0.9] ${zenMode ? 'opacity-0 translate-y-10 blur-sm' : 'opacity-100 translate-y-0 blur-0'}`}>
          Explored: {visitedDeserts.length} / {deserts.length}
        </div>

        {/* Help Modal */}
        <AnimatePresence>
            {showHelp && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
                    onClick={() => setShowHelp(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="glass-panel p-8 md:p-12 rounded-2xl max-w-2xl w-full border border-white/10 shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowHelp(false)}
                            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                            aria-label="Close Help"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        <h2 className="text-3xl font-serif text-white mb-2">Desert Realms</h2>
                        <p className="text-white/60 font-mono text-sm uppercase tracking-widest mb-8 border-b border-white/10 pb-4">Immersive Exploration Experience</p>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-white/80 font-bold mb-2 flex items-center gap-2">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg> Navigation
                                    </h3>
                                    <p className="text-white/60 text-sm leading-relaxed">
                                        Use <kbd className="bg-white/10 px-1 rounded">Arrow Keys</kbd> or the bottom navigation to travel between deserts.
                                        <br/>
                                        <span className="md:hidden">Drag</span><span className="hidden md:inline">Click & Drag</span> to look around.
                                        <br/>
                                        Scroll to zoom in/out.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-white/80 font-bold mb-2 flex items-center gap-2">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg> Zen Mode
                                    </h3>
                                    <p className="text-white/60 text-sm leading-relaxed">
                                        Toggle the UI off for a purely cinematic experience. Perfect for screenshots or meditation.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-white/80 font-bold mb-2 flex items-center gap-2">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> Time & Atmosphere
                                    </h3>
                                    <p className="text-white/60 text-sm leading-relaxed">
                                        Drag the sun/moon icon in the top right control panel to change the time of day. The environment, lighting, and soundscape will react dynamically.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-white/80 font-bold mb-2 flex items-center gap-2">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> Soundscape
                                    </h3>
                                    <p className="text-white/60 text-sm leading-relaxed">
                                        Enable audio for procedural wind and ambient effects generated in real-time.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10 text-center text-white/40 text-xs font-mono">
                            Designed & Developed for You • {new Date().getFullYear()}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Journal Modal */}
        <AnimatePresence>
            {showJournal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
                    onClick={() => setShowJournal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0.9, opacity: 0, rotate: 2 }}
                        className="bg-[#Fdfbf7] text-[#2c2c2c] p-8 md:p-12 rounded-sm max-w-lg w-full shadow-2xl relative font-serif"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowJournal(false)}
                            className="absolute top-4 right-4 text-black/30 hover:text-black/60 transition-colors z-10"
                            aria-label="Close Journal"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        <div className="relative z-10">
                            <h2 className="text-xl font-bold mb-6 italic text-black/80 border-b border-black/10 pb-4">Explorer's Log</h2>

                            <p className="text-lg leading-relaxed mb-6 font-medium">
                                {desert?.journalEntry}
                            </p>

                            <div className="flex justify-end mt-8">
                                <span className="font-handwriting text-sm text-black/50">
                                    — {desert?.name}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>
  )
}
