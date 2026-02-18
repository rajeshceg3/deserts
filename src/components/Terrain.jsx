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

  const noiseMap = useMemo(() => {
      const size = 1024;
      const data = new Uint8Array(size * size * 4);
      for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
              const x = (i / size) * 20;
              const y = (j / size) * 20;
              let n = noise2D(x, y) * 0.5 + 0.5;
              let n2 = noise2D(x * 8, y * 8) * 0.5 + 0.5;
              let n3 = noise2D(x * 32, y * 32) * 0.5 + 0.5;
              data[(i * size + j) * 4] = Math.floor(n * 255);
              data[(i * size + j) * 4 + 1] = Math.floor(n2 * 255);
              data[(i * size + j) * 4 + 2] = Math.floor(n3 * 255);
              data[(i * size + j) * 4 + 3] = 255;
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

  useEffect(() => { return () => { noiseMap.dispose(); } }, [noiseMap])

  const onBeforeCompile = useMemo(() => (shader) => {
    shaderRef.current = shader
    shader.uniforms.uColorLow = { value: new THREE.Color(desert.colors.groundLow) }
    shader.uniforms.uColorHigh = { value: new THREE.Color(desert.colors.groundHigh) }
    shader.uniforms.uNoiseMap = { value: noiseMap }
    shader.uniforms.uTime = { value: 0 }

    // Inject varyings
    shader.vertexShader = `
      varying vec2 vTerrainUv;
      varying vec3 vPos;
      varying vec3 vCustomViewPos;
      varying float vDist; // Distance from center
    ` + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <uv_vertex>',
      `
      #include <uv_vertex>
      vTerrainUv = uv;
      vPos = position;
      vec4 myMvPosition = modelViewMatrix * vec4( position, 1.0 );
      vCustomViewPos = - myMvPosition.xyz;
      vDist = length(position.xz); // Distance from center (0,0) in local space
      `
    );

    shader.fragmentShader = `
      varying vec2 vTerrainUv;
      varying vec3 vPos;
      varying vec3 vCustomViewPos;
      varying float vDist;
      uniform vec3 uColorLow;
      uniform vec3 uColorHigh;
      uniform sampler2D uNoiseMap;
      uniform float uTime;

      // Better organic ripple with domain warping
      float ripple(vec2 uv, float time) {
          // Sample noise map for warping
          float warp = texture2D(uNoiseMap, uv * 0.5).r;

          vec2 distortedUV = uv + vec2(warp * 0.2, warp * 0.1);

          // Layer 1: Main dunes (wind direction A)
          float wave1 = sin(distortedUV.x * 15.0 + distortedUV.y * 5.0 - time * 0.1);

          // Layer 2: Cross patterns
          float wave2 = sin(distortedUV.y * 30.0 - distortedUV.x * 10.0 - time * 0.15);

          // Layer 3: Micro surface noise
          float wave3 = sin(distortedUV.x * 80.0 + distortedUV.y * 80.0);

          // Combine with non-linear mixing
          float w = wave1 * 0.6 + wave2 * 0.3 + wave3 * 0.1;

          // Sharpen crests (Sand dunes are sharp at top)
          w = pow(0.5 + 0.5 * w, 4.0);

          return w;
      }
    ` + shader.fragmentShader

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>
      vec2 noiseUV = vTerrainUv * 6.0;
      vec4 noiseSample = texture2D(uNoiseMap, noiseUV);
      float n = noiseSample.r;
      float n2 = noiseSample.g;
      float n3 = noiseSample.b;

      // Base color variation based on vertex color (height noise)
      float t = (vColor.r - 0.5) / 0.5;
      t = clamp(t, 0.0, 1.0);

      float r = ripple(vTerrainUv, uTime);

      // Ripple adds to height perception in color mix (crests are lighter/drier)
      float mixFactor = t + r * 0.15;

      // Add some "wetness" or mineral variation via noise
      mixFactor += (n2 - 0.5) * 0.1;

      vec3 mixedColor = mix(uColorLow, uColorHigh, smoothstep(0.2, 0.8, mixFactor));

      // Fine grain noise
      float grain = (n3 - 0.5) * 0.08;
      mixedColor += grain;

      // Distance fogging logic (Edge Fade)
      // Matches the skirt radius approx 45
      float edgeFade = smoothstep(40.0, 48.0, vDist);

      // Fade to ground low color to blend with background
      mixedColor = mix(mixedColor, uColorLow * 0.8, edgeFade);

      diffuseColor.rgb = mixedColor;
      `
    )

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <roughnessmap_fragment>',
      `
      #include <roughnessmap_fragment>
      float rNoise = texture2D(uNoiseMap, noiseUV * 4.0).b;

      vec3 viewDir = normalize(vCustomViewPos);

      // Sparkle Logic (Mica / Sand grains)
      // Based on view angle relative to micro-facets

      // Create a random facet normal using noise
      vec3 facetNormal = normalize(vec3(rNoise - 0.5, 1.0, n2 - 0.5));

      float spec = max(0.0, dot(viewDir, facetNormal));

      // Only sparkle at very specific angles (high power)
      float sparkle = pow(spec, 32.0);

      // Mask by noise threshold to make it sparse
      float sparkleMask = step(0.98, rNoise);

      // Combine
      float finalSparkle = sparkle * sparkleMask;

      // Add view-independent glint for aliasing-like shimmer
      float glint = step(0.99, sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233))) * 43758.5453);

      // Final roughness modification
      // Sand is generally rough (0.8-0.9), but sparkles are smooth (0.1)
      roughnessFactor = mix(0.9, 0.1, finalSparkle * 0.8 + glint * 0.02);
      `
    )

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <metalnessmap_fragment>',
      `
      #include <metalnessmap_fragment>
      // Metalness for sparkles to make them pop in HDR
      // Recalculate sparkle (need optimization in real production to share vars)
      float rNoiseM = texture2D(uNoiseMap, noiseUV * 4.0).b;
      float sparkleMaskM = step(0.98, rNoiseM);

      metalnessFactor = mix(0.0, 0.8, sparkleMaskM * 0.5);
      `
    )

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <normal_fragment_maps>',
      `
      #include <normal_fragment_maps>

      // Procedural Normal Bump from Ripples
      // Use analytical derivatives or dFdx

      float rVal = ripple(vTerrainUv, uTime);

      // Macro bump from noise
      float macro = texture2D(uNoiseMap, noiseUV).r;

      float totalHeight = rVal * 0.15 + macro * 0.3; // Dominant ripples

      // Fade normal perturbation at edges to avoid lighting artifacts on skirt
      totalHeight *= (1.0 - smoothstep(40.0, 48.0, vDist));

      // Calculate surface gradient
      vec3 bumpGrad = vec3(dFdx(totalHeight), dFdy(totalHeight), 0.0);

      // Apply to normal
      // Increase multiplier for deeper relief
      normal = normalize(normal - bumpGrad * 12.0);
      `
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noiseMap])

  const geometry = useMemo(() => {
    // Increased segments for smoother silhouette
    const segments = isHeadless ? 32 : 384
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
    geo.rotateX(-Math.PI / 2)
    return geo
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    if (shaderRef.current) {
        // Updated speed
        shaderRef.current.uniforms.uTime.value += delta * 0.15;
        shaderRef.current.uniforms.uColorLow.value.lerp(new THREE.Color(desert.colors.groundLow), delta * 2)
        shaderRef.current.uniforms.uColorHigh.value.lerp(new THREE.Color(desert.colors.groundHigh), delta * 2)
    }

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
