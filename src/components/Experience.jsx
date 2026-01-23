import React, { useRef } from 'react'
import { OrbitControls, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'
import { Terrain } from './Terrain'
import { Atmosphere } from './Atmosphere'
import { CreatureManager } from './CreatureManager'
import { Particles } from './Particles'
import { useStore } from '../store'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export const Experience = () => {
  const dayNightCycle = useStore((state) => state.dayNightCycle)

  // Ref for lights to animate
  const ambientLightRef = useRef()
  const directionalLightRef = useRef()

  useFrame(() => {
    // Simple cycle logic
    const angle = dayNightCycle * Math.PI * 2
    const radius = 50
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius

    if (directionalLightRef.current) {
        directionalLightRef.current.position.set(x, y, 0)

        // Intensity changes
        const intensity = Math.max(0, Math.sin(angle))
        directionalLightRef.current.intensity = intensity * 1.0 // Reduced for subtle effect
    }
  })

  return (
    <>
      <EffectComposer disableNormalPass>
        {/* Softer, dreamier bloom */}
        <Bloom luminanceThreshold={0.8} mipmapBlur intensity={0.2} radius={0.4} />
        {/* Fainter noise for texture */}
        <Noise opacity={0.015} />
        {/* Softer vignette */}
        <Vignette eskil={false} offset={0.3} darkness={0.2} />
      </EffectComposer>

      <OrbitControls
        makeDefault
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={5}
        maxDistance={50}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
      />

      <Environment preset="sunset" />

      <ambientLight ref={ambientLightRef} intensity={0.4} />
      <directionalLight
        ref={directionalLightRef}
        position={[10, 10, 5]}
        intensity={1.0}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      <Terrain />
      <Atmosphere />
      <CreatureManager />
      <Particles />
    </>
  )
}
