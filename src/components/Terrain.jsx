import React, { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import { deserts } from '../data/deserts'
import { getTerrainHeight } from '../utils/terrainUtils'
import { createNoise2D } from 'simplex-noise'
import * as THREE from 'three'

export const Terrain = () => {
  const meshRef = useRef()
  const shaderRef = useRef()
  const currentDesertIndex = useStore((state) => state.currentDesertIndex)
  const desert = deserts[currentDesertIndex]

  // Generate Noise Texture for efficient shader lookups
  const noiseMap = useMemo(() => {
      const size = 512;
      const data = new Uint8Array(size * size * 4);
      const noise2D = createNoise2D();

      for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
              // Normalize coords
              const x = (i / size) * 10; // scale
              const y = (j / size) * 10;

              // Base noise 0..1
              let n = noise2D(x, y) * 0.5 + 0.5;
              // Detail noise 0..1
              let n2 = noise2D(x * 4, y * 4) * 0.5 + 0.5;

              const val = Math.floor(n * 255);
              const val2 = Math.floor(n2 * 255);

              const stride = (i * size + j) * 4;
              data[stride] = val;      // R: Base Noise
              data[stride + 1] = val2; // G: Detail Noise
              data[stride + 2] = 0;
              data[stride + 3] = 255;
          }
      }

      const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.needsUpdate = true;
      return texture;
  }, [])

  useEffect(() => {
      return () => {
          noiseMap.dispose();
      }
  }, [noiseMap])

  const onBeforeCompile = useMemo(() => (shader) => {
    shaderRef.current = shader
    shader.uniforms.uColorLow = { value: new THREE.Color(desert.colors.groundLow) }
    shader.uniforms.uColorHigh = { value: new THREE.Color(desert.colors.groundHigh) }
    shader.uniforms.uNoiseMap = { value: noiseMap }

    shader.vertexShader = `
      varying vec2 vTerrainUv;
    ` + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <uv_vertex>',
      `
      #include <uv_vertex>
      vTerrainUv = uv;
      `
    );

    shader.fragmentShader = `
      varying vec2 vTerrainUv;
      uniform vec3 uColorLow;
      uniform vec3 uColorHigh;
      uniform sampler2D uNoiseMap;
    ` + shader.fragmentShader

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>

      // Sample noise texture
      vec2 noiseUV = vTerrainUv * 4.0; // Tiling
      vec4 noiseSample = texture2D(uNoiseMap, noiseUV);
      float n = noiseSample.r;
      float n2 = noiseSample.g;

      // Vertex Color Noise
      float t = (vColor.r - 0.6) / 0.6;
      t = clamp(t, 0.0, 1.0);

      // Add texture noise
      t += (n - 0.5) * 0.1;
      t = clamp(t, 0.0, 1.0);

      vec3 mixedColor = mix(uColorLow, uColorHigh, t);

      // Add grain
      mixedColor += (n2 - 0.5) * 0.08;

      diffuseColor.rgb = mixedColor;
      `
    )

    // Roughness
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <roughnessmap_fragment>',
      `
      #include <roughnessmap_fragment>
      float rNoise = texture2D(uNoiseMap, noiseUV * 0.5).r;
      roughnessFactor += (rNoise - 0.5) * 0.3;
      roughnessFactor = clamp(roughnessFactor, 0.1, 0.9);
      `
    )

    // Normal Perturbation
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <normal_fragment_maps>',
      `
      #include <normal_fragment_maps>

      // Bump map from noise
      float bump = n * 0.05 + n2 * 0.01;

      // Derivatives
      vec3 bumpGrad = vec3(dFdx(bump), dFdy(bump), 0.0);

      // Normal perturbation scaled down significantly
      normal = normalize(normal - bumpGrad * 2.0);
      `
    )
  }, [noiseMap])

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(100, 100, 128, 128)
    const count = geo.attributes.position.count
    const colors = new Float32Array(count * 3)
    const noise2D = createNoise2D();

    for (let i = 0; i < count; i++) {
        const x = geo.attributes.position.getX(i);
        const y = geo.attributes.position.getY(i);

        const grain = noise2D(x * 0.3, y * 0.3);
        const patch = noise2D(x * 0.05, y * 0.05);
        const fineGrain = noise2D(x * 2.5, y * 2.5);

        let noiseVal = 0.9 + (grain * 0.1) + (patch * 0.1) + (fineGrain * 0.05);
        noiseVal = Math.max(0.6, Math.min(1.2, noiseVal));

        colors[i * 3] = noiseVal
        colors[i * 3 + 1] = noiseVal
        colors[i * 3 + 2] = noiseVal
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.rotateX(-Math.PI / 2) // Rotate geometry once
    return geo
  }, [])

  const targetHeights = useRef(new Float32Array(geometry.attributes.position.count))
  const isAnimating = useRef(true)
  const frameCount = useRef(0)

  useEffect(() => {
    if (!desert) return
    isAnimating.current = true
    const positions = geometry.attributes.position.array
    const count = geometry.attributes.position.count
    for (let i = 0; i < count; i++) {
      const x = positions[i * 3]
      const z = positions[i * 3 + 2]
      const y = getTerrainHeight(x, z, desert.terrainParams)
      targetHeights.current[i] = y
    }
  }, [desert, geometry])

  useFrame((state, delta) => {
    if (!meshRef.current || !desert) return;

    const material = meshRef.current.material;
    const targetRoughness = desert.terrainParams.roughness;

    // Check uniforms
    let colorSettled = true;
    if (shaderRef.current) {
        const cLow = shaderRef.current.uniforms.uColorLow.value;
        const cHigh = shaderRef.current.uniforms.uColorHigh.value;
        const tLow = new THREE.Color(desert.colors.groundLow);
        const tHigh = new THREE.Color(desert.colors.groundHigh);
        if (Math.abs(cLow.r - tLow.r) + Math.abs(cLow.g - tLow.g) + Math.abs(cLow.b - tLow.b) > 0.01) colorSettled = false;
        if (Math.abs(cHigh.r - tHigh.r) + Math.abs(cHigh.g - tHigh.g) + Math.abs(cHigh.b - tHigh.b) > 0.01) colorSettled = false;
    }

    const roughnessSettled = Math.abs(material.roughness - targetRoughness) < 0.01;

    if (!isAnimating.current && colorSettled && roughnessSettled) return;

    frameCount.current += 1;

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
        if (frameCount.current % 3 === 0) {
            meshRef.current.geometry.computeVertexNormals();
        }
      } else {
        isAnimating.current = false;
        meshRef.current.geometry.computeVertexNormals();
      }
    }

    if (shaderRef.current) {
        shaderRef.current.uniforms.uColorLow.value.lerp(new THREE.Color(desert.colors.groundLow), delta * 2)
        shaderRef.current.uniforms.uColorHigh.value.lerp(new THREE.Color(desert.colors.groundHigh), delta * 2)
    }

    if (Math.abs(material.roughness - targetRoughness) > 0.01) {
      material.roughness = THREE.MathUtils.lerp(material.roughness, targetRoughness, delta);
    }
  });

  if (!desert) return null;

  return (
    <mesh ref={meshRef} geometry={geometry} receiveShadow castShadow>
      <meshPhysicalMaterial
        vertexColors={true}
        onBeforeCompile={onBeforeCompile}
        roughness={desert.terrainParams.roughness}
        metalness={0.05}
        flatShading={false}
      />
    </mesh>
  )
}
