import {useStore} from '../../store'
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { furOnBeforeCompile } from '../../utils/proceduralMaterials'

const Leg = ({ position, offset, index }) => {
    const ref = useRef()
    const shinRef = useRef()

    useFrame((state) => {

        if (!ref.current) return
        const t = (useStore.getState().motion?state.clock.elapsedTime:0) * 6.0 + offset

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
                <capsuleGeometry args={[0.06, 0.4, 4, 4]} />
                <meshStandardMaterial color="#d35400" onBeforeCompile={furOnBeforeCompile} />
            </mesh>
            {/* Lower Leg */}
            <group position={[0, -0.35, 0]} ref={shinRef}>
                <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
                     <capsuleGeometry args={[0.05, 0.4, 4, 4]} />
                     <meshStandardMaterial color="#6e3410" onBeforeCompile={furOnBeforeCompile} />
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
        const t = (useStore.getState().motion?state.clock.elapsedTime:0) + offset

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
         <capsuleGeometry args={[0.18, 0.7, 8, 8]} />
         <meshStandardMaterial color="#d35400" onBeforeCompile={furOnBeforeCompile} />
      </mesh>

      {/* Chest fluff + pale underbelly */}
      <mesh position={[0, 0.4, 0.25]} rotation={[0.5, 0, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.19, 8, 8]} />
          <meshStandardMaterial color="#f3e4cf" onBeforeCompile={furOnBeforeCompile} />
      </mesh>
      <mesh position={[0, 0.33, -0.05]} rotation={[Math.PI/2, 0, 0]} castShadow={false} receiveShadow>
          <capsuleGeometry args={[0.13, 0.55, 4, 8]} />
          <meshStandardMaterial color="#f3e4cf" onBeforeCompile={furOnBeforeCompile} />
      </mesh>

      {/* Head Group */}
      <group position={[0, 0.7, 0.5]} ref={headRef}>
        {/* Neck connection */}
        <mesh position={[0, -0.15, -0.1]} rotation={[0.4, 0, 0]}>
            <capsuleGeometry args={[0.14, 0.4, 4, 4]} />
            <meshStandardMaterial color="#d35400" onBeforeCompile={furOnBeforeCompile} />
        </mesh>

        {/* Head */}
        <mesh castShadow receiveShadow>
             <sphereGeometry args={[0.16, 8, 8]} />
             <meshStandardMaterial color="#d35400" onBeforeCompile={furOnBeforeCompile} />
        </mesh>
        {/* White cheeks */}
        <mesh position={[0.09, -0.04, 0.1]} castShadow={false} receiveShadow={false}>
             <sphereGeometry args={[0.08, 6, 5]} />
             <meshStandardMaterial color="#f3e4cf" onBeforeCompile={furOnBeforeCompile} />
        </mesh>
        <mesh position={[-0.09, -0.04, 0.1]} castShadow={false} receiveShadow={false}>
             <sphereGeometry args={[0.08, 6, 5]} />
             <meshStandardMaterial color="#f3e4cf" onBeforeCompile={furOnBeforeCompile} />
        </mesh>

        {/* Snout - slimmer, white-cream lower jaw */}
        <mesh position={[0, -0.05, 0.2]} rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow>
             <coneGeometry args={[0.06, 0.38, 8]} />
             <meshStandardMaterial color="#d35400" />
        </mesh>
        <mesh position={[0, -0.075, 0.22]} rotation={[Math.PI/2, 0, 0]} castShadow={false} receiveShadow={false}>
             <coneGeometry args={[0.045, 0.3, 6]} />
             <meshStandardMaterial color="#f3e4cf" />
        </mesh>
        <mesh position={[0, -0.05, 0.4]} castShadow receiveShadow>
             <sphereGeometry args={[0.028, 5, 4]} />
             <meshStandardMaterial color="#111" />
        </mesh>

        {/* Eyes - dark amber with a bright catchlight */}
        <mesh position={[0.085, 0.045, 0.12]} castShadow={false} receiveShadow={false}>
             <sphereGeometry args={[0.032, 8, 6]} />
             <meshStandardMaterial color="#241505" roughness={0.1} />
        </mesh>
        <mesh position={[-0.085, 0.045, 0.12]} castShadow={false} receiveShadow={false}>
             <sphereGeometry args={[0.032, 8, 6]} />
             <meshStandardMaterial color="#241505" roughness={0.1} />
        </mesh>
        <mesh position={[0.093, 0.058, 0.145]} castShadow={false} receiveShadow={false}>
             <sphereGeometry args={[0.009, 4, 4]} />
             <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[-0.077, 0.058, 0.145]} castShadow={false} receiveShadow={false}>
             <sphereGeometry args={[0.009, 4, 4]} />
             <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.6} />
        </mesh>

        {/* Ears - taller triangles, pale inner ear */}
        <mesh position={[0.1, 0.2, 0]} rotation={[0, 0, -0.18]} castShadow receiveShadow>
             <coneGeometry args={[0.07, 0.3, 6]} />
             <meshStandardMaterial color="#3e2723" />
        </mesh>
         <mesh position={[-0.1, 0.2, 0]} rotation={[0, 0, 0.18]} castShadow receiveShadow>
             <coneGeometry args={[0.07, 0.3, 6]} />
             <meshStandardMaterial color="#3e2723" />
        </mesh>
        <mesh position={[0.095, 0.19, 0.03]} rotation={[0.15, 0, -0.18]} castShadow={false} receiveShadow={false}>
             <coneGeometry args={[0.04, 0.2, 5]} />
             <meshStandardMaterial color="#f3e4cf" />
        </mesh>
        <mesh position={[-0.095, 0.19, 0.03]} rotation={[0.15, 0, 0.18]} castShadow={false} receiveShadow={false}>
             <coneGeometry args={[0.04, 0.2, 5]} />
             <meshStandardMaterial color="#f3e4cf" />
        </mesh>
      </group>

      {/* Tail - Big and Fluffy, two overlapping volumes for a fuller brush */}
      <group position={[0, 0.5, -0.35]} ref={tailRef}>
           <mesh position={[0, 0.1, -0.3]} rotation={[1.2, 0, 0]} castShadow receiveShadow>
             <capsuleGeometry args={[0.15, 0.8, 8, 8]} />
             <meshStandardMaterial color="#e67e22" onBeforeCompile={furOnBeforeCompile} />
          </mesh>
           <mesh position={[0, 0.22, -0.34]} rotation={[1.1, 0, 0]} castShadow={false} receiveShadow>
             <capsuleGeometry args={[0.19, 0.55, 6, 8]} />
             <meshStandardMaterial color="#e67e22" onBeforeCompile={furOnBeforeCompile} />
          </mesh>
          {/* Tip */}
           <mesh position={[0, 0.35, -0.4]} castShadow receiveShadow>
               <sphereGeometry args={[0.12, 8, 8]} />
               <meshStandardMaterial color="#ecf0f1" onBeforeCompile={furOnBeforeCompile} />
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
