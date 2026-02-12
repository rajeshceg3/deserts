import React, { useRef, useMemo, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars, Cloud, Float } from '@react-three/drei'
import { useStore } from '../store'
import { deserts } from '../data/deserts'
import { getSkyColor } from '../utils/colorUtils'
import * as THREE from 'three'

const NightStars = () => {
    const starsRef = useRef()
    const dayNightCycle = useStore((state) => state.dayNightCycle)

    useFrame(() => {
        if (starsRef.current?.material) {
            const dayness = Math.sin(dayNightCycle * Math.PI)
            const opacity = Math.max(0, 1 - Math.pow(dayness, 0.4) * 2)
            starsRef.current.material.transparent = true
            starsRef.current.material.opacity = opacity
            starsRef.current.rotation.y += 0.00005
        }
    })

    return (
        <Stars
            ref={starsRef}
            radius={150}
            depth={50}
            count={7000}
            factor={4}
            saturation={0.5}
            fade
            speed={1}
        />
    )
}

const Sun = () => {
    const meshRef = useRef()
    const dayNightCycle = useStore((state) => state.dayNightCycle)

    const shaderArgs = useMemo(() => ({
        uniforms: {
            uColor: { value: new THREE.Color('#FFF5E0') },
            uHalo: { value: new THREE.Color('#FF8C00') }
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

            void main() {
                vec2 center = vec2(0.5);
                float dist = distance(vUv, center);

                // Core sun disk (sharp edge but anti-aliased)
                float coreRadius = 0.1;
                float core = smoothstep(coreRadius + 0.01, coreRadius - 0.01, dist);

                // Corona / Glow
                // Physically based bloom approximation
                float glow = 1.0 / (dist * 15.0 + 0.1) - 0.1;
                glow = max(0.0, glow);

                // Add rays/glare using angular noise
                float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
                float rays = sin(angle * 20.0) * 0.1 + sin(angle * 45.0) * 0.05;
                glow += rays * (1.0 - smoothstep(0.0, 0.4, dist)) * 0.2;

                vec3 finalColor = uColor * core * 2.0; // HDR core
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
        if (meshRef.current) {
             const angle = (dayNightCycle - 0.25) * Math.PI * 2
             const radius = 80
             const x = Math.cos(angle) * radius
             const y = Math.sin(angle) * radius
             const z = Math.cos(angle) * 20
             meshRef.current.position.set(x, y, z)
             meshRef.current.lookAt(0, 0, 0)
        }
    })

    return (
        <mesh ref={meshRef} scale={[30, 30, 1]}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial args={[shaderArgs]} toneMapped={false} />
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

            void main() {
                vec3 dir = normalize(vWorldPosition);

                // Rayleigh scattering approximation
                float zenithFactor = pow(max(0.0, dir.y), 0.7); // Non-linear gradient

                // Horizon band
                float horizonFactor = 1.0 - zenithFactor;

                vec3 sky = mix(uHorizon, uZenith, zenithFactor);

                // Add sun scattering glow (Mie scattering approximation)
                float sunDist = distance(dir, uSunDir);
                float sunGlow = exp(-sunDist * 4.0) * 0.5; // Wide glow

                // Combine
                vec3 finalColor = sky + uHorizon * sunGlow * 0.3;

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
