import React, { useRef, useMemo, useEffect, Suspense } from 'react'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, SMAA, DepthOfField, Noise, ToneMapping } from '@react-three/postprocessing'
import { HeatHaze } from './effects/HeatHaze'
import { Terrain } from './Terrain'
import { Atmosphere } from './Atmosphere'
import { CreatureManager } from './CreatureManager'
import { FloraManager } from './FloraManager'
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

  const directionalLightRef = useRef()
  const ambientLightRef = useRef()

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
    const angle = (dayNightCycle - 0.25) * Math.PI * 2
    const radius = 60
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    const z = Math.cos(angle) * 15

    const dayness = Math.sin(dayNightCycle * Math.PI)
    // More accurate sun elevation factor (0 at horizon, 1 at zenith)
    const sunElevation = Math.max(0, y / radius);

    if (deserts[currentDesertIndex]) {
        const skyColor = getSkyColor(dayNightCycle, deserts[currentDesertIndex].colors)
        // eslint-disable-next-line react-hooks/immutability
        scene.background = skyColor
    }

    if (directionalLightRef.current) {
        directionalLightRef.current.position.set(x, y, z)

        // Non-linear intensity:
        // Dawn/Dusk (low elevation): rapidly drops
        // Noon: Peak brightness
        // Night: Moonlight (low)
        let intensity = 0.1; // Base moonlight
        if (sunElevation > 0) {
            // Power curve for realistic lux falloff
            intensity += Math.pow(sunElevation, 0.5) * 2.5;
        }
        directionalLightRef.current.intensity = intensity

        // Color temperature shift based on elevation
        // Low elevation = warm/orange. High = white/blue-ish.
        const sunMix = Math.pow(sunElevation, 0.5);
        tempColor.copy(sunColorEnd).lerp(sunColorStart, sunMix)
        directionalLightRef.current.color.copy(tempColor)
    }

    if (ambientLightRef.current) {
        // Ambient light follows sun but simpler
        ambientLightRef.current.intensity = Math.max(0.1, 0.1 + sunElevation * 0.5)
    }
  })

  // Environment Intensity
  const dayness = Math.sin(dayNightCycle * Math.PI)
  // Non-linear curve for realistic twilight reflection falloff
  const envIntensity = 0.1 + Math.pow(Math.max(0, dayness), 3) * 0.5

  return (
    <>
      {!isHeadless && (
          <EffectComposer disableNormalPass multisampling={0}>
            <SMAA />
            <Bloom
                luminanceThreshold={1.1} // Only very bright things bloom (sun, specular)
                mipmapBlur
                intensity={0.4}
                radius={0.5}
            />
            <ToneMapping
                mode={THREE.ACESFilmicToneMapping} // Cinematic tone mapping
                exposure={1.0}
            />
            <DepthOfField
                focusDistance={0.05}
                focalLength={0.02}
                bokehScale={3}
            />
            <Noise opacity={0.02} />
            <Vignette eskil={false} offset={0.05} darkness={0.5} />
            <HeatHaze strength={0.4} speed={0.5} />
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
        <Environment preset="city" environmentIntensity={envIntensity} />
      </Suspense>

      <ambientLight ref={ambientLightRef} intensity={0.4} />
      <directionalLight
        ref={directionalLightRef}
        position={[10, 10, 5]}
        intensity={1.0}
        castShadow={!isHeadless}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
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
        <FloraManager />
      </Suspense>
      <Particles />

      {!isHeadless && (
        <ContactShadows resolution={1024} scale={50} blur={2} opacity={0.5} far={10} color="#000000" />
      )}
    </>
  )
}
