import React, { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'

export const Cursor = () => {
  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)

  // Fluid physics for the trailing circle
  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
  const [ripples, setRipples] = useState([])

  const [isTouch] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
      return true
    }
    return false
  })

  useEffect(() => {
    if (isTouch) return

    const moveCursor = (e) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      if (!isVisible) setIsVisible(true)
    }

    const checkHover = (e) => {
      const target = e.target;
      // Expanded interactive elements selector
      const isInteractive =
        target.matches('button, a, input, select, textarea, [role="button"], [role="link"], .cursor-pointer, .interactive') ||
        target.closest('button, a, input, select, textarea, [role="button"], [role="link"], .cursor-pointer, .interactive') ||
        window.getComputedStyle(target).cursor === 'pointer';

      setIsHovered(!!isInteractive)
    }

    const handleMouseDown = (e) => {
        setIsClicked(true)
        // Add a new ripple
        const newRipple = { id: Date.now(), x: e.clientX, y: e.clientY }
        setRipples(prev => [...prev.slice(-4), newRipple]) // Keep last 5 ripples
    }
    const handleMouseUp = () => setIsClicked(false)

    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('mouseover', checkHover)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mouseover', checkHover)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [mouseX, mouseY, isVisible, isTouch])

  // Cleanup ripples
  useEffect(() => {
      if (ripples.length > 0) {
          const timer = setTimeout(() => {
              setRipples(prev => prev.slice(1))
          }, 1000)
          return () => clearTimeout(timer)
      }
  }, [ripples])

  if (isTouch) return null

  return (
    <>
      {/* Glow Effect */}
      <motion.div
        className="fixed top-0 left-0 w-32 h-32 rounded-full pointer-events-none z-[9996] mix-blend-exclusion"
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 0.4 : 0,
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
          filter: 'blur(10px)'
        }}
        transition={{ opacity: { duration: 0.2 } }}
      />

      {/* Ripples */}
      <AnimatePresence>
          {ripples.map((ripple) => (
              <motion.div
                  key={ripple.id}
                  className="fixed pointer-events-none z-[9997] border border-white/50 rounded-full mix-blend-exclusion"
                  initial={{
                      left: ripple.x,
                      top: ripple.y,
                      width: 10,
                      height: 10,
                      x: '-50%',
                      y: '-50%',
                      opacity: 1,
                      scale: 1
                  }}
                  animate={{
                      width: 100,
                      height: 100,
                      opacity: 0,
                      scale: 1.5
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
              />
          ))}
      </AnimatePresence>

      {/* Trailing Circle */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border rounded-full pointer-events-none z-[9998] mix-blend-exclusion transition-colors duration-300"
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 1 : 0,
          borderColor: 'rgba(255, 255, 255, 0.8)'
        }}
        animate={{
          scale: isClicked ? 0.8 : (isHovered ? 2.5 : 1),
          backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
          borderWidth: isHovered ? '1px' : '2px',
        }}
        transition={{
          scale: { duration: 0.2 },
          backgroundColor: { duration: 0.2 }
        }}
      />

      {/* Main Cursor Dot */}
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 bg-white rounded-full pointer-events-none z-[9999] mix-blend-exclusion backdrop-invert"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 1 : 0
        }}
        animate={{
            scale: isClicked ? 0.5 : (isHovered ? 0 : 1) // Disappear when hovering (the ring takes over) or scale down on click
        }}
      />

      {/* Hover Icon (optional, e.g. Drag indicator) */}
      <motion.div
          className="fixed top-0 left-0 pointer-events-none z-[9999] text-white mix-blend-exclusion text-[10px] font-mono tracking-widest uppercase"
          style={{
              x: mouseX,
              y: mouseY,
              translateX: '-50%',
              translateY: '20px',
              opacity: isHovered ? 1 : 0
          }}
      >
      </motion.div>
    </>
  )
}
