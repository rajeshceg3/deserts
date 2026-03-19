import React, { useRef, useMemo } from 'react'
import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import * as THREE from 'three'

export const Particles = () => {
  const dustRef = useRef()
  const moteRef = useRef()

  const sunColor = useMemo(() => new THREE.Color('#fff0d0'), [])
  const sunsetColor = useMemo(() => new THREE.Color('#ffaa44'), [])
  const nightColor = useMemo(() => new THREE.Color('#88ccff'), [])
  const moteDayColor = useMemo(() => new THREE.Color('#ffd700'), [])
  const moteNightColor = useMemo(() => new THREE.Color('#ff8800'), [])

  const targetDustColor = useMemo(() => new THREE.Color(), [])
  const targetMoteColor = useMemo(() => new THREE.Color(), [])

  useFrame(() => {
    const dayNightCycle = useStore.getState().dayNightCycle
    const dayness = Math.sin(dayNightCycle * Math.PI)
    const opacity = 0.2 + dayness * 0.3

    if (dayness > 0.5) {
        const t = (dayness - 0.5) * 2.0;
        targetDustColor.copy(sunsetColor).lerp(sunColor, t);
        targetMoteColor.copy(sunsetColor).lerp(moteDayColor, t);
    } else {
        const t = dayness * 2.0;
        targetDustColor.copy(nightColor).lerp(sunsetColor, t);
        targetMoteColor.copy(nightColor).lerp(moteNightColor, t);
    }

    if (dustRef.current) {
      if (dustRef.current.material) {
        dustRef.current.material.color.copy(targetDustColor)
        dustRef.current.material.opacity = opacity
      }
    }
    if (moteRef.current) {
      if (moteRef.current.material) {
        moteRef.current.material.color.copy(targetMoteColor)
        moteRef.current.material.opacity = opacity * 0.8
      }
    }
  })

  return (
    <group>
      {/* Ambient Dust - Drifting */}
      <Sparkles
        ref={dustRef}
        count={300}
        scale={[40, 20, 40]} // Spread out
        size={4}
        speed={0.4}
        position={[0, 5, 0]}
        noise={[1, 0.5, 1]} // multidirectional noise
      />

      {/* Highlights/Pollen Motes - More active */}
      <Sparkles
        ref={moteRef}
        count={150}
        scale={[30, 15, 30]}
        size={6}
        speed={0.6}
        position={[0, 5, 0]}
        noise={[2, 1, 2]} // More chaotic
      />
    </group>
  )
}
