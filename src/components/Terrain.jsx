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

      float ripple(vec2 uv, float time) {
          float n = texture2D(uNoiseMap, uv * 1.5).r;
          vec2 distortedUV = uv + vec2(n * 0.1, n * 0.15);

          // Layer 1: Large Dunes (Wind direction A)
          float wave1 = sin(distortedUV.x * 20.0 + distortedUV.y * 10.0 - time * 0.15);

          // Layer 2: Medium Ripples (Wind direction B - Cross wind)
          float wave2 = sin(distortedUV.y * 50.0 - distortedUV.x * 15.0 - time * 0.25);

          // Layer 3: Fine Micro-ripples (Turbulence)
          float wave3 = sin(distortedUV.x * 120.0 + distortedUV.y * 90.0 - time * 0.4);

          // Mix layers with dominance on wave1/wave2
          float w = (wave1 * 0.5 + wave2 * 0.35 + wave3 * 0.15);

          // Non-linear sharpen for dune crests
          w = pow(0.5 + 0.5 * w, 2.5); // Sharper crests
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

      float t = (vColor.r - 0.5) / 0.5;
      t = clamp(t, 0.0, 1.0);

      float r = ripple(vTerrainUv, uTime);
      float rippleFactor = r * 0.12 * n2; // Increased ripple influence

      vec3 mixedColor = mix(uColorLow, uColorHigh, t + rippleFactor);
      float grain = (n3 - 0.5) * 0.15; // Grain contrast
      mixedColor += grain;
      mixedColor += (n - 0.5) * 0.05;

      // Edge Fade: Darken/Fog out edges beyond radius 45 (matches skirt)
      float edgeFade = smoothstep(40.0, 48.0, vDist);
      // Mix towards a neutral "shadow" or fog color to hide the geo drop
      // Better: mix to the low ground color to reduce contrast at edges
      mixedColor = mix(mixedColor, uColorLow * 0.5, edgeFade * 0.8);

      diffuseColor.rgb = mixedColor;
      `
    )

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <roughnessmap_fragment>',
      `
      #include <roughnessmap_fragment>
      float rNoise = texture2D(uNoiseMap, noiseUV * 3.0).b;

      // View dependent sparkle (Mica)
      vec3 viewDir = normalize(vCustomViewPos);

      // Improve sparkle logic:
      // Sparkle vector based on noise map normal
      vec3 sparkleVec = normalize(vec3(n - 0.5, 1.0, n2 - 0.5));
      float viewSparkle = max(0.0, dot(viewDir, sparkleVec));

      // High frequency glint
      float glint = sin(dot(gl_FragCoord.xy, vec2(0.1, 0.2)) + uTime * 2.0); // Screen space glint for sub-pixel aliasing look?
      // Actually better to use viewDir for stability
      float glintStable = sin(dot(viewDir.xy, vec2(200.0)) + rNoise * 50.0);

      float sparkle = smoothstep(0.97, 1.0, rNoise + glintStable * 0.02 + viewSparkle * 0.05);

      roughnessFactor = mix(roughnessFactor, 0.05, sparkle * 0.9); // Ultra shiny sparkles
      roughnessFactor += (n - 0.5) * 0.3; // Roughness variation
      roughnessFactor = clamp(roughnessFactor, 0.1, 1.0);
      `
    )

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <metalnessmap_fragment>',
      `
      #include <metalnessmap_fragment>
      // Re-calculate sparkle for metalness
      // Need rNoise, noiseUV, vCustomViewPos
      vec2 noiseUVM = vTerrainUv * 6.0;
      float rNoiseM = texture2D(uNoiseMap, noiseUVM * 3.0).b;
      vec3 viewDirM = normalize(vCustomViewPos);
      float glintM = sin(dot(viewDirM.xy, vec2(200.0)) + rNoiseM * 50.0);
      float sparkleM = smoothstep(0.97, 1.0, rNoiseM + glintM * 0.02);

      metalnessFactor = mix(metalnessFactor, 0.6, sparkleM);
      `
    )

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <normal_fragment_maps>',
      `
      #include <normal_fragment_maps>
      // Calculate complex ripple bump
      // To get proper derivatives for a function f(u,v,t), we need dFdx(f) and dFdy(f)
      // Since ripple() is procedural, we can use dFdx/dFdy on the result directly.

      float rVal = ripple(vTerrainUv, uTime);

      float bumpRipple = rVal * 0.06; // Deeper ripples
      float bumpGrain = n3 * 0.03;
      float bumpMacro = n * 0.2;

      float totalBump = bumpRipple + bumpGrain + bumpMacro;

      // Flatten bump at edges to avoid weird lighting on the skirt
      totalBump *= (1.0 - smoothstep(40.0, 48.0, vDist));

      vec3 bumpGrad = vec3(dFdx(totalBump), dFdy(totalBump), 0.0);

      // Apply
      normal = normalize(normal - bumpGrad * 8.0); // Stronger normal effect
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
