import {useStore} from '../../store'
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scaleOnBeforeCompile } from '../../utils/proceduralMaterials'

const TailSegment = ({ index, count, offset }) => {
    const ref = useRef()

    useFrame((state) => {

        if (!ref.current) return;
        const t = (useStore.getState().motion?state.clock.elapsedTime:0) + offset

        // Sinuous motion
        // Delay phase by index
        const angle = Math.sin(t * 10.0 - index * 0.5) * 0.3
        ref.current.rotation.y = angle
    })

    const scale = 1.0 - (index / count) * 0.8

    return (
        <group ref={ref} position={[0, 0, 0.15]}>
             <mesh scale={[scale, scale, 1.2]} position={[0, 0, 0.05]} castShadow receiveShadow>
                 <capsuleGeometry args={[0.08, 0.15, 4, 4]} rotation={[Math.PI/2, 0, 0]} />
                 <meshStandardMaterial color="#4caf50" onBeforeCompile={scaleOnBeforeCompile} />
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
        const t = (useStore.getState().motion?state.clock.elapsedTime:0) + offset

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
          <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.85, 1]} castShadow receiveShadow>
             <capsuleGeometry args={[0.15, 0.6, 4, 6]} />
             <meshStandardMaterial color="#4caf50" onBeforeCompile={scaleOnBeforeCompile} />
          </mesh>
          {/* Pale belly */}
          <mesh position={[0, -0.07, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.8, 0.5, 1]} castShadow={false} receiveShadow>
             <capsuleGeometry args={[0.12, 0.5, 4, 6]} />
             <meshStandardMaterial color="#a5d6a7" onBeforeCompile={scaleOnBeforeCompile} />
          </mesh>
          {/* Dorsal crest: a row of small spines from neck to tail base */}
          {[-0.42, -0.3, -0.18, -0.06, 0.06, 0.18, 0.3].map((z, i) => (
              <mesh key={'spine'+i} position={[0, 0.14, z]} castShadow={false} receiveShadow={false}>
                  <coneGeometry args={[0.02, 0.07 - Math.abs(z) * 0.06, 4]} />
                  <meshStandardMaterial color="#2e7d32" onBeforeCompile={scaleOnBeforeCompile} />
              </mesh>
          ))}

          {/* Tail Start */}
          <group position={[0, 0, 0.3]}>
              <TailSegment index={0} count={8} offset={offset} />
          </group>

          {/* Neck */}
          <group position={[0, 0.05, -0.3]}>
              <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
                 <capsuleGeometry args={[0.12, 0.3, 4, 4]} />
                 <meshStandardMaterial color="#4caf50" onBeforeCompile={scaleOnBeforeCompile} />
              </mesh>

              {/* Head - flattened triangular skull with a defined jaw */}
              <group position={[0, 0, -0.2]} ref={headRef}>
                  <mesh rotation={[Math.PI/2, 0, 0]} scale={[1.15, 0.75, 1]} castShadow receiveShadow>
                      <coneGeometry args={[0.11, 0.42, 6]} />
                      <meshStandardMaterial color="#388e3c" onBeforeCompile={scaleOnBeforeCompile} />
                  </mesh>
                  {/* Jaw / throat, slightly paler */}
                  <mesh position={[0, -0.035, -0.12]} rotation={[Math.PI/2, 0, 0]} scale={[1, 0.55, 0.9]} castShadow={false} receiveShadow>
                      <coneGeometry args={[0.085, 0.34, 6]} />
                      <meshStandardMaterial color="#a5d6a7" onBeforeCompile={scaleOnBeforeCompile} />
                  </mesh>
                  {/* Nostrils */}
                  <mesh position={[0.02, 0.01, -0.32]}>
                      <sphereGeometry args={[0.008, 4, 4]} />
                      <meshStandardMaterial color="#1b3d1e" />
                  </mesh>
                  <mesh position={[-0.02, 0.01, -0.32]}>
                      <sphereGeometry args={[0.008, 4, 4]} />
                      <meshStandardMaterial color="#1b3d1e" />
                  </mesh>
                  {/* Eyes on the sides of the skull, dark with a ridge above */}
                  <mesh position={[0.095, 0.045, -0.12]}>
                      <sphereGeometry args={[0.032, 6, 5]} />
                      <meshStandardMaterial color="#111" roughness={0.2} />
                  </mesh>
                  <mesh position={[-0.095, 0.045, -0.12]}>
                      <sphereGeometry args={[0.032, 6, 5]} />
                      <meshStandardMaterial color="#111" roughness={0.2} />
                  </mesh>
                  <mesh position={[0.095, 0.08, -0.12]} rotation={[0, 0, -0.15]} castShadow={false}>
                      <boxGeometry args={[0.07, 0.02, 0.06]} />
                      <meshStandardMaterial color="#2e7d32" onBeforeCompile={scaleOnBeforeCompile} />
                  </mesh>
                  <mesh position={[-0.095, 0.08, -0.12]} rotation={[0, 0, 0.15]} castShadow={false}>
                      <boxGeometry args={[0.07, 0.02, 0.06]} />
                      <meshStandardMaterial color="#2e7d32" onBeforeCompile={scaleOnBeforeCompile} />
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
                    <capsuleGeometry args={[0.05, 0.3, 4, 4]} />
                    <meshStandardMaterial color="#2e7d32" onBeforeCompile={scaleOnBeforeCompile} />
                </mesh>
                {/* Lower Leg */}
                 <mesh position={[i % 2 === 0 ? -0.3 : 0.3, -0.1, 0.1]} rotation={[0.5, 0, Math.PI / 2]}>
                    <capsuleGeometry args={[0.04, 0.25, 4, 4]} />
                    <meshStandardMaterial color="#2e7d32" onBeforeCompile={scaleOnBeforeCompile} />
                </mesh>
                {/* Splayed toes */}
                {[-0.05, 0, 0.05].map((dz, ti) => (
                    <mesh key={'toe'+ti} position={[i % 2 === 0 ? -0.44 : 0.44, -0.2, 0.12 + dz]} rotation={[0, 0, Math.PI / 2]} castShadow={false}>
                        <coneGeometry args={[0.012, 0.08, 3]} />
                        <meshStandardMaterial color="#2e7d32" />
                    </mesh>
                ))}
              </group>
          ))}
      </group>
    </group>
  )
}
