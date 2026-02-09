import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export const Lizard = (props) => {
  const group = useRef()
  const legRefs = useRef([])

  // Random offset
  const offset = React.useMemo(() => Math.random() * 100, [])

  useFrame((state) => {
    if(group.current) {
        const t = state.clock.elapsedTime + offset

        // Scuttle movement (bursts)
        const speed = 15
        const move = Math.sin(t * 2) > 0.5 // Move half the time

        if (move) {
             group.current.position.x = props.position[0] + Math.sin(t * speed) * 0.1
             group.current.rotation.y = Math.sin(t * 5) * 0.3

             // Animate Legs
             legRefs.current.forEach((leg, i) => {
                if (leg) {
                    const side = i % 2 === 0 ? 1 : -1
                    leg.rotation.y = Math.sin(t * speed + i) * 0.5
                }
             })
        }
    }
  })

  return (
    <group ref={group} {...props}>
      {/* Body - Rotated to be horizontal */}
      <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
         <capsuleGeometry args={[0.15, 0.8, 4, 8]} />
         <meshStandardMaterial color="#4caf50" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.25, 0.5]} rotation={[Math.PI/2, 0, 0]}>
          <coneGeometry args={[0.14, 0.4, 8]} />
          <meshStandardMaterial color="#4caf50" />
      </mesh>

      {/* Legs */}
      {[
        [-0.2, 0.1, 0.2], [0.2, 0.1, 0.2],
        [-0.2, 0.1, -0.2], [0.2, 0.1, -0.2]
      ].map((pos, i) => (
          <mesh
            key={i}
            ref={el => legRefs.current[i] = el}
            position={pos}
            rotation={[0, 0, i % 2 === 0 ? 0.2 : -0.2]}
          >
            <boxGeometry args={[0.3, 0.05, 0.1]} />
            <meshStandardMaterial color="#388e3c" />
          </mesh>
      ))}
    </group>
  )
}
