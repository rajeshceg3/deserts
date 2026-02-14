import React, { useRef, useMemo, useEffect, Suspense } from 'react'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, SMAA, DepthOfField, Noise } from '@react-three/postprocessing'
import { Terrain } from './Terrain'
import { Atmosphere } from './Atmosphere'
import { CreatureManager } from './CreatureManager'
import { Particles } from './Particles'
import { useStore } from '../store'
import { deserts } from '../data/deserts'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { getSkyColor } from '../utils/colorUtils'

export const Experience = ({ onReady }) => {
  const dayNightCycle = useStore((state) => state.dayNightCycle)
  const currentDesertIndex = useStore((state) => state.currentDesertIndex)
  const isCinematic = useStore((state) => state.isCinematic)

  // Detect headless mode for testing optimization
  const isHeadless = useMemo(() => {
      if (typeof window !== 'undefined') {
          return new URLSearchParams(window.location.search).get('headless') === 'true'
      }
      return false
  }, [])

  // Ref for lights to animate
  const directionalLightRef = useRef()
  const ambientLightRef = useRef()

  // Reusable objects to prevent memory leaks in loop
  const sunColorStart = useMemo(() => new THREE.Color('#FFF5E0'), [])
  const sunColorEnd = useMemo(() => new THREE.Color('#FF8C00'), [])
  const tempColor = useMemo(() => new THREE.Color(), [])

  const { camera, scene } = useThree()

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

  useEffect(() => {
    if (deserts[currentDesertIndex]) {
        document.title = `${deserts[currentDesertIndex].name} | Desert Realms`;
    }
  }, [currentDesertIndex]);

  useFrame(() => {
    // Adjusted cycle logic: 0.5 is Noon (Top), 0/1 is Midnight (Bottom)
    const angle = (dayNightCycle - 0.25) * Math.PI * 2
    const radius = 60 // Matches Atmosphere.jsx Sun radius
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    // Add Z tilt for 3D depth
    const z = Math.cos(angle) * 15

    const dayness = Math.sin(dayNightCycle * Math.PI)

    // Update Scene Background for Continuity
    // This ensures WebGL background matches sky even if geometry is missing
    if (deserts[currentDesertIndex]) {
        const skyColor = getSkyColor(dayNightCycle, deserts[currentDesertIndex].colors)
        scene.background = skyColor
    }

    if (directionalLightRef.current) {
        directionalLightRef.current.position.set(x, y, z)

        // Intensity changes: Peak at noon, min 0.1 at midnight (Moonlight)
        // Ensure it never goes fully black. 0.1 is safe, but let's be explicit with Math.max
        const intensity = Math.max(0.1, 0.1 + Math.max(0, dayness) * 1.4)
        directionalLightRef.current.intensity = intensity

        // Color temperature shift
        const sunMix = Math.pow(dayness, 2)
        tempColor.copy(sunColorEnd).lerp(sunColorStart, sunMix)
        directionalLightRef.current.color.copy(tempColor)
    }

    if (ambientLightRef.current) {
        // Ambient light should be brighter during day, dimmer at night but not 0
        // Clamp to min 0.15 to prevent total darkness
        ambientLightRef.current.intensity = Math.max(0.15, 0.2 + dayness * 0.4)
    }
  })

  // Calculate environment intensity
  const dayness = Math.sin(dayNightCycle * Math.PI)
  const envIntensity = 0.05 + Math.pow(dayness, 2) * 0.4 // Non-linear curve for realistic twilight

  return (
    <>
      {/* Disable PostProcessing in headless mode to save GPU */}
      {!isHeadless && (
          <EffectComposer disableNormalPass multisampling={0}>
            <SMAA />
            <Bloom luminanceThreshold={0.9} mipmapBlur intensity={0.6} radius={0.6} />
            <DepthOfField
                focusDistance={0.05} // Focus around 10 units away (0.05 * 200 = 10)
                focalLength={0.02} // 20mm wide angle
                bokehScale={3} // Moderate bokeh
            />
            <Noise opacity={0.02} /> {/* Subtle film grain */}
            <Vignette eskil={false} offset={0.05} darkness={0.5} />
          </EffectComposer>
      )}

      <OrbitControls
        makeDefault
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={5}
        maxDistance={40}
        enablePan={false}
        autoRotate
        autoRotateSpeed={isCinematic ? 0.8 : 0.3}
        enableDamping
        dampingFactor={0.05}
      />

      <Suspense fallback={null}>
        {/* Use city preset for neutral reflections, modulate intensity */}
        <Environment preset="city" environmentIntensity={envIntensity} />
      </Suspense>

      <ambientLight ref={ambientLightRef} intensity={0.4} />
      <directionalLight
        ref={directionalLightRef}
        position={[10, 10, 5]}
        intensity={1.0}
        castShadow={!isHeadless}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005} // Tuned to prevent acne
        shadow-camera-near={0.1}
        shadow-camera-far={200}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />

      <Terrain isHeadless={isHeadless} />
      <Atmosphere isHeadless={isHeadless} />
      <Suspense fallback={null}>
        <CreatureManager />
      </Suspense>
      <Particles />

      {/* Soft floor shadow for grounding */}
      {!isHeadless && (
        <ContactShadows resolution={1024} scale={50} blur={2} opacity={0.5} far={10} color="#000000" />
      )}
    </>
  )
}
