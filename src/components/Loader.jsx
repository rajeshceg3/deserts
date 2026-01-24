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
              className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F2D1C9] text-white"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] } }}
              key="loader"
            >
              <div className="relative w-64 h-1 bg-white/20 rounded-full overflow-hidden">
                 <motion.div
                   className="absolute left-0 top-0 bottom-0 bg-white"
                   initial={{ width: 0 }}
                   animate={{ width: `${progress}%` }}
                   transition={{ duration: 0.1 }}
                 />
              </div>

              <motion.div className="mt-8 text-center h-12">
                 {!loaded ? (
                     <motion.span
                       key="loading"
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 0.7 }}
                       exit={{ opacity: 0 }}
                       className="font-mono text-xs tracking-[0.3em] uppercase"
                     >
                       Loading World... {Math.round(progress)}%
                     </motion.span>
                 ) : (
                    <AnimatePresence>
                        {showButton && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.05, letterSpacing: "0.4em" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onStarted}
                                className="font-serif italic text-2xl md:text-3xl tracking-widest cursor-pointer hover:text-white transition-colors text-white/90"
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
