import React, { useRef, useMemo, useEffect } from 'react'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Vignette, TiltShift2, ChromaticAberration } from '@react-three/postprocessing'
import { Terrain } from './Terrain'
import { Atmosphere } from './Atmosphere'
import { CreatureManager } from './CreatureManager'
import { Particles } from './Particles'
import { useStore } from '../store'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap } from 'gsap'

export const Experience = () => {
  const dayNightCycle = useStore((state) => state.dayNightCycle)
  const currentDesertIndex = useStore((state) => state.currentDesertIndex)

  // Ref for lights to animate
  const directionalLightRef = useRef()

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
  }, [currentDesertIndex, camera])

  useFrame(() => {
    // Simple cycle logic
    const angle = dayNightCycle * Math.PI * 2
    const radius = 50
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius

    if (directionalLightRef.current) {
        directionalLightRef.current.position.set(x, y, 0)

        // Intensity changes: Peak at noon, 0 at midnight
        // dayNightCycle: 0 (midnight) -> 0.25 (dawn) -> 0.5 (noon) -> 0.75 (dusk) -> 1 (midnight)
        const intensity = Math.max(0, Math.sin(dayNightCycle * Math.PI))
        directionalLightRef.current.intensity = intensity * 1.5 // Brighter sun

        // Color temperature shift?
        // Noon: White, Dawn/Dusk: Orange
        tempColor.copy(sunColorStart).lerp(sunColorEnd, 1 - Math.sin(dayNightCycle * Math.PI))
        directionalLightRef.current.color.copy(tempColor)
    }
  })

  return (
    <>
      <EffectComposer disableNormalPass>
        {/* Dreamier, slightly stronger bloom for that magical feel */}
        <Bloom luminanceThreshold={0.55} mipmapBlur intensity={0.8} radius={0.7} />
        {/* Film grain for texture - subtle */}
        <Noise opacity={0.035} />
        {/* Cinematic vignette */}
        <Vignette eskil={false} offset={0.05} darkness={0.5} />
        {/* TiltShift for miniature/dreamy focus - subtle vertical blur */}
        <TiltShift2 blur={0.1} />
        {/* Chromatic Aberration for that lens imperfection feel */}
        <ChromaticAberration offset={[0.002, 0.002]} />
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

      <Environment preset="sunset" />

      <ambientLight intensity={0.2} />
      <directionalLight
        ref={directionalLightRef}
        position={[10, 10, 5]}
        intensity={1.0}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      >
        <orthographicCamera attach="shadow-camera" args={[-50, 50, 50, -50]} />
      </directionalLight>

      <Terrain />
      <Atmosphere />
      <CreatureManager />
      <Particles />

      {/* Soft floor shadow for grounding */}
      <ContactShadows resolution={1024} scale={50} blur={2} opacity={0.5} far={10} color="#000000" />
    </>
  )
}
