import React, { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import { deserts } from '../data/deserts'
import { getTerrainHeight } from '../utils/terrainUtils'
import * as THREE from 'three'

export const Terrain = () => {
  const meshRef = useRef()
  const currentDesertIndex = useStore((state) => state.currentDesertIndex)
  const desert = deserts[currentDesertIndex]

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(100, 100, 96, 96) // Optimized resolution for performance
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [])

  // Ref to store current heights for animation
  const targetHeights = useRef(new Float32Array(geometry.attributes.position.count))
  const isAnimating = useRef(true)
  const tempColor = useMemo(() => new THREE.Color(), [])

  // Ref for frame counting to throttle expensive operations
  const frameCount = useRef(0)

  // Generate target heights and color when desert changes
  useEffect(() => {
    isAnimating.current = true
    tempColor.set(desert.colors.ground) // Set target color once per change
    const positions = geometry.attributes.position.array
    const count = geometry.attributes.position.count

    for (let i = 0; i < count; i++) {
      const x = positions[i * 3]
      const z = positions[i * 3 + 2]

      const y = getTerrainHeight(x, z, desert.terrainParams)

      targetHeights.current[i] = y
    }
  }, [desert, geometry, tempColor])

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const material = meshRef.current.material;
    const targetRoughness = desert.terrainParams.roughness;
    const colorSettled = material.color.equals(tempColor);
    const roughnessSettled = Math.abs(material.roughness - targetRoughness) < 0.01;

    // Optimization: Stop entirely if all animations are done
    if (!isAnimating.current && colorSettled && roughnessSettled) return;

    frameCount.current += 1;

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
        // Throttle normal computation to every 3rd frame to save performance
        if (frameCount.current % 3 === 0) {
            meshRef.current.geometry.computeVertexNormals();
        }
      } else {
        isAnimating.current = false;
        // Ensure normals are perfect at the end
        meshRef.current.geometry.computeVertexNormals();
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
  });

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
