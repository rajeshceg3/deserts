import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { ScaleMaterial } from '../../utils/proceduralMaterials'
import * as THREE from 'three'

export const Lizard = (props) => {
  const group = useRef()
  const legRefs = useRef([])
  const throatRef = useRef()

  // Random offset
  const offset = useMemo(() => Math.random() * 100, [])
  const lizardColor = "#4caf50" // Green
  const patternColor = "#2e7d32" // Dark Green

  useFrame((state, delta) => {
    if(group.current) {
        const t = state.clock.elapsedTime + offset

        // Scuttle Idle Animation
        // Lizards are still, then move quickly, then still.
        // We simulate this with "twitchy" rotations.

        // Throat breathing (rapid puffing)
        if (throatRef.current) {
            throatRef.current.scale.y = 1 + Math.sin(t * 15) * 0.1
        }

        // Random head look (jerky)
        // Use noise or random sine
        const lookT = t * 2
        const jerk = Math.sin(lookT) > 0.8 ? Math.sin(lookT * 20) * 0.1 : 0
        group.current.rotation.y += jerk * 0.1

        // Legs twitching
        legRefs.current.forEach((leg, i) => {
            if (leg) {
                // Occasional twitch
                if (Math.sin(t * 5 + i) > 0.9) {
                    leg.rotation.z = (i % 2 === 0 ? 0.2 : -0.2) + Math.sin(t * 50) * 0.1
                } else {
                     leg.rotation.z = THREE.MathUtils.lerp(leg.rotation.z, (i % 2 === 0 ? 0.2 : -0.2), 0.1)
                }
            }
        })
    }
  })

  return (
    <group ref={group} {...props}>
      {/* Body Segment 1 (Torso) */}
      <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
         <capsuleGeometry args={[0.15, 0.5, 4, 8]} />
         <ScaleMaterial color={lizardColor} />
      </mesh>

      {/* Head */}
      <group position={[0, 0.2, 0.35]}>
          <mesh rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow>
              <coneGeometry args={[0.12, 0.35, 8]} /> {/* Snout shape */}
              <ScaleMaterial color={lizardColor} />
          </mesh>
          {/* Throat Sack */}
          <mesh ref={throatRef} position={[0, -0.05, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.08, 8, 8]} />
              <ScaleMaterial color="#81c784" /> {/* Lighter */}
          </mesh>
          {/* Eyes */}
          <mesh position={[0.08, 0.1, 0.05]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial color="#000" roughness={0.1} />
          </mesh>
          <mesh position={[-0.08, 0.1, 0.05]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial color="#000" roughness={0.1} />
          </mesh>
      </group>

      {/* Tail (Curved Segmented) */}
      <group position={[0, 0.15, -0.3]}>
           <mesh rotation={[Math.PI/2, 0, 0]} position={[0, 0, -0.2]} castShadow receiveShadow>
               <capsuleGeometry args={[0.1, 0.5, 4, 8]} />
               <ScaleMaterial color={patternColor} />
           </mesh>
           <mesh rotation={[Math.PI/2, 0.2, 0]} position={[0.1, 0, -0.6]} castShadow receiveShadow>
               <capsuleGeometry args={[0.06, 0.6, 4, 8]} />
               <ScaleMaterial color={patternColor} />
           </mesh>
      </group>

      {/* Legs */}
      {[
        [-0.15, 0.1, 0.15], [0.15, 0.1, 0.15], // Front
        [-0.15, 0.1, -0.15], [0.15, 0.1, -0.15] // Back
      ].map((pos, i) => {
          const isLeft = i % 2 === 0
          return (
            <group key={i} position={pos} rotation={[0, isLeft ? 0.5 : -0.5, 0]}>
                {/* Upper Leg */}
                <mesh
                    ref={el => legRefs.current[i] = el}
                    rotation={[0, 0, isLeft ? 0.5 : -0.5]}
                    position={[isLeft ? -0.1 : 0.1, 0.05, 0]}
                    castShadow receiveShadow
                >
                    <capsuleGeometry args={[0.04, 0.3, 4, 8]} />
                    <ScaleMaterial color={patternColor} />
                </mesh>
                {/* Lower Leg? Keep it simple for now, lizard legs stick out */}
            </group>
          )
      })}
    </group>
  )
}
