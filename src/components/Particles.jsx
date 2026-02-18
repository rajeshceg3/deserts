import React, { useRef } from 'react'
import { Sparkles } from '@react-three/drei'
import { useStore } from '../store'
import * as THREE from 'three'

export const Particles = () => {
  const groupRef = useRef()
  const dayNightCycle = useStore((state) => state.dayNightCycle)

  // Calculate opacity based on day/night
  // Day: Visible dust (0.5)
  // Night: Faint sparkles (0.2)
  const dayness = Math.sin(dayNightCycle * Math.PI)
  const dustOpacity = 0.2 + dayness * 0.3

  // Color temperature shift
  // Day: White/Dusty
  // Sunset: Golden
  // Night: Blueish
  // This is handled by having two layers, but we can make it dynamic if we want.
  // The current 2-layer approach is fine.

  return (
    <group ref={groupRef}>
      {/* Ambient Dust - Drifting */}
      <Sparkles
        count={300}
        scale={[40, 20, 40]} // Spread out
        size={4}
        speed={0.4}
        opacity={dustOpacity}
        color="#ffffff"
        position={[0, 5, 0]}
        noise={[1, 0.5, 1]} // multidirectional noise
      />

      {/* Golden/Pollen Motes - More active */}
      <Sparkles
        count={150}
        scale={[30, 15, 30]}
        size={6}
        speed={0.6}
        opacity={dustOpacity * 0.8}
        color="#ffccaa"
        position={[0, 5, 0]}
        noise={[2, 1, 2]} // More chaotic
      />
    </group>
  )
}
