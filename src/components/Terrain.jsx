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
  const isAnimating = useRef(true)
  const tempColor = useMemo(() => new THREE.Color(), [])

  // Generate target heights when desert changes
  useEffect(() => {
    isAnimating.current = true
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
    if (!meshRef.current) return;

    const material = meshRef.current.material;
    tempColor.set(desert.colors.ground);
    const targetRoughness = desert.terrainParams.roughness;

    // Animate vertex positions
    if (isAnimating.current) {
      const positions = meshRef.current.geometry.attributes.position.array;
      const count = positions.length / 3;
      let stillMoving = false;

      for (let i = 0; i < count; i++) {
        const currentY = positions[i * 3 + 1];
        const targetY = targetHeights.current[i];

        if (Math.abs(currentY - targetY) > 0.001) {
          positions[i * 3 + 1] = THREE.MathUtils.lerp(currentY, targetY, delta * 3);
          stillMoving = true;
        } else {
          positions[i * 3 + 1] = targetY;
        }
      }

      if (stillMoving) {
        meshRef.current.geometry.attributes.position.needsUpdate = true;
        meshRef.current.geometry.computeVertexNormals(); // Expensive, but needed for lighting
      } else {
        isAnimating.current = false;
      }
    }

    // Animate color
    if (!material.color.equals(tempColor)) {
      material.color.lerp(tempColor, delta * 2);
    }

    // Animate roughness
    if (Math.abs(material.roughness - targetRoughness) > 0.01) {
      material.roughness = THREE.MathUtils.lerp(material.roughness, targetRoughness, delta);
    }
  }, [desert]);

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
