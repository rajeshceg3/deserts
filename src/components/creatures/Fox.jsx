import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { FurMaterial } from '../../utils/proceduralMaterials'
import * as THREE from 'three'

export const Fox = (props) => {
  const group = useRef()
  const headRef = useRef()
  const tailRef = useRef()
  const earsRef = useRef()

  // Random offset for this instance
  const offset = useMemo(() => Math.random() * 100, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime + offset

    // Breathing (scale Y)
    if (group.current) {
        group.current.scale.y = 1 + Math.sin(t * 2) * 0.02
    }

    // Head movement (smooth look around)
    if (headRef.current) {
        // Perlin-like motion using multiple sines
        const lookY = Math.sin(t * 0.5) * 0.3 + Math.sin(t * 1.5) * 0.1
        const lookX = Math.sin(t * 0.3) * 0.1

        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, lookY, 0.05)
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, lookX, 0.05)
    }

    // Tail sway
    if (tailRef.current) {
        tailRef.current.rotation.y = Math.sin(t * 3) * 0.2
        tailRef.current.rotation.z = Math.sin(t * 5) * 0.05
    }

    // Ear twitch
    if (earsRef.current) {
        // Random twitch
        if (Math.random() > 0.98) {
            earsRef.current.rotation.z = (Math.random() - 0.5) * 0.2
        } else {
             earsRef.current.rotation.z = THREE.MathUtils.lerp(earsRef.current.rotation.z, 0, 0.1)
        }
    }
  })

  const foxColor = "#d35400"
  const darkColor = "#a04000"

  return (
    <group ref={group} {...props}>
      {/* Body: Capsule horizontal */}
      <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
         <capsuleGeometry args={[0.25, 0.9, 4, 8]} />
         <FurMaterial color={foxColor} />
      </mesh>

      {/* Head Group */}
      <group position={[0, 0.65, 0.5]} ref={headRef}>
        {/* Skull */}
        <mesh castShadow receiveShadow>
             <sphereGeometry args={[0.22, 16, 16]} />
             <FurMaterial color={foxColor} />
        </mesh>

        {/* Snout */}
        <mesh position={[0, -0.05, 0.25]} rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow>
             <capsuleGeometry args={[0.12, 0.4, 4, 8]} />
             <FurMaterial color={foxColor} />
        </mesh>

        {/* Nose Tip */}
        <mesh position={[0, -0.05, 0.45]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#111" roughness={0.4} />
        </mesh>

        {/* Ears Group */}
        <group ref={earsRef} position={[0, 0.15, 0]}>
             {/* Left Ear */}
             <mesh position={[0.15, 0.15, -0.05]} rotation={[0, 0, -0.2]} castShadow receiveShadow>
                 <coneGeometry args={[0.08, 0.25, 8]} />
                 <FurMaterial color={darkColor} />
             </mesh>
             {/* Right Ear */}
             <mesh position={[-0.15, 0.15, -0.05]} rotation={[0, 0, 0.2]} castShadow receiveShadow>
                 <coneGeometry args={[0.08, 0.25, 8]} />
                 <FurMaterial color={darkColor} />
             </mesh>
        </group>

        {/* Eyes */}
        <mesh position={[0.1, 0.05, 0.15]}>
             <sphereGeometry args={[0.04, 8, 8]} />
             <meshStandardMaterial color="#111" roughness={0.1} />
        </mesh>
        <mesh position={[-0.1, 0.05, 0.15]}>
             <sphereGeometry args={[0.04, 8, 8]} />
             <meshStandardMaterial color="#111" roughness={0.1} />
        </mesh>
      </group>

      {/* Tail */}
      <group position={[0, 0.45, -0.4]} ref={tailRef} rotation={[-0.5, 0, 0]}>
           <mesh position={[0, 0, -0.4]} rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow>
             <capsuleGeometry args={[0.15, 0.8, 4, 8]} />
             <FurMaterial color={foxColor} />
           </mesh>
           {/* White Tip */}
           <mesh position={[0, 0, -0.85]} rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow>
             <sphereGeometry args={[0.14, 8, 8]} />
             <FurMaterial color="#eee" />
           </mesh>
      </group>

      {/* Legs (Static Pose for now, maybe slight idle shuffle?) */}
      {/* Front Left */}
      <mesh position={[0.2, 0.2, 0.3]} rotation={[0.2, 0, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.08, 0.5, 4, 8]} />
          <FurMaterial color={darkColor} />
      </mesh>
      {/* Front Right */}
      <mesh position={[-0.2, 0.2, 0.3]} rotation={[0.2, 0, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.08, 0.5, 4, 8]} />
          <FurMaterial color={darkColor} />
      </mesh>
      {/* Back Left */}
      <mesh position={[0.2, 0.2, -0.3]} rotation={[-0.2, 0, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.09, 0.5, 4, 8]} />
          <FurMaterial color={darkColor} />
      </mesh>
      {/* Back Right */}
      <mesh position={[-0.2, 0.2, -0.3]} rotation={[-0.2, 0, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.09, 0.5, 4, 8]} />
          <FurMaterial color={darkColor} />
      </mesh>

    </group>
  )
}
