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
            // Fade out stars during the day.
            const opacity = Math.max(0, 1 - Math.pow(dayness, 0.4) * 2)

            starsRef.current.material.transparent = true
            starsRef.current.material.opacity = opacity
            starsRef.current.rotation.y += 0.0001 // Slow rotation
        }
    })

    return (
        <Stars
            ref={starsRef}
            radius={120}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
        />
    )
}

const Sun = () => {
    const meshRef = useRef()
    const dayNightCycle = useStore((state) => state.dayNightCycle)

    // Shader for a glowing sun with corona
    const shaderArgs = useMemo(() => ({
        uniforms: {
            color: { value: new THREE.Color(10, 8, 1) }, // High intensity for bloom
            haloColor: { value: new THREE.Color('#FF8C00') }
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
            uniform vec3 color;
            uniform vec3 haloColor;

            void main() {
                // Center is 0.5, 0.5
                float dist = distance(vUv, vec2(0.5));

                // Core (White hot center) - radius 0.15
                float core = 1.0 - smoothstep(0.0, 0.15, dist);

                // Glow (Halo) - radius 0.5
                float glow = 1.0 - smoothstep(0.0, 0.5, dist);
                // Make glow falloff non-linear for nicer look
                glow = pow(glow, 2.0);

                // Mix colors
                vec3 finalColor = mix(haloColor, color, core * 0.8 + 0.2);

                // Alpha: fade out at edges
                float alpha = smoothstep(0.5, 0.2, dist);

                gl_FragColor = vec4(finalColor * 2.0, alpha); // Boost brightness for bloom

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
             const radius = 60
             const x = Math.cos(angle) * radius
             const y = Math.sin(angle) * radius
             const z = Math.cos(angle) * 15

             meshRef.current.position.set(x, y, z)
             meshRef.current.lookAt(0, 0, 0)
        }
    })

    return (
        <mesh ref={meshRef} scale={[12, 12, 12]}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial args={[shaderArgs]} toneMapped={false} />
        </mesh>
    )
}

export const Atmosphere = () => {
  const currentDesertIndex = useStore((state) => state.currentDesertIndex)
  const dayNightCycle = useStore((state) => state.dayNightCycle) // 0..1
  const desert = deserts[currentDesertIndex]

  const colorRef = useRef()
  const fogRef = useRef()

  // Calculate cloud color based on time of day
  const cloudColor = useMemo(() => {
    if (!desert) return new THREE.Color()
    const dayness = Math.sin(dayNightCycle * Math.PI)
    const baseColor = new THREE.Color(desert.colors.sky)
    const sunsetColor = new THREE.Color('#FF9A8B') // Soft sunset pink/orange

    return baseColor.lerp(sunsetColor, (1 - dayness) * 0.5)
  }, [dayNightCycle, desert])

  useFrame((state, delta) => {
    if (!desert) return

    const dayness = Math.sin(dayNightCycle * Math.PI)

    // Improved Sky Color Logic using utility
    const targetSkyColor = getSkyColor(dayNightCycle, desert.colors)

    // Improved Fog Logic: Matches sky at night, adds haze during day
    // Reuse object or clone
    const targetFogColor = targetSkyColor.clone()

    // Add subtle haze based on sun height (dayness)
    // Use easing (quadratic) for smoother onset of haze
    const hazeIntensity = Math.pow(dayness, 2) * 0.3
    targetFogColor.lerp(new THREE.Color('#FFFFFF'), hazeIntensity)

    // Apply to scene elements with smooth transition
    if (colorRef.current) {
        // Slower transition for sky for weight
        colorRef.current.lerp(targetSkyColor, delta * 1.5)
    }

    if (fogRef.current) {
        fogRef.current.color.lerp(targetFogColor, delta * 1.5)

        // Visibility: Clearer at night (stars visible), hazier at day
        // Night: Near 20, Far 200
        // Day: Near 10, Far 100
        const visibility = Math.pow(dayness, 0.5) // Rapid drop in visibility at dawn

        const targetNear = THREE.MathUtils.lerp(20, 10, visibility)
        const targetFar = THREE.MathUtils.lerp(200, 100, visibility)

        fogRef.current.near = THREE.MathUtils.lerp(fogRef.current.near, targetNear, delta)
        fogRef.current.far = THREE.MathUtils.lerp(fogRef.current.far, targetFar, delta)
    }
  })

  if (!desert) return null

  return (
    <>
        <color ref={colorRef} attach="background" args={[desert.colors.sky]} />
        <fog ref={fogRef} attach="fog" args={[desert.colors.fog, 10, 80]} />
        <NightStars />
        <Sun />

        {/* Subtle clouds for depth */}
        <group position={[0, 15, -20]}>
            <Suspense fallback={null}>
                <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                    <Cloud
                      opacity={0.5}
                      speed={0.2}
                      width={30}
                      depth={5}
                      segments={20}
                      color={cloudColor}
                    />
                </Float>
            </Suspense>
        </group>
    </>
  )
}
