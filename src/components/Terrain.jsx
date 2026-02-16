import React, { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import { deserts } from '../data/deserts'
import { getTerrainHeight } from '../utils/terrainUtils'
import { noise2D } from '../utils/noise'
import * as THREE from 'three'

export const Terrain = ({ isHeadless }) => {
  const meshRef = useRef()
  const shaderRef = useRef()
  const currentDesertIndex = useStore((state) => state.currentDesertIndex)
  const desert = deserts[currentDesertIndex]

  // Generate Noise Texture for efficient shader lookups
  // Increased size for better detail
  const noiseMap = useMemo(() => {
      const size = 1024;
      const data = new Uint8Array(size * size * 4);

      for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
              // Normalize coords
              const x = (i / size) * 20; // scale
              const y = (j / size) * 20;

              // Base noise 0..1
              let n = noise2D(x, y) * 0.5 + 0.5;
              // Detail noise 0..1
              let n2 = noise2D(x * 8, y * 8) * 0.5 + 0.5;
              // Micro noise
              let n3 = noise2D(x * 32, y * 32) * 0.5 + 0.5;

              const val = Math.floor(n * 255);
              const val2 = Math.floor(n2 * 255);
              const val3 = Math.floor(n3 * 255);

              const stride = (i * size + j) * 4;
              data[stride] = val;      // R: Base Noise
              data[stride + 1] = val2; // G: Detail Noise
              data[stride + 2] = val3; // B: Micro Noise
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
    shader.uniforms.uTime = { value: 0 }

    shader.vertexShader = `
      varying vec2 vTerrainUv;
      varying vec3 vPos;
    ` + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <uv_vertex>',
      `
      #include <uv_vertex>
      vTerrainUv = uv;
      vPos = position;
      `
    );

    shader.fragmentShader = `
      varying vec2 vTerrainUv;
      varying vec3 vPos;
      uniform vec3 uColorLow;
      uniform vec3 uColorHigh;
      uniform sampler2D uNoiseMap;
      uniform float uTime;

      // Gradient Noise 2D
      vec2 hash(vec2 x) {
          const vec2 k = vec2(0.3183099, 0.3678794);
          x = x * k + k.yx;
          return -1.0 + 2.0 * fract(16.0 * k * fract(x.x * x.y * (x.x + x.y)));
      }

      float gnoise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                         dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
                     mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                         dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
      }

      // Organic Ripple Function
      float ripple(vec2 uv, float time) {
          // Sample noise texture for domain distortion
          float n = texture2D(uNoiseMap, uv * 1.5).r;

          // Domain warping: distort the coordinate space
          vec2 distortedUV = uv + vec2(n * 0.1, n * 0.15);

          // Primary wind direction wave
          float wave1 = sin(distortedUV.x * 40.0 + distortedUV.y * 20.0 - time * 0.4);

          // Secondary interference wave (simulating wind gusts/changes)
          float wave2 = sin(distortedUV.y * 30.0 - distortedUV.x * 10.0 - time * 0.5);

          // Sharpen the waves to look like sand dunes (peaks)
          float w = (wave1 + wave2 * 0.5);
          w = pow(0.5 + 0.5 * w, 2.0); // Sharpen peaks

          return w;
      }
    ` + shader.fragmentShader

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>

      // Sample noise texture
      vec2 noiseUV = vTerrainUv * 6.0; // Tiling
      vec4 noiseSample = texture2D(uNoiseMap, noiseUV);
      float n = noiseSample.r;
      float n2 = noiseSample.g;
      float n3 = noiseSample.b;

      // Vertex Color Noise (Macro)
      float t = (vColor.r - 0.5) / 0.5;
      t = clamp(t, 0.0, 1.0);

      // Ripple Effect (Simulating wind blown sand)
      float r = ripple(vTerrainUv, uTime);
      float rippleFactor = r * 0.05 * n2; // Modulate ripple intensity by noise

      // Mix colors
      vec3 mixedColor = mix(uColorLow, uColorHigh, t + rippleFactor);

      // Add high frequency grain (Sand texture)
      float grain = (n3 - 0.5) * 0.1;
      mixedColor += grain;

      // Add variation based on macro noise
      mixedColor += (n - 0.5) * 0.05;

      diffuseColor.rgb = mixedColor;
      `
    )

    // Roughness
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <roughnessmap_fragment>',
      `
      #include <roughnessmap_fragment>
      // Sand is generally matte (high roughness), but glints (low roughness) on grain edges
      // Use micro noise for this
      float rNoise = texture2D(uNoiseMap, noiseUV * 2.0).b;

      // Base roughness from uniform/material
      float baseRough = roughnessFactor;

      // Add variation: some grains are shiny
      // Use smoothstep to avoid aliasing artifacts
      float sparkle = smoothstep(0.94, 0.98, rNoise);

      roughnessFactor = mix(baseRough, 0.2, sparkle * 0.5);

      // Also modulate by macro noise
      roughnessFactor += (n - 0.5) * 0.2;
      roughnessFactor = clamp(roughnessFactor, 0.1, 1.0);
      `
    )

    // Normal Perturbation
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <normal_fragment_maps>',
      `
      #include <normal_fragment_maps>

      // Create a detailed bump map
      // 1. Ripples
      float bumpRipple = ripple(vTerrainUv, uTime) * 0.02;

      // 2. Grain
      float bumpGrain = n3 * 0.01;

      // 3. Macro lumps
      float bumpMacro = n * 0.1;

      float totalBump = bumpRipple + bumpGrain + bumpMacro;

      // Calculate derivatives for normal map
      vec3 bumpGrad = vec3(dFdx(totalBump), dFdy(totalBump), 0.0);

      // Perturb normal
      normal = normalize(normal - bumpGrad * 5.0); // Intensity of bump
      `
    )
  }, [noiseMap])

  const geometry = useMemo(() => {
    const segments = isHeadless ? 32 : 256
    const geo = new THREE.PlaneGeometry(100, 100, segments, segments)
    const count = geo.attributes.position.count
    const colors = new Float32Array(count * 3)

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

    // Update uTime
    if (shaderRef.current) {
        shaderRef.current.uniforms.uTime.value += delta * 0.2; // Slow wind speed

        shaderRef.current.uniforms.uColorLow.value.lerp(new THREE.Color(desert.colors.groundLow), delta * 2)
        shaderRef.current.uniforms.uColorHigh.value.lerp(new THREE.Color(desert.colors.groundHigh), delta * 2)
    }

    // Check animations...
    if (shaderRef.current) {
        // Just updating uniforms every frame is cheap enough
    }

    // Note: We don't stop animating if uTime is updating, but we only calculate vertices if needed

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
        frameCount.current += 1;
        // Optimization: Throttle normal updates but keep it frequent enough to avoid visual popping
        // Or better, only update if the change was significant
        if (frameCount.current % 3 === 0) {
             meshRef.current.geometry.computeVertexNormals();
        }
      } else {
        isAnimating.current = false;
        meshRef.current.geometry.computeVertexNormals();
      }
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
