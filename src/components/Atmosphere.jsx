import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars, Cloud } from '@react-three/drei'
import { useStore } from '../store'
import { deserts } from '../data/deserts'
import * as THREE from 'three'

const NightStars = () => {
    const starsRef = useRef()
    const dayNightCycle = useStore((state) => state.dayNightCycle)

    useFrame(() => {
        if (starsRef.current?.material) {
            const dayness = Math.sin(dayNightCycle * Math.PI)
            // Fade out stars during the day.
            const opacity = Math.max(0, 1 - Math.pow(dayness, 0.4) * 2)

            starsRef.current.material.transparent = true
            starsRef.current.material.opacity = opacity
            starsRef.current.rotation.y += 0.0001 // Slow rotation
        }
    })

    return (
        <Stars
            ref={starsRef}
            radius={120}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
        />
    )
}

export const Atmosphere = () => {
  const currentDesertIndex = useStore((state) => state.currentDesertIndex)
  const dayNightCycle = useStore((state) => state.dayNightCycle) // 0..1
  const desert = deserts[currentDesertIndex]

  const colorRef = useRef()
  const fogRef = useRef()

  // Calculate cloud color based on time of day
  const cloudColor = useMemo(() => {
    const dayness = Math.sin(dayNightCycle * Math.PI)
    const baseColor = new THREE.Color(desert.colors.sky)
    const sunsetColor = new THREE.Color('#FF9A8B') // Soft sunset pink/orange

    // Lerp towards sunset color when dayness is low (but not 0 which is night)
    // Use a bell curve or specific range for sunset?
    // Simplified: Mixing some sunset color as we approach night
    return baseColor.lerp(sunsetColor, (1 - dayness) * 0.5)
  }, [dayNightCycle, desert.colors.sky])

  useFrame((state, delta) => {
    // Determine target sky color based on Day/Night
    const dayness = Math.sin(dayNightCycle * Math.PI)

    // Sky Color Interpolation
    // Night color is deep blue/purple #050510
    const targetSkyColor = new THREE.Color(desert.colors.sky).lerp(new THREE.Color('#050510'), 1 - Math.pow(dayness, 0.5))

    // Fog Color Interpolation
    const targetFogColor = new THREE.Color(desert.colors.fog).lerp(new THREE.Color('#050510'), 1 - Math.pow(dayness, 0.5))

    // Apply to scene elements
    if (colorRef.current) {
        colorRef.current.lerp(targetSkyColor, delta * 2)
    }

    if (fogRef.current) {
        fogRef.current.color.lerp(targetFogColor, delta * 2)
        // More fog at night for mystery, less at day for clarity
        fogRef.current.near = THREE.MathUtils.lerp(5, 15, dayness)
        fogRef.current.far = THREE.MathUtils.lerp(60, 120, dayness)
    }
  })

  return (
    <>
        <color ref={colorRef} attach="background" args={[desert.colors.sky]} />
        <fog ref={fogRef} attach="fog" args={[desert.colors.fog, 10, 80]} />
        <NightStars />

        {/* Subtle clouds for depth */}
        <group position={[0, 15, -20]}>
            <Cloud
              opacity={0.3}
              speed={0.2}
              width={20}
              depth={5}
              segments={10}
              color={cloudColor}
            />
        </group>
    </>
  )
}
