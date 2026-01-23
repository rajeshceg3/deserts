import React from 'react'
import { Sparkles } from '@react-three/drei'

export const Particles = () => {
  return (
    <>
      <Sparkles
        count={200}
        scale={30}
        size={3}
        speed={0.2}
        opacity={0.5}
        color="#ffffff"
        position={[0, 5, 0]}
      />
      <Sparkles
        count={100}
        scale={20}
        size={5}
        speed={0.5}
        opacity={0.3}
        color="#ffccaa"
        position={[0, 5, 0]}
        noise={0.5}
      />
    </>
  )
}
