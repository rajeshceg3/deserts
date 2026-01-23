import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export const Scorpion = (props) => {
  const tailRef = useRef()

  useFrame((state) => {
    if (tailRef.current) {
        tailRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 5) * 0.2 - 0.5
    }
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

      {/* Legs (Simple loop) */}
      {[1, -1].map((side) =>
        [0.2, 0, -0.2].map((z, i) => (
            <mesh key={i} position={[side * 0.6, 0.1, z]} rotation={[0, 0, side * -0.5]}>
                 <boxGeometry args={[0.6, 0.05, 0.05]} />
                 <meshStandardMaterial color="#333" />
            </mesh>
        ))
      )}
    </group>
  )
}
