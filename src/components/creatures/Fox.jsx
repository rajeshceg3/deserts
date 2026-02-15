import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FurMaterial } from '../../utils/proceduralMaterials'

const Leg = ({ position, offset, index }) => {
    const ref = useRef()
    useFrame((state) => {
        if (ref.current) {
            const t = state.clock.elapsedTime + offset
            // Simple trot
            const speed = 8
            const angle = Math.sin(t * speed + index) * 0.5
            ref.current.rotation.x = angle
        }
    })
    return (
        <group position={position} ref={ref}>
            <mesh position={[0, -0.3, 0]} castShadow receiveShadow>
                <capsuleGeometry args={[0.05, 0.4, 4, 8]} />
                <FurMaterial color="#d35400" />
            </mesh>
            {/* Paw */}
            <mesh position={[0, -0.55, 0.05]} castShadow receiveShadow>
                 <sphereGeometry args={[0.06, 8, 8]} />
                 <meshStandardMaterial color="#3e2723" roughness={0.9} />
            </mesh>
        </group>
    )
}

export const Fox = (props) => {
  const group = useRef()
  const headRef = useRef()
  const tailRef = useRef()
  const offset = React.useMemo(() => Math.random() * 100, [])

  useFrame((state) => {
    if(group.current) {
        const t = state.clock.elapsedTime + offset

        // Bobbing
        group.current.position.y = props.position[1] + Math.abs(Math.sin(t * 8)) * 0.05

        // Head Animation
        if(headRef.current) {
             headRef.current.rotation.y = Math.sin(t * 0.5) * 0.3
             headRef.current.rotation.z = Math.sin(t * 1.5) * 0.1 // Tilt
        }

        // Tail Animation
        if(tailRef.current) {
            tailRef.current.rotation.y = Math.sin(t * 4) * 0.4
            tailRef.current.rotation.z = Math.cos(t * 2) * 0.1
        }
    }
  })

  return (
    <group ref={group} {...props}>
      {/* Body - Horizontal Capsule */}
      <mesh position={[0, 0.4, 0]} rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow>
         <capsuleGeometry args={[0.18, 0.7, 8, 16]} />
         <FurMaterial color="#d35400" />
      </mesh>

      {/* Head Group */}
      <group position={[0, 0.6, 0.45]} ref={headRef}>
        <mesh castShadow receiveShadow>
             <sphereGeometry args={[0.18, 16, 16]} />
             <FurMaterial color="#d35400" />
        </mesh>
        {/* Snout */}
        <mesh position={[0, -0.05, 0.2]} rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow>
             <coneGeometry args={[0.08, 0.25, 16]} />
             <meshStandardMaterial color="#d35400" />
        </mesh>
        <mesh position={[0, -0.05, 0.32]} castShadow receiveShadow>
             <sphereGeometry args={[0.03, 8, 8]} />
             <meshStandardMaterial color="#111" />
        </mesh>

        {/* Ears */}
        <mesh position={[0.12, 0.18, 0]} rotation={[0, 0, -0.2]} castShadow receiveShadow>
             <coneGeometry args={[0.06, 0.2, 16]} />
             <meshStandardMaterial color="#d35400" />
        </mesh>
         <mesh position={[-0.12, 0.18, 0]} rotation={[0, 0, 0.2]} castShadow receiveShadow>
             <coneGeometry args={[0.06, 0.2, 16]} />
             <meshStandardMaterial color="#d35400" />
        </mesh>
      </group>

      {/* Tail */}
      <group position={[0, 0.45, -0.4]} ref={tailRef} rotation={[-0.5, 0, 0]}>
           <mesh position={[0, 0, -0.2]} rotation={[1.5, 0, 0]} castShadow receiveShadow>
             <capsuleGeometry args={[0.12, 0.6, 8, 16]} />
             <FurMaterial color="#e67e22" />
          </mesh>
          {/* White tip */}
           <mesh position={[0, 0.35, -0.2]} castShadow receiveShadow>
               <sphereGeometry args={[0.1, 8, 8]} />
               <FurMaterial color="#ecf0f1" />
          </mesh>
      </group>

      {/* Legs */}
      <Leg position={[-0.15, 0.4, 0.3]} offset={offset} index={0} />
      <Leg position={[0.15, 0.4, 0.3]} offset={offset} index={Math.PI} />
      <Leg position={[-0.15, 0.4, -0.3]} offset={offset} index={Math.PI} />
      <Leg position={[0.15, 0.4, -0.3]} offset={offset} index={0} />

    </group>
  )
}
