import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ChitinMaterial } from '../../utils/proceduralMaterials'

const Leg = ({ side, index, offset, position }) => {
    const group = useRef()
    const femurRef = useRef()
    const tibiaRef = useRef()

    useFrame((state) => {
        if (!group.current) return;

        const t = state.clock.elapsedTime * 8.0 + offset

        // Spider/Scorpion gait: Ripple pattern
        // Alternating sets
        const phase = index * 1.5 + (side > 0 ? 0 : Math.PI)
        const cycle = t + phase

        const lift = Math.max(0, Math.sin(cycle))

        // Lift whole leg group slightly
        group.current.position.y = position[1] + lift * 0.05

        // Femur swings forward/back
        const swing = Math.cos(cycle) * 0.3
        group.current.rotation.y = swing * 0.5 + (side * 0.2) // Angle out

        // Articulation
        if (femurRef.current) femurRef.current.rotation.z = side * (0.3 + lift * 0.4)
        if (tibiaRef.current) tibiaRef.current.rotation.z = -side * (0.8 + lift * 0.2)
    })

    return (
        <group position={[position[0], 0, position[2]]} ref={group}>
            {/* Coxa (Hip) */}
            <mesh rotation={[0, 0, side * 0.2]} castShadow receiveShadow>
                <sphereGeometry args={[0.04, 8, 8]} />
                <ChitinMaterial color="#1a1a1a" />
            </mesh>

            {/* Femur */}
            <group ref={femurRef}>
                <mesh position={[side * 0.15, 0.05, 0]} rotation={[0, 0, side * 0.5]} castShadow receiveShadow>
                    <capsuleGeometry args={[0.035, 0.3, 4, 8]} rotation={[0,0,Math.PI/2]} />
                    <ChitinMaterial color="#1a1a1a" />
                </mesh>

                {/* Knee */}
                <group position={[side * 0.3, 0.1, 0]} ref={tibiaRef}>
                     <mesh position={[side * 0.15, -0.1, 0]} rotation={[0, 0, -side * 0.8]} castShadow receiveShadow>
                        <capsuleGeometry args={[0.025, 0.35, 4, 8]} rotation={[0,0,Math.PI/2]} />
                        <ChitinMaterial color="#1a1a1a" />
                     </mesh>
                     {/* Tarsus (Foot) */}
                     <mesh position={[side * 0.3, -0.25, 0]} rotation={[0, 0, -side * 0.5]} castShadow receiveShadow>
                        <coneGeometry args={[0.01, 0.1, 4]} />
                        <ChitinMaterial color="#000" />
                     </mesh>
                </group>
            </group>
        </group>
    )
}

const TailSegment = ({ index, count, offset }) => {
    const ref = useRef()

    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.elapsedTime + offset

        // Threat display: Tail curls over head
        const curl = 0.4 + Math.sin(t * 2 + index * 0.5) * 0.05

        // If stinging, snap forward
        const sting = Math.sin(t * 0.5) > 0.95
        const snap = sting ? Math.sin(t * 10) * 0.2 : 0

        ref.current.rotation.x = curl + snap
    })

    const scale = 1.0 - (index / count) * 0.4

    return (
        <group ref={ref} position={[0, index === 0 ? 0 : 0.15, index === 0 ? 0 : 0.05]}>
             <mesh scale={[scale, scale, scale * 1.2]} castShadow receiveShadow>
                 <sphereGeometry args={[0.1, 12, 12]} />
                 <ChitinMaterial color="#222" />
             </mesh>

             {index < count - 1 ? (
                 <TailSegment index={index + 1} count={count} offset={offset} />
             ) : (
                 // Stinger
                 <group position={[0, 0.1, 0.05]} rotation={[0.5, 0, 0]}>
                     <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
                         <sphereGeometry args={[0.08, 12, 12]} />
                         <meshStandardMaterial color="#800000" roughness={0.1} />
                     </mesh>
                     <mesh position={[0, 0.25, 0.05]} rotation={[-0.2, 0, 0]} castShadow receiveShadow>
                         <coneGeometry args={[0.03, 0.25, 8]} />
                         <meshStandardMaterial color="#aa0000" roughness={0.1} />
                     </mesh>
                 </group>
             )}
        </group>
    )
}

