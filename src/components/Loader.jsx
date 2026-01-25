import React, { useState, useEffect } from 'react'
import { useProgress } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'

export const Loader = ({ onStarted, started }) => {
  const { progress } = useProgress()
  const [loaded, setLoaded] = useState(false)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => setLoaded(true), 500)
      return () => clearTimeout(timer)
    }
  }, [progress])

  useEffect(() => {
    if (loaded) {
       const timer = setTimeout(() => setShowButton(true), 500)
       return () => clearTimeout(timer)
    }
  }, [loaded])

  return (
    <AnimatePresence mode="wait">
        {!started && (
            <motion.div
              className="fixed inset-0 z-[100] flex flex-col items-center justify-center text-white overflow-hidden"
              style={{
                background: 'radial-gradient(circle at center, #F0AFA0 0%, #F2D1C9 40%, #DCD6F7 100%)'
              }}
              initial={{ opacity: 1 }}
              exit={{
                opacity: 0,
                scale: 1.1,
                filter: 'blur(20px)',
                transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] }
              }}
              key="loader"
            >
              {/* Decorative background elements */}
              <div className="absolute inset-0 opacity-20 noise-overlay" />

              <div className="relative w-64 h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                 <motion.div
                   className="absolute left-0 top-0 bottom-0 bg-white box-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                   initial={{ width: 0 }}
                   animate={{ width: `${progress}%` }}
                   transition={{ duration: 0.1 }}
                 />
              </div>

              <motion.div className="mt-8 text-center h-12 relative z-10">
                 {!loaded ? (
                     <motion.span
                       key="loading"
                       initial={{ opacity: 0 }}
                       animate={{
                         opacity: [0.4, 1, 0.4],
                         transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                       }}
                       exit={{ opacity: 0 }}
                       className="font-mono text-xs tracking-[0.3em] uppercase drop-shadow-md"
                     >
                       Loading World... {Math.round(progress)}%
                     </motion.span>
                 ) : (
                    <AnimatePresence>
                        {showButton && (
                            <motion.button
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                whileHover={{ scale: 1.1, letterSpacing: "0.5em" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onStarted}
                                className="font-serif italic text-3xl md:text-4xl tracking-widest cursor-pointer text-white drop-shadow-lg"
                                style={{ textShadow: '0 0 20px rgba(255,255,255,0.5)' }}
                            >
                                Enter
                            </motion.button>
                        )}
                    </AnimatePresence>
                 )}
              </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
  )
}
