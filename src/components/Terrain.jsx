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
    // Increased resolution to 128 for smoother FBM terrain
    const geo = new THREE.PlaneGeometry(100, 100, 128, 128)
    geo.rotateX(-Math.PI / 2)

    // Add Vertex Colors for texture variation (Noise)
    const count = geo.attributes.position.count
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
        // Simple noise for texture variation (0.85 to 1.05 range)
        // We use a pseudo-random multiplier so it looks like grain/sand
        // eslint-disable-next-line
        const noise = 0.85 + Math.random() * 0.2

        colors[i * 3] = noise
        colors[i * 3 + 1] = noise
        colors[i * 3 + 2] = noise
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

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
    if (!desert) return

    isAnimating.current = true
    tempColor.set(desert.colors.ground) // Set target color once per change
    const positions = geometry.attributes.position.array
    const count = geometry.attributes.position.count

    for (let i = 0; i < count; i++) {
      const x = positions[i * 3]
      const z = positions[i * 3 + 2]

      // Uses the new FBM noise function
      const y = getTerrainHeight(x, z, desert.terrainParams)

      targetHeights.current[i] = y
    }
  }, [desert, geometry, tempColor])

  useFrame((state, delta) => {
    if (!meshRef.current || !desert) return;

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
        // Throttle normal computation
        if (frameCount.current % 3 === 0) {
            meshRef.current.geometry.computeVertexNormals();
        }
      } else {
        isAnimating.current = false;
        // Ensure normals are perfect at the end
        meshRef.current.geometry.computeVertexNormals();
      }
    }

    // Animate color (Material color acts as tint for vertex colors)
    if (!material.color.equals(tempColor)) {
      material.color.lerp(tempColor, delta * 2);
    }

    // Animate roughness
    if (Math.abs(material.roughness - targetRoughness) > 0.01) {
      material.roughness = THREE.MathUtils.lerp(material.roughness, targetRoughness, delta);
    }
  });

  if (!desert) return null;

  return (
    <mesh ref={meshRef} geometry={geometry} receiveShadow castShadow>
      <meshPhysicalMaterial
        vertexColors={true}
        color={desert.colors.ground}
        roughness={desert.terrainParams.roughness}
        metalness={0.05}
        flatShading={false}
      />
    </mesh>
  )
}
