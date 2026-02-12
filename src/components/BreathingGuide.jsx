import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const BreathingGuide = () => {
  const [phase, setPhase] = useState('Inhale'); // Inhale, Hold, Exhale

  useEffect(() => {
    let isMounted = true;

    const cycle = async () => {
      while (isMounted) {
        if (!isMounted) break;
        setPhase('Inhale');
        await new Promise(r => setTimeout(r, 4000));

        if (!isMounted) break;
        setPhase('Hold');
        await new Promise(r => setTimeout(r, 2000));

        if (!isMounted) break;
        setPhase('Exhale');
        await new Promise(r => setTimeout(r, 4000));
      }
    };

    cycle();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-8 pointer-events-none select-none">
      <div className="relative flex items-center justify-center w-64 h-64">

        {/* Animated Rings for visual depth */}
        <motion.div
            className="absolute inset-0 rounded-full border border-white/10"
            animate={{
                scale: phase === 'Inhale' ? 1.6 : 1.2,
                opacity: phase === 'Inhale' ? 0.4 : 0.1,
            }}
            transition={{ duration: phase === 'Hold' ? 0.5 : 4, ease: "easeInOut" }}
        />

        <motion.div
            className="absolute inset-0 rounded-full border border-white/20"
            animate={{
                scale: phase === 'Inhale' ? 1.5 : 1,
                opacity: phase === 'Inhale' ? 0.6 : 0.2,
            }}
            transition={{ duration: phase === 'Hold' ? 0.5 : 4, ease: "easeInOut" }}
        />

        {/* Main Breathing Circle */}
        <motion.div
          className="w-32 h-32 bg-white/5 backdrop-blur-md rounded-full border border-white/30 shadow-[0_0_50px_rgba(255,255,255,0.1)] flex items-center justify-center relative z-10"
          animate={{
            scale: phase === 'Inhale' ? 1.5 : phase === 'Hold' ? 1.52 : 1,
            backgroundColor: phase === 'Hold' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
            borderColor: phase === 'Hold' ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)'
          }}
          transition={{
            duration: phase === 'Hold' ? 1 : 4,
            ease: "easeInOut"
          }}
        >
          {/* Inner Core */}
          <motion.div
            className="w-2 h-2 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,1)]"
            animate={{
                opacity: phase === 'Hold' ? 1 : 0.4,
                scale: phase === 'Hold' ? 1.5 : 1
            }}
            transition={{ duration: 1 }}
          />
        </motion.div>
      </div>

      <div className="h-8 relative overflow-hidden w-full flex justify-center">
        <AnimatePresence mode="wait">
            <motion.span
                key={phase}
                initial={{ y: 20, opacity: 0, filter: 'blur(5px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                exit={{ y: -20, opacity: 0, filter: 'blur(5px)' }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-white/80 font-mono uppercase tracking-[0.4em] text-sm absolute drop-shadow-lg"
            >
                {phase}
            </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};
