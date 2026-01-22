import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'

export const Camel = (props) => {
  const group = useRef()

  useFrame((state, delta) => {
    // Simple bobbing animation
    if(group.current) {
        group.current.position.y = props.position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1
        group.current.rotation.y += delta * 0.1
    }
  })

  return (
    <group ref={group} {...props}>
      {/* Body */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[1.5, 1, 3]} />
        <meshStandardMaterial color="#C19A6B" />
      </mesh>
      {/* Hump */}
      <mesh position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial color="#C19A6B" />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 2, 1.5]} rotation={[0.5, 0, 0]}>
        <boxGeometry args={[0.4, 1.5, 0.4]} />
        <meshStandardMaterial color="#C19A6B" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 2.8, 1.8]}>
        <boxGeometry args={[0.5, 0.5, 0.8]} />
        <meshStandardMaterial color="#C19A6B" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.5, 0.5, 1.2]}>
        <cylinderGeometry args={[0.15, 0.15, 2]} />
        <meshStandardMaterial color="#C19A6B" />
      </mesh>
      <mesh position={[0.5, 0.5, 1.2]}>
        <cylinderGeometry args={[0.15, 0.15, 2]} />
        <meshStandardMaterial color="#C19A6B" />
      </mesh>
      <mesh position={[-0.5, 0.5, -1.2]}>
        <cylinderGeometry args={[0.15, 0.15, 2]} />
        <meshStandardMaterial color="#C19A6B" />
      </mesh>
      <mesh position={[0.5, 0.5, -1.2]}>
        <cylinderGeometry args={[0.15, 0.15, 2]} />
        <meshStandardMaterial color="#C19A6B" />
      </mesh>
    </group>
  )
}
