import React, { useRef, useMemo, useEffect, Suspense } from 'react'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'
import { Terrain } from './Terrain'
import { Atmosphere } from './Atmosphere'
import { CreatureManager } from './CreatureManager'
import { Particles } from './Particles'
import { useStore } from '../store'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap } from 'gsap'

export const Experience = ({ onReady }) => {
  const dayNightCycle = useStore((state) => state.dayNightCycle)
  const currentDesertIndex = useStore((state) => state.currentDesertIndex)

  // Ref for lights to animate
  const directionalLightRef = useRef()
  const ambientLightRef = useRef()

  // Reusable objects to prevent memory leaks in loop
  const sunColorStart = useMemo(() => new THREE.Color('#FFF5E0'), [])
  const sunColorEnd = useMemo(() => new THREE.Color('#FF8C00'), [])
  const tempColor = useMemo(() => new THREE.Color(), [])

  const { camera } = useThree()

  useEffect(() => {
    const targetPosition = new THREE.Vector3(0, 5, 10)
    gsap.to(camera.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration: 2.5,
      ease: 'power3.inOut',
    })
    return () => {
      gsap.killTweensOf(camera.position)
    }
  }, [currentDesertIndex, camera])

  useEffect(() => {
    if (onReady) {
      // Small delay to ensure frames are ready
      const t = setTimeout(() => onReady(), 100)
      return () => clearTimeout(t)
    }
  }, [onReady])

  useFrame(() => {
    // Adjusted cycle logic: 0.5 is Noon (Top), 0/1 is Midnight (Bottom)
    const angle = (dayNightCycle - 0.25) * Math.PI * 2
    const radius = 60 // Matches Atmosphere.jsx Sun radius
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    // Add Z tilt for 3D depth
    const z = Math.cos(angle) * 15

    const dayness = Math.sin(dayNightCycle * Math.PI)

    if (directionalLightRef.current) {
        directionalLightRef.current.position.set(x, y, z)

        // Intensity changes: Peak at noon, 0 at midnight
        const intensity = Math.max(0, dayness)
        directionalLightRef.current.intensity = intensity * 1.5 // Increased slightly for punchiness

        // Color temperature shift
        const sunMix = Math.pow(dayness, 2)
        tempColor.copy(sunColorEnd).lerp(sunColorStart, sunMix)
        directionalLightRef.current.color.copy(tempColor)
    }

    if (ambientLightRef.current) {
        // Ambient light should be brighter during day, dimmer at night but not 0
        ambientLightRef.current.intensity = 0.1 + dayness * 0.4
    }
  })

  return (
    <>
      <EffectComposer disableNormalPass multisampling={0}>
        <Bloom luminanceThreshold={0.6} mipmapBlur intensity={0.5} radius={0.7} />
        <Noise opacity={0.035} />
        <Vignette eskil={false} offset={0.05} darkness={0.5} />
      </EffectComposer>

      <OrbitControls
        makeDefault
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={5}
        maxDistance={40}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.3}
        enableDamping
        dampingFactor={0.05}
      />

      <Suspense fallback={null}>
        <Environment preset="city" environmentIntensity={0.2} />
      </Suspense>

      <ambientLight ref={ambientLightRef} intensity={0.4} />
      <directionalLight
        ref={directionalLightRef}
        position={[10, 10, 5]}
        intensity={1.0}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005} // Tuned to prevent acne
        shadow-camera-near={0.1}
        shadow-camera-far={200}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />

      <Terrain />
      <Atmosphere />
      <Suspense fallback={null}>
        <CreatureManager />
      </Suspense>
      <Particles />

      {/* Soft floor shadow for grounding */}
      <ContactShadows resolution={1024} scale={50} blur={2} opacity={0.5} far={10} color="#000000" />
    </>
  )
}
