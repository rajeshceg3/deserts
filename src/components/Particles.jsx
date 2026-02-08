import React, { useRef } from 'react'
import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import * as THREE from 'three'

export const Particles = () => {
  const groupRef = useRef()
  const dayNightCycle = useStore((state) => state.dayNightCycle)

  useFrame((state, delta) => {
    if (groupRef.current) {
        // Rotate group to simulate wind drift
        groupRef.current.rotation.y += delta * 0.05
    }
  })

  // Calculate opacity based on day/night
  // Day: Visible dust (0.5)
  // Night: Faint sparkles (0.2)
  const dayness = Math.sin(dayNightCycle * Math.PI)
  const dustOpacity = 0.2 + dayness * 0.3

  return (
    <group ref={groupRef}>
      {/* White dust/sparkles */}
      <Sparkles
        count={200}
        scale={30}
        size={3}
        speed={0.2}
        opacity={dustOpacity}
        color="#ffffff"
        position={[0, 5, 0]}
      />
      {/* Golden dust - more visible at sunset/sunrise? */}
      <Sparkles
        count={100}
        scale={20}
        size={5}
        speed={0.5}
        opacity={dustOpacity * 0.8}
        color="#ffccaa"
        position={[0, 5, 0]}
        noise={0.5}
      />
    </group>
  )
}
