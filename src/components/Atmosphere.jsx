import React, { useRef, useMemo, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars, Cloud } from '@react-three/drei'
import { useStore } from '../store'
import { deserts } from '../data/deserts'
import { getSkyColor } from '../utils/colorUtils'
import * as THREE from 'three'

const NightStars = () => {
    const pointsRef = useRef()
    const dayNightCycle = useStore((state) => state.dayNightCycle)

    const [positions, sizes, colors] = useMemo(() => {
        const count = 5000
        const pos = new Float32Array(count * 3)
        const sz = new Float32Array(count)
        const col = new Float32Array(count * 3)

        for(let i=0; i<count; i++) {
            const r = 100 + Math.random() * 50
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            pos[i*3] = r * Math.sin(phi) * Math.cos(theta)
            pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta)
            pos[i*3+2] = r * Math.cos(phi)
            sz[i] = Math.random() * 1.5 + 0.5 // Varied sizes

            // Star Colors (Temperature)
            // 0: Blue, 1: White, 2: Orange/Red
            const type = Math.random();
            const starColor = new THREE.Color();
            if (type > 0.9) starColor.setHex(0xffccaa); // Red Giant
            else if (type > 0.7) starColor.setHex(0xaaccff); // Blue
            else starColor.setHex(0xffffff); // White

            col[i*3] = starColor.r;
            col[i*3+1] = starColor.g;
            col[i*3+2] = starColor.b;
        }
        return [pos, sz, col]
    }, [])

    const shaderArgs = useMemo(() => ({
        uniforms: {
            uTime: { value: 0 },
            uOpacity: { value: 1.0 }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying float vSize;
            varying vec3 vColor;
            uniform float uTime;
            void main() {
                vSize = size;
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                // Size attenuation
                gl_PointSize = size * (300.0 / -mvPosition.z);
            }
        `,
        fragmentShader: `
            varying float vSize;
            varying vec3 vColor;
            uniform float uTime;
            uniform float uOpacity;

            void main() {
                vec2 center = gl_PointCoord - 0.5;
                float dist = length(center);
                if (dist > 0.5) discard;

                // Soft circle
                float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

                // Twinkle effect (based on position and time)
                // Use vSize as a random seed effectively
                float twinkle = sin(uTime * 3.0 + vSize * 20.0) * 0.5 + 0.5;

                // Twinkle affects alpha and brightness
                alpha *= (0.3 + 0.7 * twinkle);

                gl_FragColor = vec4(vColor, alpha * uOpacity);
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
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.005; // Slower rotation
        }
    })

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-size" count={sizes.length} array={sizes} itemSize={1} />
                <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
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

            vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
            float snoise(vec2 v){
              const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
              vec2 i  = floor(v + dot(v, C.yy) );
              vec2 x0 = v -   i + dot(i, C.xx);
              vec2 i1;
              i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
              vec4 x12 = x0.xyxy + C.xxzz;
              x12.xy -= i1;
              i = mod(i, 289.0);
              vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
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

                // Intense HDR Core
                float core = smoothstep(0.12, 0.08, dist); // Sharper core edge

                // Turbulent Corona (Animated Noise)
                float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
                float rayNoise = snoise(vec2(angle * 8.0, uTime * 0.1 + dist * 3.0));

                // Outer Rays
                float rays = max(0.0, sin(angle * 20.0 + uTime * 0.05) + sin(angle * 13.0 - uTime * 0.1));
                rays = pow(rays, 3.0) * 0.5; // Sharpen

                // Glow Falloff
                // Inverse square law approximation
                float glow = 0.05 / (dist * dist + 0.01) - 0.2;
                glow = max(0.0, glow);

                // Combine
                // Core is solid uColor (HDR)
                // Glow mixes uHalo

                vec3 finalColor = uColor * core * 50.0; // Very bright core

                // Add corona noise to glow
                float noiseGlow = glow * (1.0 + rayNoise * 0.5);

                finalColor += uHalo * noiseGlow * 2.0;

                // Add rays
                finalColor += uHalo * rays * smoothstep(0.5, 0.1, dist) * 0.5;

                // Alpha for blending
                float alpha = smoothstep(0.5, 0.2, dist);

                gl_FragColor = vec4(finalColor, alpha);
                #include <colorspace_fragment>
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }), [])

    useFrame((state) => {
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

const SkyGradient = ({ horizonColor }) => {
    const meshRef = useRef()
    const shaderRef = useRef()

    const midColor = useMemo(() => new THREE.Color(), [])
    const zenithColor = useMemo(() => new THREE.Color(), [])

    useFrame((state, delta) => {
        if (shaderRef.current) {
             shaderRef.current.uniforms.uHorizon.value.lerp(horizonColor, delta * 2)

             // Mid color: Horizon shifted towards blue, slightly darker
             const h = horizonColor.getHSL({ h: 0, s: 0, l: 0 })
             midColor.setHSL((h.h + 0.05) % 1.0, h.s * 0.9, Math.max(0.05, h.l * 0.6))
             shaderRef.current.uniforms.uMid.value.lerp(midColor, delta * 2)

             // Zenith color: Deep blue/black
             zenithColor.setHSL((h.h + 0.1) % 1.0, h.s * 0.8, Math.max(0.01, h.l * 0.2))
             shaderRef.current.uniforms.uZenith.value.lerp(zenithColor, delta * 2)

             // Sync Sun Direction
             const dayNightCycle = useStore.getState().dayNightCycle
             const angle = (dayNightCycle - 0.25) * Math.PI * 2
             const radius = 80
             // Matches Sun component logic
             shaderRef.current.uniforms.uSunDir.value.set(
                 Math.cos(angle) * radius,
                 Math.sin(angle) * radius,
                 Math.cos(angle) * 20
             ).normalize();
        }
    })

    const shaderArgs = useMemo(() => ({
        uniforms: {
            uHorizon: { value: new THREE.Color(horizonColor) },
            uMid: { value: new THREE.Color(0,0,0) },
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
            uniform vec3 uMid;
            uniform vec3 uZenith;
            uniform vec3 uSunDir;

            // Triangular Dithering for smoother gradients
            float random(vec2 uv) {
                return fract(sin(dot(uv.xy, vec2(12.9898, 78.233))) * 43758.5453123);
            }
            float dither(vec2 uv) {
                return (random(uv) - 0.5) / 64.0; // Stronger dither
            }

            void main() {
                vec3 dir = normalize(vWorldPosition);
                float y = max(0.0, dir.y);

                // 3-stop gradient with dithering
                // 0.0 - 0.5: Horizon -> Mid
                // 0.5 - 1.0: Mid -> Zenith

                vec3 sky;
                float noise = dither(gl_FragCoord.xy);

                if (y < 0.5) {
                    float t = y / 0.5;
                    t = clamp(t + noise, 0.0, 1.0);
                    sky = mix(uHorizon, uMid, t);
                } else {
                    float t = (y - 0.5) / 0.5;
                    t = clamp(t + noise, 0.0, 1.0);
                    sky = mix(uMid, uZenith, t);
                }

                // Mie Scattering (Sun Halo)
                // Physically-based approximation
                float sunDot = dot(dir, uSunDir);
                float sunGlow = 0.0;

                if(sunDot > 0.0) {
                     // Very sharp peak near sun disk
                     sunGlow += pow(sunDot, 128.0) * 0.8;
                     // Broader atmospheric glow
                     sunGlow += pow(sunDot, 16.0) * 0.3;
                     // Very broad haze
                     sunGlow += pow(sunDot, 4.0) * 0.1;
                }

                vec3 finalColor = sky + uHorizon * sunGlow;

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
        <Cloud position={[-20, 5, -20]} speed={0.2} opacity={0.5} segments={20} bounds={[10, 2, 10]} color={color} />
        <Cloud position={[20, 8, -15]} speed={0.2} opacity={0.4} segments={20} bounds={[10, 2, 10]} color={color} />
        <Cloud position={[0, 15, -5]} speed={0.1} opacity={0.3} segments={20} bounds={[15, 2, 5]} color={color} />
      </group>
    )
}

export const Atmosphere = ({ isHeadless }) => {
  const currentDesertIndex = useStore((state) => state.currentDesertIndex)
  const dayNightCycle = useStore((state) => state.dayNightCycle)
  const desert = deserts[currentDesertIndex]
  const fogRef = useRef()

  const cloudColor = useMemo(() => {
    if (!desert) return new THREE.Color('#fff')
    const dayness = Math.sin(dayNightCycle * Math.PI)
    const baseColor = new THREE.Color(desert.colors.sky)
    const sunsetColor = new THREE.Color('#FF9A8B')
    const nightColor = new THREE.Color('#1a1a2e')

    const c = baseColor.clone().lerp(sunsetColor, (1 - dayness) * 0.7)
    if (dayness < 0.2) {
        c.lerp(nightColor, 1 - dayness * 5)
    }
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
        const targetFogColor = targetSkyColor.clone()
        const hazeIntensity = Math.pow(dayness, 2) * 0.4
        targetFogColor.lerp(new THREE.Color('#FFFFFF'), hazeIntensity)
        fogRef.current.color.lerp(targetFogColor, delta * 1.5)

        let targetDensity = 0.008
        if (dayness > 0.2) targetDensity = 0.012
        if (dayness < 0.2 && dayness > 0.0) targetDensity = 0.02
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
