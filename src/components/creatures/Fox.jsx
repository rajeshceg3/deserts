import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FurMaterial } from '../../utils/proceduralMaterials'

const Leg = ({ position, offset, index }) => {
    const ref = useRef()
    const shinRef = useRef()

    useFrame((state) => {
        if (!ref.current) return
        const t = state.clock.elapsedTime * 6.0 + offset

        // Trot gait: Diagonal pairs move together
        // 0: FL, 1: FR, 2: BL, 3: BR
        // FL(0) & BR(3) -> Phase 0
        // FR(1) & BL(2) -> Phase PI
        const phase = ((index === 0 || index === 3) ? 0 : Math.PI)

        const cycle = t + phase

        const angle = Math.sin(cycle) * 0.4
        ref.current.rotation.x = angle

        // Knee/Hock
        // Bends when lifted
        const lift = Math.max(0, Math.sin(cycle))
        if(shinRef.current) shinRef.current.rotation.x = -lift * 0.8 + 0.2
    })

    return (
        <group position={position} ref={ref}>
            {/* Thigh */}
            <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
                <capsuleGeometry args={[0.06, 0.4, 4, 8]} />
                <FurMaterial color="#d35400" />
            </mesh>
            {/* Lower Leg */}
            <group position={[0, -0.35, 0]} ref={shinRef}>
                <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
                     <capsuleGeometry args={[0.05, 0.4, 4, 8]} />
                     <FurMaterial color="#d35400" />
                </mesh>
                {/* Paw */}
                <mesh position={[0, -0.4, 0.05]} castShadow receiveShadow>
                     <boxGeometry args={[0.08, 0.05, 0.1]} />
                     <meshStandardMaterial color="#111" roughness={0.9} />
                </mesh>
            </group>
        </group>
    )
}

export const Fox = (props) => {
  const group = useRef()
  const headRef = useRef()
  const tailRef = useRef()
  const [offset] = React.useState(() => Math.random() * 100)

  useFrame((state) => {
    if(group.current) {
        const t = state.clock.elapsedTime + offset

        // Running bounce
        group.current.position.y = props.position[1] + Math.abs(Math.sin(t * 6)) * 0.08

        // Head Animation
        if(headRef.current) {
             headRef.current.rotation.y = Math.sin(t * 0.5) * 0.3
             headRef.current.rotation.z = Math.sin(t * 1.5) * 0.1
        }

        // Tail Animation
        if(tailRef.current) {
            tailRef.current.rotation.y = Math.sin(t * 4) * 0.4
            tailRef.current.rotation.x = -0.5 + Math.cos(t * 2) * 0.1
        }
    }
  })

  return (
    <group ref={group} {...props}>
      {/* Body - Main */}
      <mesh position={[0, 0.45, 0]} rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow>
         <capsuleGeometry args={[0.18, 0.7, 8, 16]} />
         <FurMaterial color="#d35400" />
      </mesh>

      {/* Chest fluff */}
      <mesh position={[0, 0.4, 0.25]} rotation={[0.5, 0, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.19, 12, 12]} />
          <FurMaterial color="#e67e22" />
      </mesh>

      {/* Head Group */}
      <group position={[0, 0.7, 0.5]} ref={headRef}>
        {/* Neck connection */}
        <mesh position={[0, -0.15, -0.1]} rotation={[0.4, 0, 0]}>
            <capsuleGeometry args={[0.14, 0.4, 4, 8]} />
            <FurMaterial color="#d35400" />
        </mesh>

        {/* Head */}
        <mesh castShadow receiveShadow>
             <sphereGeometry args={[0.16, 16, 16]} />
             <FurMaterial color="#d35400" />
        </mesh>

        {/* Snout */}
        <mesh position={[0, -0.05, 0.2]} rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow>
             <coneGeometry args={[0.07, 0.35, 16]} />
             <meshStandardMaterial color="#d35400" />
        </mesh>
        <mesh position={[0, -0.05, 0.38]} castShadow receiveShadow>
             <sphereGeometry args={[0.025, 8, 8]} />
             <meshStandardMaterial color="#111" />
        </mesh>

        {/* Ears */}
        <mesh position={[0.1, 0.18, 0]} rotation={[0, 0, -0.2]} castShadow receiveShadow>
             <coneGeometry args={[0.06, 0.25, 16]} />
             <meshStandardMaterial color="#3e2723" />
        </mesh>
         <mesh position={[-0.1, 0.18, 0]} rotation={[0, 0, 0.2]} castShadow receiveShadow>
             <coneGeometry args={[0.06, 0.25, 16]} />
             <meshStandardMaterial color="#3e2723" />
        </mesh>
      </group>

      {/* Tail - Big and Fluffy */}
      <group position={[0, 0.5, -0.35]} ref={tailRef}>
           <mesh position={[0, 0.1, -0.3]} rotation={[1.2, 0, 0]} castShadow receiveShadow>
             <capsuleGeometry args={[0.15, 0.8, 8, 16]} />
             <FurMaterial color="#e67e22" />
          </mesh>
          {/* Tip */}
           <mesh position={[0, 0.35, -0.4]} castShadow receiveShadow>
               <sphereGeometry args={[0.12, 12, 12]} />
               <FurMaterial color="#ecf0f1" />
          </mesh>
      </group>

      {/* Legs */}
      <Leg position={[-0.15, 0.45, 0.25]} offset={offset} index={0} />
      <Leg position={[0.15, 0.45, 0.25]} offset={offset} index={1} />
      <Leg position={[-0.15, 0.45, -0.25]} offset={offset} index={2} />
      <Leg position={[0.15, 0.45, -0.25]} offset={offset} index={3} />

    </group>
  )
}
