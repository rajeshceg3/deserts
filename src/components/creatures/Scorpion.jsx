import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { ChitinMaterial } from '../../utils/proceduralMaterials'
import * as THREE from 'three'

export const Scorpion = (props) => {
  const group = useRef()
  const tailRef = useRef()
  const stingerRef = useRef()
  const legRefs = useRef([])
  const clawLRef = useRef()
  const clawRRef = useRef()

  // Random offset
  const offset = useMemo(() => Math.random() * 100, [])
  const chitinColor = "#1a1a1a" // Dark Grey/Black

  useFrame((state, delta) => {
    if (group.current) {
        const t = state.clock.elapsedTime + offset

        // Tail menace (Slow, snake-like)
        // We need to animate the group of tail segments?
        // Actually, my tail implementation uses static meshes relative to tailRef.
        // So rotating tailRef rotates the whole tail rigidly.
        // To make it snake-like, I would need refs for each segment or a skinned mesh.
        // For now, rotating the base (tailRef) and maybe the stinger is enough for "menace".

        if (tailRef.current) {
            // curl up and down
            const curl = Math.sin(t * 0.5) * 0.2 + 0.5 // Base curl + modulation
            tailRef.current.rotation.x = -curl

            // Stinger twitch
            if (stingerRef.current) {
                stingerRef.current.rotation.x = Math.sin(t * 5) * 0.1 + 0.5
            }
        }

        // Claws (Threatening open/close)
        const clawOpen = 0.3 + Math.sin(t * 2) * 0.1
        if (clawLRef.current) clawLRef.current.rotation.y = clawOpen
        if (clawRRef.current) clawRRef.current.rotation.y = -clawOpen

        // Legs ripple
        legRefs.current.forEach((leg, i) => {
            if (leg) {
                // Sequential wave
                const legY = Math.sin(t * 10 + i) * 0.05
                leg.position.y = 0.1 + Math.max(0, legY)

                // Slight forward/back move
                leg.rotation.y = Math.sin(t * 10 + i) * 0.1
            }
        })
    }
  })

  // Procedural tail segments
  const tailSegments = 5;

  return (
    <group ref={group} {...props}>
      {/* Body: Flattened Sphere/Capsule */}
      <mesh position={[0, 0.15, 0]} scale={[1, 0.6, 1.2]} castShadow receiveShadow>
         <sphereGeometry args={[0.3, 16, 16]} />
         <ChitinMaterial color={chitinColor} />
      </mesh>

      {/* Head/Carapace Front */}
      <mesh position={[0, 0.2, 0.25]} scale={[1, 0.5, 0.8]} castShadow receiveShadow>
         <sphereGeometry args={[0.25, 16, 16]} />
         <ChitinMaterial color={chitinColor} />
      </mesh>
      {/* Eyes */}
       <mesh position={[0, 0.35, 0.35]}>
         <sphereGeometry args={[0.05, 8, 8]} />
         <meshStandardMaterial color="#000" roughness={0.1} />
      </mesh>

      {/* Tail Base */}
      <group position={[0, 0.3, -0.3]} ref={tailRef}>
          {/* Segments - Simplified to a few static relative positions for this iteration */}
          <mesh position={[0, 0.1, -0.1]} rotation={[0.5, 0, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.18, 12, 12]} />
              <ChitinMaterial color={chitinColor} />
          </mesh>
          <mesh position={[0, 0.25, -0.25]} rotation={[1.0, 0, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.15, 12, 12]} />
              <ChitinMaterial color={chitinColor} />
          </mesh>
           <mesh position={[0, 0.4, -0.35]} rotation={[1.5, 0, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.12, 12, 12]} />
              <ChitinMaterial color={chitinColor} />
          </mesh>

          {/* Stinger */}
          <group position={[0, 0.55, -0.4]} ref={stingerRef} rotation={[2.0, 0, 0]}>
               <mesh position={[0, 0, 0]} castShadow receiveShadow>
                   <sphereGeometry args={[0.1, 12, 12]} />
                   <ChitinMaterial color={chitinColor} />
               </mesh>
               <mesh position={[0, 0.1, 0]} rotation={[0, 0, 0]} castShadow receiveShadow>
                   <coneGeometry args={[0.05, 0.2, 8]} />
                   <meshStandardMaterial color="#8b0000" roughness={0.2} metalness={0.5} />
               </mesh>
          </group>
      </group>

      {/* Claws */}
      {/* Left Arm */}
      <group position={[0.3, 0.2, 0.3]} rotation={[0, 0.5, 0]}>
          <mesh rotation={[0, 0, -0.2]} castShadow receiveShadow>
              <capsuleGeometry args={[0.04, 0.5, 4, 8]} />
              <ChitinMaterial color={chitinColor} />
          </mesh>
          {/* Pincer */}
          <group position={[0.1, 0.1, 0.2]} ref={clawLRef}>
               <mesh rotation={[0, 0, 1.5]} castShadow receiveShadow>
                   <coneGeometry args={[0.08, 0.3, 8]} />
                   <ChitinMaterial color={chitinColor} />
               </mesh>
               <mesh position={[0.05, 0, 0.05]} rotation={[0, 0, 1.2]} castShadow receiveShadow>
                   <coneGeometry args={[0.04, 0.2, 8]} />
                   <ChitinMaterial color={chitinColor} />
               </mesh>
          </group>
      </group>

      {/* Right Arm */}
      <group position={[-0.3, 0.2, 0.3]} rotation={[0, -0.5, 0]}>
          <mesh rotation={[0, 0, 0.2]} castShadow receiveShadow>
              <capsuleGeometry args={[0.04, 0.5, 4, 8]} />
              <ChitinMaterial color={chitinColor} />
          </mesh>
          {/* Pincer */}
          <group position={[-0.1, 0.1, 0.2]} ref={clawRRef}>
               <mesh rotation={[0, 0, -1.5]} castShadow receiveShadow>
                   <coneGeometry args={[0.08, 0.3, 8]} />
                   <ChitinMaterial color={chitinColor} />
               </mesh>
                <mesh position={[-0.05, 0, 0.05]} rotation={[0, 0, -1.2]} castShadow receiveShadow>
                   <coneGeometry args={[0.04, 0.2, 8]} />
                   <ChitinMaterial color={chitinColor} />
               </mesh>
          </group>
      </group>

      {/* Legs */}
      {[
          [0.25, 0, 0.1], [-0.25, 0, 0.1],
          [0.3, 0, -0.05], [-0.3, 0, -0.05],
          [0.3, 0, -0.2], [-0.3, 0, -0.2],
          [0.25, 0, -0.35], [-0.25, 0, -0.35]
      ].map((pos, i) => {
          const isRight = pos[0] > 0

          return (
            <group
                key={i}
                position={[pos[0], 0.1, pos[2]]}
                rotation={[0, 0, isRight ? -0.5 : 0.5]}
                ref={el => legRefs.current[i] = el}
            >
                {/* Leg Segments */}
                <mesh position={[isRight ? 0.2 : -0.2, -0.1, 0]} rotation={[0, 0, isRight ? 1 : -1]} castShadow receiveShadow>
                    <capsuleGeometry args={[0.03, 0.4, 4, 8]} />
                    <ChitinMaterial color={chitinColor} />
                </mesh>
            </group>
          )
      })}

    </group>
  )
}
