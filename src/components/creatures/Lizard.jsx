import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ScaleMaterial } from '../../utils/proceduralMaterials'

const TailSegment = ({ index, count, offset }) => {
    const ref = useRef()

    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.elapsedTime + offset

        // Sinuous motion
        // Delay phase by index
        const angle = Math.sin(t * 10.0 - index * 0.5) * 0.3
        ref.current.rotation.y = angle
    })

    const scale = 1.0 - (index / count) * 0.8

    return (
        <group ref={ref} position={[0, 0, 0.15]}>
             <mesh scale={[scale, scale, 1.2]} position={[0, 0, 0.05]} castShadow receiveShadow>
                 <capsuleGeometry args={[0.08, 0.15, 4, 8]} rotation={[Math.PI/2, 0, 0]} />
                 <ScaleMaterial color="#4caf50" />
             </mesh>

             {index < count - 1 && (
                 <TailSegment index={index + 1} count={count} offset={offset} />
             )}
        </group>
    )
}

export const Lizard = (props) => {
  const group = useRef()
  const bodyRef = useRef()
  const headRef = useRef()
  const legRefs = useRef([])

  // Random offset
  const [offset] = React.useState(() => Math.random() * 100)

  useFrame((state) => {
    if(group.current) {
        const t = state.clock.elapsedTime + offset

        // Intermittent movement
        const speed = 10.0
        const raw = Math.sin(t * 2.0)
        const moveFactor = THREE.MathUtils.smoothstep(raw, 0.4, 0.6) // Only move part of the cycle

        // Body Wiggle
        const wiggle = Math.sin(t * speed) * 0.2 * moveFactor

        if (bodyRef.current) bodyRef.current.rotation.y = wiggle
        if (headRef.current) headRef.current.rotation.y = -wiggle * 0.5 // Head stabilizes

        // Position darting
        // We can't move actual position easily without messing up CreatureManager,
        // but we can offset locally.
        group.current.position.x = props.position[0] + wiggle * 0.1

        // Legs
        legRefs.current.forEach((leg, i) => {
            if (leg) {
                const side = i % 2 === 0 ? 1 : -1
                // Alternating gait
                const phase = i < 2 ? 0 : Math.PI
                const legAngle = Math.sin(t * speed + phase) * 0.6 * moveFactor
                leg.rotation.y = legAngle

                // Lift
                const lift = Math.max(0, Math.cos(t * speed + phase)) * 0.2 * moveFactor
                leg.position.y = 0.1 + lift
            }
        })
    }
  })

  return (
    <group ref={group} {...props}>
      {/* Main Body */}
      <group position={[0, 0.15, 0]} ref={bodyRef}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
             <capsuleGeometry args={[0.15, 0.6, 4, 8]} />
             <ScaleMaterial color="#4caf50" />
          </mesh>

          {/* Tail Start */}
          <group position={[0, 0, 0.3]}>
              <TailSegment index={0} count={8} offset={offset} />
          </group>

          {/* Neck */}
          <group position={[0, 0.05, -0.3]}>
              <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
                 <capsuleGeometry args={[0.12, 0.3, 4, 8]} />
                 <ScaleMaterial color="#4caf50" />
              </mesh>

              {/* Head */}
              <group position={[0, 0, -0.2]} ref={headRef}>
                  <mesh rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow>
                      <coneGeometry args={[0.1, 0.4, 8]} />
                      <ScaleMaterial color="#388e3c" />
                  </mesh>
                  {/* Eyes */}
                  <mesh position={[0.08, 0.05, -0.1]} castShadow receiveShadow>
                      <sphereGeometry args={[0.03, 8, 8]} />
                      <meshStandardMaterial color="#111" />
                  </mesh>
                  <mesh position={[-0.08, 0.05, -0.1]} castShadow receiveShadow>
                      <sphereGeometry args={[0.03, 8, 8]} />
                      <meshStandardMaterial color="#111" />
                  </mesh>
              </group>
          </group>

          {/* Legs attached to body so they wiggle with it?
              Real lizards: legs attached to body, but feet stay planted.
              Here simplified: Legs attach to body.
          */}

          {[
            [-0.15, 0, -0.2], [0.15, 0, -0.2], // Front
            [-0.15, 0, 0.2], [0.15, 0, 0.2]    // Back
          ].map((pos, i) => (
              <group
                key={i}
                ref={el => legRefs.current[i] = el}
                position={pos}
                rotation={[0, 0, i % 2 === 0 ? 0.5 : -0.5]} // Splay
              >
                {/* Upper Leg */}
                <mesh position={[i % 2 === 0 ? -0.15 : 0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
                    <capsuleGeometry args={[0.05, 0.3, 4, 8]} />
                    <ScaleMaterial color="#2e7d32" />
                </mesh>
                {/* Lower Leg */}
                 <mesh position={[i % 2 === 0 ? -0.3 : 0.3, -0.1, 0.1]} rotation={[0.5, 0, Math.PI / 2]} castShadow receiveShadow>
                    <capsuleGeometry args={[0.04, 0.25, 4, 8]} />
                    <ScaleMaterial color="#2e7d32" />
                </mesh>
              </group>
          ))}
      </group>
    </group>
  )
}
