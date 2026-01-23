import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export const Fox = (props) => {
  const headRef = useRef()

  useFrame((state) => {
    if(headRef.current) {
        // Look around
        headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3
    }
  })

  return (
    <group {...props}>
      {/* Body */}
      <mesh position={[0, 0.4, 0]}>
         <boxGeometry args={[0.5, 0.5, 1]} />
         <meshStandardMaterial color="#d35400" />
      </mesh>

      {/* Head */}
      <group position={[0, 0.7, 0.6]} ref={headRef}>
        <mesh>
             <boxGeometry args={[0.4, 0.4, 0.5]} />
             <meshStandardMaterial color="#d35400" />
        </mesh>
        {/* Ears */}
        <mesh position={[0.15, 0.3, -0.1]}>
             <coneGeometry args={[0.1, 0.3]} />
             <meshStandardMaterial color="#d35400" />
        </mesh>
         <mesh position={[-0.15, 0.3, -0.1]}>
             <coneGeometry args={[0.1, 0.3]} />
             <meshStandardMaterial color="#d35400" />
        </mesh>
      </group>

      {/* Tail */}
       <mesh position={[0, 0.5, -0.6]} rotation={[-0.5, 0, 0]}>
         <capsuleGeometry args={[0.15, 0.8]} />
         <meshStandardMaterial color="#d35400" />
      </mesh>
    </group>
  )
}
