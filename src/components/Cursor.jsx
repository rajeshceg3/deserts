import React, { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'

export const Cursor = () => {
  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)

  const springConfig = { damping: 20, stiffness: 400, mass: 0.5 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    // Hide custom cursor on touch devices to avoid double cursor/UX issues
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
        setIsTouch(true)
        return
    }

    const moveCursor = (e) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      if (!isVisible) setIsVisible(true)
    }

    const checkHover = (e) => {
      const target = e.target;
      const isInteractive =
        target.matches('button, a, input, select, textarea, [role="button"], [role="link"], .cursor-pointer') ||
        target.closest('button, a, input, select, textarea, [role="button"], [role="link"], .cursor-pointer') ||
        window.getComputedStyle(target).cursor === 'pointer';

      setIsHovered(!!isInteractive)
    }

    const handleMouseDown = () => setIsClicked(true)
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
  }, [mouseX, mouseY, isVisible])

  if (isTouch) return null

  return (
    <>
      {/* Main Cursor Dot */}
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 bg-white rounded-full pointer-events-none z-[9999] mix-blend-exclusion"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 1 : 0
        }}
        animate={{
            scale: isClicked ? 0.5 : 1
        }}
      />

      {/* Trailing Circle */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-white rounded-full pointer-events-none z-[9998] mix-blend-exclusion"
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 1 : 0
        }}
        animate={{
          scale: isClicked ? 0.8 : (isHovered ? 2.5 : 1),
          backgroundColor: isHovered ? 'rgba(255, 255, 255, 1)' : 'transparent',
          borderColor: isHovered ? 'transparent' : 'white'
        }}
        transition={{
          scale: { duration: 0.2 },
          backgroundColor: { duration: 0.2 }
        }}
      />
    </>
  )
}