const Pincer = ({ side, offset }) => {
    const ref = useRef()
    const clawRef = useRef()

    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.elapsedTime + offset

        // Idle movement
        ref.current.position.y = 0.15 + Math.sin(t * 2) * 0.02
        ref.current.rotation.y = side * 0.3 + Math.sin(t * 1.5) * 0.1

        // Snapping
        if (clawRef.current) {
            clawRef.current.rotation.y = Math.sin(t * 5) * 0.1 + 0.1
        }
    })

    return (
        <group ref={ref} position={[side * 0.25, 0.15, -0.35]}>
            {/* Arm Segments */}
            <group rotation={[0, side * 0.8, 0]}>
                 <mesh position={[0, 0, -0.15]} rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow>
                     <capsuleGeometry args={[0.05, 0.3, 4, 8]} />
                     <ChitinMaterial color="#1a1a1a" />
                 </mesh>

                 {/* Forearm */}
                 <group position={[0, 0, -0.3]} rotation={[0, -side * 0.5, 0]}>
                     <mesh position={[0, 0, -0.15]} rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow>
                         <capsuleGeometry args={[0.06, 0.35, 4, 8]} />
                         <ChitinMaterial color="#1a1a1a" />
                     </mesh>

                     {/* Claw Hand */}
                     <group position={[0, 0, -0.35]} rotation={[0, 0, Math.PI/2]}>
                         {/* Fixed Finger */}
                         <mesh position={[0.05, 0, 0]} rotation={[0, 0, 0.2]} castShadow receiveShadow>
                             <coneGeometry args={[0.04, 0.3, 8]} />
                             <ChitinMaterial color="#000" />
                         </mesh>
                         {/* Moving Finger */}
                         <group ref={clawRef}>
                             <mesh position={[-0.05, 0, 0]} rotation={[0, 0, -0.2]} castShadow receiveShadow>
                                 <coneGeometry args={[0.04, 0.3, 8]} />
                                 <ChitinMaterial color="#000" />
                             </mesh>
                         </group>
                     </group>
                 </group>
            </group>
        </group>
    )
}

export const Scorpion = (props) => {
  const group = useRef()
  const [offset] = React.useState(() => Math.random() * 100)

  useFrame((state) => {
      if (group.current) {
          const t = state.clock.elapsedTime + offset
          // Bob
          group.current.position.y = props.position[1] + Math.sin(t * 5) * 0.01
      }
  })

  return (
    <group ref={group} {...props}>
      {/* Body Carapace (Segmented) */}
      <group position={[0, 0.15, 0]}>
          <mesh position={[0, 0.05, -0.15]} scale={[1, 0.6, 1.2]} castShadow receiveShadow>
            <sphereGeometry args={[0.25, 16, 16]} />
            <ChitinMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[0, 0.08, 0.1]} scale={[1.1, 0.7, 1]} castShadow receiveShadow>
            <sphereGeometry args={[0.22, 16, 16]} />
            <ChitinMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[0, 0.06, 0.3]} scale={[0.9, 0.6, 0.8]} castShadow receiveShadow>
            <sphereGeometry args={[0.18, 16, 16]} />
            <ChitinMaterial color="#1a1a1a" />
          </mesh>
      </group>

      {/* Tail Base */}
      <group position={[0, 0.2, 0.4]}>
          <TailSegment index={0} count={6} offset={offset} />
      </group>

      {/* Legs (4 pairs) */}
      {[1, -1].map((side) =>
          [0, 1, 2, 3].map((i) => (
             <Leg key={`${side}-${i}`} side={side} index={i} offset={offset} position={[side * 0.1, 0.1, i * 0.12 - 0.1]} />
          ))
      )}

      {/* Pincers */}
      <Pincer side={1} offset={offset} />
      <Pincer side={-1} offset={offset} />

    </group>
  )
}
