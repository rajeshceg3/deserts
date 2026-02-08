import React, { useState, useEffect } from 'react'
import { useProgress } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

export const Loader = ({ onStarted, started, ready }) => {
  const { progress, active } = useProgress()
  const [loaded, setLoaded] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const [slowLoading, setSlowLoading] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    // Fallback: If loading takes too long (e.g. asset hang), enable slow loading mode
    const fallbackTimer = setTimeout(() => {
        if (!loaded) {
            setSlowLoading(true)
        }
    }, 15000)

    if (loaded) return () => clearTimeout(fallbackTimer)

    if (progress >= 100 || (!active && progress === 0)) {
      // Defer state update to avoid synchronous render warning
      const t = setTimeout(() => setLoaded(true), 0)
      return () => {
        clearTimeout(t)
        clearTimeout(fallbackTimer)
      }
    }
    return () => clearTimeout(fallbackTimer)
  }, [progress, active, loaded])

  useEffect(() => {
    if (loaded && ready) {
       const timer = setTimeout(() => setShowButton(true), 100)
       return () => clearTimeout(timer)
    }
  }, [loaded, ready])

  return (
    <AnimatePresence mode="wait">
        {!started && (
            <motion.div
              role="dialog"
              aria-label="Loading Application"
              className="fixed inset-0 z-[100] flex flex-col items-center justify-center text-white overflow-hidden"
              initial={{ opacity: 1 }}
              exit={{
                opacity: 0,
                scale: prefersReducedMotion ? 1 : 1.5,
                filter: prefersReducedMotion ? 'none' : 'blur(10px)',
                transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] }
              }}
              key="loader"
            >
              {/* Animated Gradient Background */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-pastel-rose via-pastel-lilac to-pastel-mint loader-background" />

              {/* Circular Progress Structure */}
              <div className="relative z-10 flex flex-col items-center">
                  <div className="relative w-32 h-32 mb-8">
                      {/* Background Circle */}
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <motion.circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1"
                              className="text-white/40"
                              animate={{ opacity: prefersReducedMotion ? 0.3 : [0.2, 0.4, 0.2] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          />
                          {/* Progress Circle */}
                          <motion.circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: progress / 100 }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                      </svg>

                      {/* Center Text */}
                      <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-mono text-sm tracking-widest text-white/80 drop-shadow-md">
                              {Math.round(progress)}%
                          </span>
                      </div>
                  </div>

                  <div className="h-24 flex flex-col items-center justify-center">
                     {!showButton && !slowLoading ? (
                         <motion.span
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           exit={{ opacity: 0 }}
                           className="font-serif italic text-lg text-white/80 drop-shadow-md"
                         >
                           Building Atmosphere...
                         </motion.span>
                     ) : (
                        <AnimatePresence>
                            {(showButton || slowLoading) && (
                                <div className="flex flex-col items-center gap-2">
                                    {slowLoading && !loaded && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-xs font-mono text-white/70 bg-black/30 px-3 py-1 rounded backdrop-blur-md"
                                        >
                                            Loading taking longer than expected...
                                        </motion.span>
                                    )}
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={prefersReducedMotion ? {} : { scale: 1.05, letterSpacing: "0.2em" }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={onStarted}
                                        className="px-8 py-3 glass-panel rounded-full font-serif text-xl tracking-widest text-white hover:bg-white/20 transition-all duration-300 border border-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white drop-shadow-md"
                                    >
                                        {slowLoading && !loaded ? "Enter Anyway" : "Enter Experience"}
                                    </motion.button>
                                </div>
                            )}
                        </AnimatePresence>
                     )}
                  </div>

                  {/* Headphones Recommendation */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: loaded ? 0.9 : 0 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-12 text-xs font-mono tracking-[0.3em] uppercase text-white/80 drop-shadow-md"
                  >
                    Headphones Recommended
                  </motion.div>
              </div>
            </motion.div>
        )}
    </AnimatePresence>
  )
}
