import React, { useRef, useMemo } from 'react'
import { Sparkles } from '@react-three/drei'
import { useStore } from '../store'
import * as THREE from 'three'

export const Particles = () => {
  const groupRef = useRef()
  const dayNightCycle = useStore((state) => state.dayNightCycle)

  // Calculate colors and opacity based on day/night cycle
  const { dustColor, moteColor, opacity } = useMemo(() => {
    const dayness = Math.sin(dayNightCycle * Math.PI)
    const opacity = 0.2 + dayness * 0.3

    const sunColor = new THREE.Color('#fff0d0'); // Warm white
    const sunsetColor = new THREE.Color('#ffaa44'); // Orange
    const nightColor = new THREE.Color('#88ccff'); // Light Blue

    const dColor = new THREE.Color();
    const mColor = new THREE.Color();

    if (dayness > 0.5) {
        // Noon to Sunset/Sunrise transition
        // dayness goes 0 -> 1 -> 0.
        // 1 is noon. 0 is horizon.
        const t = (dayness - 0.5) * 2.0; // 0 to 1 (Sunset to Noon)
        dColor.copy(sunsetColor).lerp(sunColor, t);
        mColor.copy(sunsetColor).lerp(new THREE.Color('#ffd700'), t);
    } else {
        // Night to Sunrise/Sunset
        const t = dayness * 2.0; // 0 to 1 (Night to Sunrise)
        dColor.copy(nightColor).lerp(sunsetColor, t);
        mColor.copy(nightColor).lerp(new THREE.Color('#ff8800'), t);
    }

    return {
        dustColor: dColor.getStyle(),
        moteColor: mColor.getStyle(),
        opacity
    }
  }, [dayNightCycle])

  return (
    <group ref={groupRef}>
      {/* Ambient Dust - Drifting */}
      <Sparkles
        count={300}
        scale={[40, 20, 40]} // Spread out
        size={4}
        speed={0.4}
        opacity={opacity}
        color={dustColor}
        position={[0, 5, 0]}
        noise={[1, 0.5, 1]} // multidirectional noise
      />

      {/* Highlights/Pollen Motes - More active */}
      <Sparkles
        count={150}
        scale={[30, 15, 30]}
        size={6}
        speed={0.6}
        opacity={opacity * 0.8}
        color={moteColor}
        position={[0, 5, 0]}
        noise={[2, 1, 2]} // More chaotic
      />
    </group>
  )
}
