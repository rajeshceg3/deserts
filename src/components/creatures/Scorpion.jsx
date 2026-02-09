import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export const Scorpion = (props) => {
  const tailRef = useRef()
  const legRefs = useRef([])
  const offset = React.useMemo(() => Math.random() * 100, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime + offset

    if (tailRef.current) {
        // More menacing tail movement
        tailRef.current.rotation.x = Math.sin(t * 5) * 0.3 - 0.5
        tailRef.current.rotation.z = Math.sin(t * 2) * 0.1
    }

    // Animate legs (ripple effect)
    legRefs.current.forEach((leg, i) => {
        if (leg) {
             // Side-specific rotation base
             // Indices 0-2 are side 1, 3-5 are side -1
             const side = i < 3 ? 1 : -1
             const baseRot = side * -0.5

             // Twitch/Walk
             leg.rotation.z = baseRot + Math.sin(t * 10 + i) * 0.2
             leg.position.y = 0.1 + Math.max(0, Math.sin(t * 10 + i)) * 0.05
        }
    })
  })

  return (
    <group {...props}>
      {/* Body */}
      <mesh position={[0, 0.2, 0]} scale={[1, 0.5, 1.5]}>
        <sphereGeometry args={[0.4]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Tail */}
      <group position={[0, 0.3, -0.6]} ref={tailRef}>
        <mesh position={[0, 0.4, -0.2]} rotation={[0.5, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.1, 0.8]} />
            <meshStandardMaterial color="#333" />
        </mesh>
         <mesh position={[0, 0.8, -0.4]} rotation={[1, 0, 0]}>
            <coneGeometry args={[0.08, 0.3]} />
            <meshStandardMaterial color="red" />
        </mesh>
      </group>

      {/* Legs */}
      {[1, -1].map((side, sideIndex) =>
        [0.2, 0, -0.2].map((z, legIndex) => {
            const index = sideIndex * 3 + legIndex
            return (
                <mesh
                    key={`leg-${index}`}
                    ref={el => legRefs.current[index] = el}
                    position={[side * 0.6, 0.1, z]}
                    rotation={[0, 0, side * -0.5]}
                >
                     <boxGeometry args={[0.6, 0.05, 0.05]} />
                     <meshStandardMaterial color="#333" />
                </mesh>
            )
        })
      )}
    </group>
  )
}
