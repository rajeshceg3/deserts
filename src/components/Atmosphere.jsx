import React, { useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import { deserts } from '../data/deserts'
import * as THREE from 'three'

export const Atmosphere = () => {
  const { scene } = useThree()
  const currentDesertIndex = useStore((state) => state.currentDesertIndex)
  const dayNightCycle = useStore((state) => state.dayNightCycle) // 0..1
  const desert = deserts[currentDesertIndex]

  useFrame((state, delta) => {
    // Determine target sky color based on Day/Night
    // Day (0.5) -> Desert Sky Color
    // Night (0.0 or 1.0) -> Dark Blue/Black

    // Calculate "dayness": 1 at noon (0.5), 0 at midnight (0 or 1)
    const dayness = Math.sin(dayNightCycle * Math.PI)

    // Sky Color Interpolation
    const targetSkyColor = new THREE.Color(desert.colors.sky).lerp(new THREE.Color('#050510'), 1 - dayness)

    // Fog Color Interpolation
    const targetFogColor = new THREE.Color(desert.colors.fog).lerp(new THREE.Color('#050510'), 1 - dayness)

    // Apply to scene
    // Background
    if (!scene.background) scene.background = new THREE.Color()
    if (scene.background.isColor) {
      scene.background.lerp(targetSkyColor, delta * 2)
    }

    // Fog
    if (!scene.fog) {
      scene.fog = new THREE.Fog(targetFogColor, 10, 80)
    } else {
      scene.fog.color.lerp(targetFogColor, delta * 2)
      // Adjust fog density/near/far based on dayness if wanted
      scene.fog.near = THREE.MathUtils.lerp(10, 20, dayness)
      scene.fog.far = THREE.MathUtils.lerp(80, 100, dayness)
    }
  })

  return null
}
