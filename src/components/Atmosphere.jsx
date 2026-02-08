import React, { useRef, useMemo, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars, Cloud, Float } from '@react-three/drei'
import { useStore } from '../store'
import { deserts } from '../data/deserts'
import { getSkyColor } from '../utils/colorUtils'
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

const Sun = () => {
    const meshRef = useRef()
    const dayNightCycle = useStore((state) => state.dayNightCycle)

    const sunColor = useMemo(() => new THREE.Color(10, 8, 1), [])

    useFrame(() => {
        if (meshRef.current) {
             const angle = (dayNightCycle - 0.25) * Math.PI * 2
             const radius = 60 // Further out
             const x = Math.cos(angle) * radius
             const y = Math.sin(angle) * radius
             const z = Math.cos(angle) * 15 // Tilt matches Experience.jsx

             meshRef.current.position.set(x, y, z)
        }
    })

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[4, 32, 32]} />
            {/* High intensity color to trigger bloom */}
            <meshBasicMaterial color={sunColor} toneMapped={false} />
            {/* Halo */}
            <mesh scale={[1.5, 1.5, 1.5]}>
                 <sphereGeometry args={[4, 32, 32]} />
                 <meshBasicMaterial color="#FF8C00" transparent opacity={0.2} side={THREE.BackSide} toneMapped={false} />
            </mesh>
        </mesh>
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
    if (!desert) return new THREE.Color()
    const dayness = Math.sin(dayNightCycle * Math.PI)
    const baseColor = new THREE.Color(desert.colors.sky)
    const sunsetColor = new THREE.Color('#FF9A8B') // Soft sunset pink/orange

    return baseColor.lerp(sunsetColor, (1 - dayness) * 0.5)
  }, [dayNightCycle, desert])

  useFrame((state, delta) => {
    if (!desert) return

    const dayness = Math.sin(dayNightCycle * Math.PI)

    // Improved Sky Color Logic using utility
    const targetSkyColor = getSkyColor(dayNightCycle, desert.colors)

    // Fog Color Logic (matches sky mostly but lighter/foggy)
    const targetFogColor = targetSkyColor.clone().lerp(new THREE.Color('#ffffff'), 0.2)
    // Darken fog at night
    if (dayness < 0.2) {
        targetFogColor.lerp(new THREE.Color('#000000'), 1 - dayness*5)
    }

    // Apply to scene elements with smooth transition
    if (colorRef.current) {
        colorRef.current.lerp(targetSkyColor, delta * 2)
    }

    if (fogRef.current) {
        fogRef.current.color.lerp(targetFogColor, delta * 2)
        // More fog at night for mystery, less at day for clarity
        // Adjusted ranges for better visibility
        fogRef.current.near = THREE.MathUtils.lerp(0, 10, dayness)
        fogRef.current.far = THREE.MathUtils.lerp(40, 100, dayness)
    }
  })

  if (!desert) return null

  return (
    <>
        <color ref={colorRef} attach="background" args={[desert.colors.sky]} />
        <fog ref={fogRef} attach="fog" args={[desert.colors.fog, 10, 80]} />
        <NightStars />
        <Sun />

        {/* Subtle clouds for depth */}
        <group position={[0, 15, -20]}>
            <Suspense fallback={null}>
                <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                    <Cloud
                      opacity={0.5}
                      speed={0.2}
                      width={30}
                      depth={5}
                      segments={20}
                      color={cloudColor}
                    />
                </Float>
            </Suspense>
        </group>
    </>
  )
}
