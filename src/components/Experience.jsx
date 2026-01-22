import React, { useRef } from 'react'
import { OrbitControls } from '@react-three/drei'
import { Terrain } from './Terrain'
import { Atmosphere } from './Atmosphere'
import { CreatureManager } from './CreatureManager'
import { useStore } from '../store'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export const Experience = () => {
  const dayNightCycle = useStore((state) => state.dayNightCycle)
  const isDay = useStore((state) => state.isDay)

  // Ref for lights to animate
  const ambientLightRef = useRef()
  const directionalLightRef = useRef()

  useFrame((state, delta) => {
    // Simple cycle logic
    const angle = dayNightCycle * Math.PI * 2
    const radius = 50
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius

    if (directionalLightRef.current) {
        directionalLightRef.current.position.set(x, y, 0)

        // Intensity changes
        const intensity = Math.max(0, Math.sin(angle))
        directionalLightRef.current.intensity = intensity * 2
    }
  })

  return (
    <>
      <OrbitControls
        makeDefault
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={5}
        maxDistance={50}
        enablePan={false}
      />

      <ambientLight ref={ambientLightRef} intensity={0.2} />
      <directionalLight
        ref={directionalLightRef}
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      <Terrain />
      <Atmosphere />
      <CreatureManager />
    </>
  )
}
