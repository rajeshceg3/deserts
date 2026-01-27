import React, { useState, useEffect } from 'react'
import { useProgress } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'

export const Loader = ({ onStarted, started }) => {
  const { progress, active } = useProgress()
  const [loaded, setLoaded] = useState(false)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    // If progress is 100 or nothing is loading (active is false), we are done.
    // We also want to ensure a minimum display time for the loader, so we can use a timeout.
    if (progress >= 100 || (!active && progress === 0)) {
      const timer = setTimeout(() => setLoaded(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [progress, active])

  useEffect(() => {
    if (loaded) {
       const timer = setTimeout(() => setShowButton(true), 100)
       return () => clearTimeout(timer)
    }
  }, [loaded])

  return (
    <AnimatePresence mode="wait">
        {!started && (
            <motion.div
              className="fixed inset-0 z-[100] flex flex-col items-center justify-center text-white overflow-hidden bg-gradient-to-br from-pastel-rose via-pastel-lilac to-pastel-mint"
              initial={{ opacity: 1 }}
              exit={{
                opacity: 0,
                scale: 1.5,
                filter: 'blur(10px)',
                transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] }
              }}
              key="loader"
            >
              {/* Noise Overlay */}
              <div className="absolute inset-0 opacity-10 noise-overlay pointer-events-none" />

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
                              className="text-white/20"
                              animate={{ opacity: [0.2, 0.4, 0.2] }}
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
                          <span className="font-mono text-sm tracking-widest text-white/80">
                              {Math.round(progress)}%
                          </span>
                      </div>
                  </div>

                  <div className="h-16 flex items-center justify-center">
                     {!loaded ? (
                         <motion.span
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           exit={{ opacity: 0 }}
                           className="font-serif italic text-lg text-white/60"
                         >
                           Building Atmosphere...
                         </motion.span>
                     ) : (
                        <AnimatePresence>
                            {showButton && (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ scale: 1.05, letterSpacing: "0.2em" }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onStarted}
                                    className="px-8 py-3 glass-panel rounded-full font-serif text-xl tracking-widest text-white hover:bg-white/20 transition-all duration-300 border border-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                >
                                    Enter Experience
                                </motion.button>
                            )}
                        </AnimatePresence>
                     )}
                  </div>

                  {/* Headphones Recommendation */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: loaded ? 0.5 : 0 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-12 text-[10px] font-mono tracking-[0.3em] uppercase text-white/40"
                  >
                    Headphones Recommended
                  </motion.div>
              </div>
            </motion.div>
        )}
    </AnimatePresence>
  )
}
