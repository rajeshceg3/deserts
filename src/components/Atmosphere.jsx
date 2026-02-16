import React, { useRef, useMemo, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars, Cloud, Float } from '@react-three/drei'
import { useStore } from '../store'
import { deserts } from '../data/deserts'
import { getSkyColor } from '../utils/colorUtils'
import * as THREE from 'three'

const NightStars = () => {
    const pointsRef = useRef()
    const dayNightCycle = useStore((state) => state.dayNightCycle)

    // Generate random stars
    const [positions, sizes] = useMemo(() => {
        const count = 5000
        const pos = new Float32Array(count * 3)
        const sz = new Float32Array(count)
        for(let i=0; i<count; i++) {
            const r = 100 + Math.random() * 50 // Distance
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            pos[i*3] = r * Math.sin(phi) * Math.cos(theta)
            pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta)
            pos[i*3+2] = r * Math.cos(phi)
            sz[i] = Math.random()
        }
        return [pos, sz]
    }, [])

    const shaderArgs = useMemo(() => ({
        uniforms: {
            uTime: { value: 0 },
            uOpacity: { value: 1.0 }
        },
        vertexShader: `
            attribute float size;
            varying float vSize;
            uniform float uTime;
            void main() {
                vSize = size;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                // Size attenuation
                gl_PointSize = size * (300.0 / -mvPosition.z);
            }
        `,
        fragmentShader: `
            varying float vSize;
            uniform float uTime;
            uniform float uOpacity;

            // Random hash
            float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

            void main() {
                // Circular star
                vec2 center = gl_PointCoord - 0.5;
                float dist = length(center);
                if (dist > 0.5) discard;

                // Soft edge
                float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

                // Twinkle
                float twinkle = sin(uTime * 2.0 + vSize * 20.0) * 0.5 + 0.5;
                alpha *= (0.5 + 0.5 * twinkle);

                gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * uOpacity);
                #include <colorspace_fragment>
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }), [])

    useFrame((state) => {
        if (pointsRef.current) {
            const dayness = Math.sin(dayNightCycle * Math.PI)
            const opacity = Math.max(0, 1 - Math.pow(dayness, 0.4) * 2)

            pointsRef.current.material.uniforms.uOpacity.value = opacity;
            pointsRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;

            // Slow rotation
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
        }
    })

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-size"
                    count={sizes.length}
                    array={sizes}
                    itemSize={1}
                />
            </bufferGeometry>
            <shaderMaterial args={[shaderArgs]} />
        </points>
    )
}

const Sun = () => {
    const meshRef = useRef()
    const materialRef = useRef()
    const dayNightCycle = useStore((state) => state.dayNightCycle)

    const shaderArgs = useMemo(() => ({
        uniforms: {
            uColor: { value: new THREE.Color('#FFF5E0') },
            uHalo: { value: new THREE.Color('#FF8C00') },
            uTime: { value: 0 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            uniform vec3 uColor;
            uniform vec3 uHalo;
            uniform float uTime;

            // Simplex noise function
            vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
            float snoise(vec2 v){
              const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
              vec2 i  = floor(v + dot(v, C.yy) );
              vec2 x0 = v -   i + dot(i, C.xx);
              vec2 i1;
              i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
              vec4 x12 = x0.xyxy + C.xxzz;
              x12.xy -= i1;
              i = mod(i, 289.0);
              vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
              + i.x + vec3(0.0, i1.x, 1.0 ));
              vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
              m = m*m ;
              m = m*m ;
              vec3 x = 2.0 * fract(p * C.www) - 1.0;
              vec3 h = abs(x) - 0.5;
              vec3 ox = floor(x + 0.5);
              vec3 a0 = x - ox;
              m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
              vec3 g;
              g.x  = a0.x  * x0.x  + h.x  * x0.y;
              g.yz = a0.yz * x12.xz + h.yz * x12.yw;
              return 130.0 * dot(m, g);
            }

            void main() {
                vec2 center = vec2(0.5);
                float dist = distance(vUv, center);

                // Organic Core
                float noise = snoise(vUv * 20.0 + uTime * 0.5);
                float coreRadius = 0.1 + noise * 0.005;
                float core = smoothstep(coreRadius + 0.01, coreRadius - 0.01, dist);

                // Corona / Glow with flowing noise
                float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
                float rayNoise = snoise(vec2(angle * 5.0, uTime * 0.2 + dist * 5.0));

                float glow = 1.0 / (dist * 12.0 + 0.1) - 0.1;
                glow = max(0.0, glow);

                // Add turbulent rays
                glow += rayNoise * (1.0 - smoothstep(0.0, 0.45, dist)) * 0.3;

                vec3 finalColor = uColor * core * 2.5; // HDR core
                finalColor += uHalo * glow * 1.5;

                // Soft fade out at edges of quad
                float alpha = smoothstep(0.5, 0.2, dist);

                gl_FragColor = vec4(finalColor, alpha);
                #include <colorspace_fragment>
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }), [])

    useFrame(() => {
        if (meshRef.current && materialRef.current) {
             const angle = (dayNightCycle - 0.25) * Math.PI * 2
             const radius = 80
             const x = Math.cos(angle) * radius
             const y = Math.sin(angle) * radius
             const z = Math.cos(angle) * 20
             meshRef.current.position.set(x, y, z)
             meshRef.current.lookAt(0, 0, 0)

             materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
        }
    })

    return (
        <mesh ref={meshRef} scale={[30, 30, 1]}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial ref={materialRef} args={[shaderArgs]} toneMapped={false} />
        </mesh>
    )
}

const SkyGradient = ({ horizonColor, sunPosition }) => {
    const meshRef = useRef()
    const shaderRef = useRef()

    // Zenith color is derived from horizon but darker/bluer
    const zenithColor = useMemo(() => new THREE.Color(), [])

    useFrame((state, delta) => {
        if (shaderRef.current) {
             shaderRef.current.uniforms.uHorizon.value.lerp(horizonColor, delta * 2)

             // Calculate zenith based on horizon: move towards deep blue/black
             const h = horizonColor.getHSL({ h: 0, s: 0, l: 0 })
             // Shift hue slightly blue-ward for zenith
             zenithColor.setHSL((h.h + 0.05) % 1.0, h.s * 0.8, Math.max(0.02, h.l * 0.3))

             shaderRef.current.uniforms.uZenith.value.lerp(zenithColor, delta * 2)

             // Update Sun position for scattering
             const dayNightCycle = useStore.getState().dayNightCycle
             const angle = (dayNightCycle - 0.25) * Math.PI * 2
             // Normalized sun direction
             shaderRef.current.uniforms.uSunDir.value.set(
                 Math.cos(angle),
                 Math.sin(angle),
                 Math.cos(angle) * 0.2 // Approximate Z
             ).normalize();
        }
    })

    const shaderArgs = useMemo(() => ({
        uniforms: {
            uHorizon: { value: new THREE.Color(horizonColor) },
            uZenith: { value: new THREE.Color(0,0,0) },
            uSunDir: { value: new THREE.Vector3(0, 1, 0) }
        },
        vertexShader: `
            varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * viewMatrix * worldPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vWorldPosition;
            uniform vec3 uHorizon;
            uniform vec3 uZenith;
            uniform vec3 uSunDir;

            // Random hash for dithering
            float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

            void main() {
                vec3 dir = normalize(vWorldPosition);

                // Non-linear gradient approximating atmosphere density
                float zenithFactor = sqrt(max(0.0, dir.y));

                // Add dithering to prevent banding
                float noise = hash(gl_FragCoord.xy) * 0.01;
                zenithFactor = clamp(zenithFactor + noise, 0.0, 1.0);

                vec3 sky = mix(uHorizon, uZenith, zenithFactor);

                // Add sun scattering glow (Mie scattering approximation)
                float sunDist = distance(dir, uSunDir);
                float sunGlow = exp(-sunDist * 3.5) * 0.6; // Soft glow

                // Combine
                vec3 finalColor = sky + uHorizon * sunGlow * 0.2;

                gl_FragColor = vec4(finalColor, 1.0);
                #include <colorspace_fragment>
            }
        `,
        side: THREE.BackSide,
        depthWrite: false
    }), [])

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[180, 32, 32]} />
            <shaderMaterial ref={shaderRef} args={[shaderArgs]} toneMapped={false} />
        </mesh>
    )
}

const VolumetricClouds = ({ color }) => {
    return (
      <group position={[0, 10, 0]}>
        <Cloud
            position={[-20, 5, -20]}
            speed={0.2}
            opacity={0.5}
            segments={20}
            bounds={[10, 2, 10]}
            color={color}
        />
        <Cloud
            position={[20, 8, -15]}
            speed={0.2}
            opacity={0.4}
            segments={20}
            bounds={[10, 2, 10]}
            color={color}
        />
        <Cloud
            position={[0, 15, -5]}
            speed={0.1}
            opacity={0.3}
            segments={20}
            bounds={[15, 2, 5]}
            color={color}
        />
      </group>
    )
}

export const Atmosphere = ({ isHeadless }) => {
  const currentDesertIndex = useStore((state) => state.currentDesertIndex)
  const dayNightCycle = useStore((state) => state.dayNightCycle)
  const desert = deserts[currentDesertIndex]

  const fogRef = useRef()

  // Calculate cloud color
  const cloudColor = useMemo(() => {
    if (!desert) return new THREE.Color('#fff')
    const dayness = Math.sin(dayNightCycle * Math.PI)
    const baseColor = new THREE.Color(desert.colors.sky)
    // Clouds catch sunset colors
    const sunsetColor = new THREE.Color('#FF9A8B')
    // At night, clouds are dark
    const nightColor = new THREE.Color('#1a1a2e')

    const c = baseColor.clone().lerp(sunsetColor, (1 - dayness) * 0.7)
    if (dayness < 0.2) {
        c.lerp(nightColor, 1 - dayness * 5)
    }
    // Boost brightness slightly
    c.multiplyScalar(1.2)

    return c
  }, [dayNightCycle, desert])

  const currentSkyColor = useMemo(() => new THREE.Color(desert?.colors.sky || '#000'), [desert])

  useFrame((state, delta) => {
    if (!desert) return

    const dayness = Math.sin(dayNightCycle * Math.PI)
    const targetSkyColor = getSkyColor(dayNightCycle, desert.colors)
    currentSkyColor.copy(targetSkyColor)

    if (fogRef.current) {
        // Fog Color
        const targetFogColor = targetSkyColor.clone()
        const hazeIntensity = Math.pow(dayness, 2) * 0.4
        targetFogColor.lerp(new THREE.Color('#FFFFFF'), hazeIntensity)

        fogRef.current.color.lerp(targetFogColor, delta * 1.5)

        // Fog Density (FogExp2)
        // High visibility = low density
        // Night (200 units) -> 0.008
        // Day (80 units) -> 0.02
        // Dawn (foggy) -> 0.035
        let targetDensity = 0.008
        if (dayness > 0.2) targetDensity = 0.012
        if (dayness < 0.2 && dayness > 0.0) targetDensity = 0.02 // Dawn haze

        // Smooth transition for density
        const currentDensity = fogRef.current.density
        fogRef.current.density = THREE.MathUtils.lerp(currentDensity, targetDensity, delta * 0.5)
    }
  })

  if (!desert) return null

  return (
    <>
        <SkyGradient horizonColor={currentSkyColor} />
        <fogExp2 ref={fogRef} attach="fog" args={[desert.colors.fog, 0.01]} />
        <NightStars />
        <Sun />
        {!isHeadless && (
            <Suspense fallback={null}>
                <VolumetricClouds color={cloudColor} />
            </Suspense>
        )}
    </>
  )
}
