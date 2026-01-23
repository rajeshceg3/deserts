import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export const Lizard = (props) => {
  const group = useRef()

  useFrame((state) => {
    if(group.current) {
        // Scuttle movement
        const t = state.clock.elapsedTime
        group.current.position.x = props.position[0] + Math.sin(t * 10) * 0.1
        group.current.rotation.y = Math.sin(t * 2) * 0.5
    }
  })

  return (
    <group ref={group} {...props}>
      {/* Body */}
      <mesh position={[0, 0.1, 0]}>
         <capsuleGeometry args={[0.15, 0.8, 4, 8]} />
         <meshStandardMaterial color="#4caf50" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.2, 0.5]}>
          <coneGeometry args={[0.15, 0.4, 8]} rotation={[Math.PI/2, 0, 0]} />
          <meshStandardMaterial color="#4caf50" />
      </mesh>
    </group>
  )
}
