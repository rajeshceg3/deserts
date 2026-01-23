import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import { deserts } from '../data/deserts'
import * as THREE from 'three'

export const Atmosphere = () => {
  const currentDesertIndex = useStore((state) => state.currentDesertIndex)
  const dayNightCycle = useStore((state) => state.dayNightCycle) // 0..1
  const desert = deserts[currentDesertIndex]

  const colorRef = useRef()
  const fogRef = useRef()

  useFrame((state, delta) => {
    // Determine target sky color based on Day/Night
    const dayness = Math.sin(dayNightCycle * Math.PI)

    // Sky Color Interpolation
    const targetSkyColor = new THREE.Color(desert.colors.sky).lerp(new THREE.Color('#050510'), 1 - dayness)

    // Fog Color Interpolation
    const targetFogColor = new THREE.Color(desert.colors.fog).lerp(new THREE.Color('#050510'), 1 - dayness)

    // Apply to scene elements
    if (colorRef.current) {
        colorRef.current.lerp(targetSkyColor, delta * 2)
    }

    if (fogRef.current) {
        fogRef.current.color.lerp(targetFogColor, delta * 2)
        fogRef.current.near = THREE.MathUtils.lerp(10, 20, dayness)
        fogRef.current.far = THREE.MathUtils.lerp(80, 100, dayness)
    }
  })

  return (
    <>
        <color ref={colorRef} attach="background" args={[desert.colors.sky]} />
        <fog ref={fogRef} attach="fog" args={[desert.colors.fog, 10, 80]} />
    </>
  )
}
