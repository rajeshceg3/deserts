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
    const geo = new THREE.PlaneGeometry(100, 100, 128, 128)
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [])

  // Ref to store current heights for animation
  const currentHeights = useRef(new Float32Array(geometry.attributes.position.count))
  const targetHeights = useRef(new Float32Array(geometry.attributes.position.count))

  // Generate target heights when desert changes
  useEffect(() => {
    const { roughness, height, scale } = desert.terrainParams
    const positions = geometry.attributes.position.array
    const count = geometry.attributes.position.count

    for (let i = 0; i < count; i++) {
      const x = positions[i * 3]
      const z = positions[i * 3 + 2]
      // Simple noise generation
      const y = noise2D(x / (10 * scale), z / (10 * scale)) * height * roughness +
                noise2D(x / (2 * scale), z / (2 * scale)) * (height / 4) * roughness

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

      if (Math.abs(current - target) > 0.01) {
        positions[i * 3 + 1] = THREE.MathUtils.lerp(current, target, delta * 2)
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
  })

  return (
    <mesh ref={meshRef} geometry={geometry} receiveShadow>
      <meshStandardMaterial
        color={desert.colors.ground}
        roughness={1}
        flatShading
      />
    </mesh>
  )
}
