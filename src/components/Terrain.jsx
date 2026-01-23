import React, { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { createNoise2D } from 'simplex-noise'
import { useStore } from '../store'
import { deserts } from '../data/deserts'
import * as THREE from 'three'

const noise2D = createNoise2D()

export const Terrain = () => {
  const meshRef = useRef()
  const currentDesertIndex = useStore((state) => state.currentDesertIndex)
  const desert = deserts[currentDesertIndex]

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(100, 100, 150, 150) // Increased resolution slightly
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [])

  // Ref to store current heights for animation
  const targetHeights = useRef(new Float32Array(geometry.attributes.position.count))

  // Generate target heights when desert changes
  useEffect(() => {
    const { height, scale } = desert.terrainParams
    const positions = geometry.attributes.position.array
    const count = geometry.attributes.position.count

    for (let i = 0; i < count; i++) {
      const x = positions[i * 3]
      const z = positions[i * 3 + 2]
      // Simple noise generation
      const y = noise2D(x / (10 * scale), z / (10 * scale)) * height * 1.5 + // Multiplier for better height
                noise2D(x / (3 * scale), z / (3 * scale)) * (height / 2)

      targetHeights.current[i] = y
    }
  }, [desert, geometry])

  useFrame((state, delta) => {
    if (!meshRef.current) return

    // Lerp positions
    const positions = meshRef.current.geometry.attributes.position.array
    const count = meshRef.current.geometry.attributes.position.count
    let needsUpdate = false

    for (let i = 0; i < count; i++) {
      const current = positions[i * 3 + 1]
      const target = targetHeights.current[i]

      // Smooth lerp
      if (Math.abs(current - target) > 0.001) {
        positions[i * 3 + 1] = THREE.MathUtils.lerp(current, target, delta * 3)
        needsUpdate = true
      } else {
        positions[i * 3 + 1] = target
      }
    }

    if (needsUpdate) {
      meshRef.current.geometry.attributes.position.needsUpdate = true
      meshRef.current.geometry.computeVertexNormals()
    }

    // Lerp Color
    const material = meshRef.current.material
    material.color.lerp(new THREE.Color(desert.colors.ground), delta * 2)

    // Lerp Roughness
    material.roughness = THREE.MathUtils.lerp(material.roughness, desert.terrainParams.roughness, delta)
  })

  return (
    <mesh ref={meshRef} geometry={geometry} receiveShadow castShadow>
      <meshPhysicalMaterial
        color={desert.colors.ground}
        roughness={desert.terrainParams.roughness}
        metalness={0.05}
        flatShading={false}
      />
    </mesh>
  )
}
