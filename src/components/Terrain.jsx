import React, { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import { deserts } from '../data/deserts'
import { getTerrainHeight } from '../utils/terrainUtils'
import { createNoise2D } from 'simplex-noise'
import * as THREE from 'three'

export const Terrain = () => {
  const meshRef = useRef()
  const currentDesertIndex = useStore((state) => state.currentDesertIndex)
  const desert = deserts[currentDesertIndex]

  const geometry = useMemo(() => {
    // Increased resolution to 128 for smoother FBM terrain
    const geo = new THREE.PlaneGeometry(100, 100, 128, 128)

    // Add Vertex Colors for texture variation (Noise)
    const count = geo.attributes.position.count
    const colors = new Float32Array(count * 3)

    // Create Simplex noise instance for static texture generation
    const noise2D = createNoise2D();

    for (let i = 0; i < count; i++) {
        const x = geo.attributes.position.getX(i);
        const y = geo.attributes.position.getY(i); // Use Y as noise coordinate before rotation

        // Lower frequency to avoid aliasing (Moiré patterns)
        // 128 segments / 100 units = 1.28 segs/unit.
        // Frequencies adjusted to match resolution:
        const grain = noise2D(x * 0.3, y * 0.3);
        // Low frequency noise for "patches" (variation in ground color)
        const patch = noise2D(x * 0.05, y * 0.05);

        // Combine noises
        // Base is ~0.9, grain adds texture, patch adds large scale variation
        let noiseVal = 0.9 + (grain * 0.1) + (patch * 0.1);

        // Clamp to avoid extreme bright/dark spots
        noiseVal = Math.max(0.6, Math.min(1.2, noiseVal));

        colors[i * 3] = noiseVal
        colors[i * 3 + 1] = noiseVal
        colors[i * 3 + 2] = noiseVal
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    // Rotate geometry to lie flat (XZ plane)
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
