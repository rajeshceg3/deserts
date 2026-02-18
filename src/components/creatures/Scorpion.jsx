import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ChitinMaterial } from '../../utils/proceduralMaterials'

const Leg = ({ side, index, offset, ...props }) => {
    const group = useRef()
    const segment1 = useRef()
    const segment2 = useRef()

    useFrame((state) => {
        const t = state.clock.elapsedTime + offset
        // Leg movement logic
        // Lift and plant
        const speed = 10
        const legPhase = index * 0.5 + (side > 0 ? 0 : Math.PI)
        const cycle = Math.sin(t * speed + legPhase)

        if (group.current) {
            // Lift
            group.current.position.y = Math.max(0, cycle) * 0.1 + 0.1
            // Forward/Back
            group.current.rotation.y = Math.cos(t * speed + legPhase) * 0.2 + (side * 0.2) // slight angle

            // Segment articulation
            if (segment1.current) segment1.current.rotation.z = side * (0.5 + cycle * 0.1)
            if (segment2.current) segment2.current.rotation.z = side * (0.8 + cycle * 0.1)
        }
    })

    return (
        <group ref={group} {...props}>
             {/* Coxa/Femur */}
             <group ref={segment1} rotation={[0, 0, side * 0.5]}>
                 <mesh position={[side * 0.2, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                    <capsuleGeometry args={[0.03, 0.4, 4, 8]} />
                    <ChitinMaterial color="#1a1a1a" />
                 </mesh>
                 {/* Tibia */}
                 <group position={[side * 0.4, 0, 0]} ref={segment2} rotation={[0, 0, -side * 1.0]}>
                    <mesh position={[side * 0.25, -0.1, 0]} rotation={[0, 0, Math.PI/1.5]}>
                        <capsuleGeometry args={[0.02, 0.5, 4, 8]} />
                        <ChitinMaterial color="#1a1a1a" />
                    </mesh>
                 </group>
             </group>
        </group>
    )
}

const Tail = ({ offset }) => {
    const group = useRef()
    // Segments
    const segs = useRef([])

    useFrame((state) => {
         const t = state.clock.elapsedTime + offset
         // Sting logic
         const sting = Math.sin(t * 2) > 0.8 // Occasional sting

         segs.current.forEach((seg, i) => {
             if (seg) {
                 // Curling up
                 const baseCurl = 0.4
                 const curl = baseCurl + Math.sin(t * 3 + i) * 0.1
                 seg.rotation.x = curl + (sting && i > 2 ? 0.5 : 0)
             }
         })
    })

    return (
        <group position={[0, 0.2, 0.4]} ref={group}>
            {[0, 1, 2, 3, 4].map((i) => (
                <group key={i} position={[0, 0.15, 0.1]} ref={el => segs.current[i] = el}>
                    <mesh position={[0, 0.1, 0]}>
                        <sphereGeometry args={[0.12 - i * 0.015, 8, 8]} />
                        <ChitinMaterial color="#222" />
                    </mesh>
                    {/* Stinger on last segment */}
                    {i === 4 && (
                        <mesh position={[0, 0.2, 0.05]} rotation={[0.5, 0, 0]}>
                             <coneGeometry args={[0.04, 0.2, 8]} />
                             <meshStandardMaterial color="#800000" roughness={0.1} />
                        </mesh>
                    )}
                    {/* Nest next segment inside? No, this is flat mapping.
                        Need recursive or relative positioning.
                        This loop creates them all at same parent but I can offset them manually if I knew the previous transform.
                        Recursion is cleaner for tails.
                        But here I'll just fake it by offsetting the group manually?
                        No, that won't articulate.
                    */}
                </group>
            ))}
        </group>
    )
}

// Recursive Tail
const TailSegment = ({ index, count, offset }) => {
    const ref = useRef()
    useFrame((state) => {
        if (ref.current) {
            const t = state.clock.elapsedTime + offset
            // Base curl
            ref.current.rotation.x = 0.5 + Math.sin(t * 2 + index) * 0.1
        }
    })

    if (index >= count) {
        // Stinger
        return (
            <mesh position={[0, 0.15, 0.05]} rotation={[0.5, 0, 0]}>
                 <coneGeometry args={[0.05, 0.2, 8]} />
                 <meshStandardMaterial color="#aa0000" roughness={0.2} />
            </mesh>
        )
    }

    return (
        <group ref={ref} position={[0, index === 0 ? 0 : 0.2, index === 0 ? 0 : 0.05]}>
             <mesh>
                 <sphereGeometry args={[0.12 - index * 0.01, 8, 8]} />
                 <ChitinMaterial color="#1a1a1a" />
             </mesh>
             <TailSegment index={index + 1} count={count} offset={offset} />
        </group>
    )
}

const Pincer = ({ side, offset }) => {
    const ref = useRef()
    useFrame((state) => {
        if (ref.current) {
            const t = state.clock.elapsedTime + offset
            ref.current.rotation.y = side * 0.5 + Math.sin(t * 2) * 0.2
        }
    })

    return (
        <group ref={ref} position={[side * 0.3, 0.15, -0.4]}>
            {/* Arm */}
            <mesh rotation={[0, side * 0.5, 0]}>
                 <capsuleGeometry args={[0.06, 0.4, 4, 8]} />
                 <ChitinMaterial color="#1a1a1a" />
            </mesh>
            {/* Claw */}
             <group position={[0, 0, -0.25]} rotation={[0, side * 0.5, 0]}>
                 <mesh position={[0.05, 0, -0.1]} rotation={[0, 0.5, Math.PI/2]}>
                     <coneGeometry args={[0.05, 0.3, 8]} />
                     <ChitinMaterial color="#000" />
                 </mesh>
                 <mesh position={[-0.05, 0, -0.1]} rotation={[0, -0.5, Math.PI/2]}>
                     <coneGeometry args={[0.05, 0.3, 8]} />
                     <ChitinMaterial color="#000" />
                 </mesh>
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
          group.current.position.y = props.position[1] + Math.sin(t * 5) * 0.02
      }
  })

  return (
    <group ref={group} {...props}>
      {/* Body Segments */}
      <mesh position={[0, 0.15, 0]} scale={[1, 0.6, 1.2]} castShadow receiveShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <ChitinMaterial color="#1a1a1a" />
      </mesh>
       <mesh position={[0, 0.15, 0.3]} scale={[0.9, 0.5, 1]} castShadow receiveShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <ChitinMaterial color="#1a1a1a" />
      </mesh>

      {/* Tail */}
      <group position={[0, 0.2, 0.5]}>
          <TailSegment index={0} count={5} offset={offset} />
      </group>

      {/* Legs (4 pairs) */}
      {[1, -1].map((side) =>
          [0, 1, 2, 3].map((i) => (
             <Leg key={`${side}-${i}`} side={side} index={i} offset={offset} position={[0, 0.1, i * 0.15 - 0.2]} />
          ))
      )}

      {/* Pincers */}
      <Pincer side={1} offset={offset} />
      <Pincer side={-1} offset={offset} />

    </group>
  )
}
