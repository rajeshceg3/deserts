import {useStore} from '../../store'
import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { furOnBeforeCompile } from '../../utils/proceduralMaterials'
import { noise2D } from '../../utils/noise'

const Leg = ({ position, index, offset }) => {
    const group = useRef()
    const thighRef = useRef()
    const shinRef = useRef()

    useFrame((state) => {

        if (!group.current) return;
        const t = (useStore.getState().motion?state.clock.elapsedTime:0) * 4.0 + offset

        // Pacing gait: both legs on one side move together (FL+BL, then FR+BR)
        let phase = 0;
        if (index === 0) phase = 0;          // FL
        if (index === 2) phase = 0.35;       // BL slightly trails
        if (index === 1) phase = Math.PI;    // FR
        if (index === 3) phase = Math.PI + 0.35; // BR

        const cycle = t + phase

        // Lift (vertical sine, clipped)
        const lift = Math.max(0, Math.sin(cycle))
        group.current.position.y = position[1] + lift * 0.15

        // Swing (horizontal cosine)
        const swing = Math.cos(cycle) * 0.4
        if (thighRef.current) thighRef.current.rotation.x = swing

        // Knee bending (lower leg lags the thigh)
        const bend = Math.max(0, Math.sin(cycle)) * 0.8
        if (shinRef.current) {
            shinRef.current.rotation.x = -bend * 0.5 + 0.15 // Slight natural bend
        }
    })

    return (
        <group position={[position[0], 0, position[2]]} ref={group}>

            {/* Thigh / Upper Leg - long, slimming toward the knee */}
            <group position={[0, 0, 0]} ref={thighRef}>
                 <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
                    <capsuleGeometry args={[0.15, 1.0, 4, 6]} />
                    <meshStandardMaterial color="#C19A6B" onBeforeCompile={furOnBeforeCompile} />
                 </mesh>

                 {/* Knee pad (camels kneel on calloused pads) */}
                 <mesh position={[0, -1.05, 0.03]} castShadow={false} receiveShadow={false}>
                    <sphereGeometry args={[0.14, 6, 5]} />
                    <meshStandardMaterial color="#8a6a42" onBeforeCompile={furOnBeforeCompile} />
                 </mesh>

                 {/* Shin / Lower Leg */}
                 <group position={[0, -1.05, 0]} ref={shinRef}>
                     <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
                        <capsuleGeometry args={[0.11, 1.0, 4, 6]} />
                        <meshStandardMaterial color="#C19A6B" onBeforeCompile={furOnBeforeCompile} />
                     </mesh>
                     {/* Broad two-lobed pad foot, not a hoof */}
                     <mesh position={[0, -1.02, 0.08]} scale={[1, 0.45, 1.5]} castShadow={false} receiveShadow={false}>
                        <sphereGeometry args={[0.16, 8, 6]} />
                        <meshStandardMaterial color="#8a6a42" roughness={0.95} />
                     </mesh>
                 </group>
            </group>
        </group>
    )
}

export const Camel = (props) => {
  const group = useRef()
  const headGroup = useRef()
  const tailRef = useRef()

  const [offset] = React.useState(() => Math.random() * 100)

  // Procedural Neck Curve - rises steeply like a dromedary
  const neckCurve = useMemo(() => {
      return new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, -0.15, 0.55),
          new THREE.Vector3(0, 0.55, 1.05),
          new THREE.Vector3(0, 1.45, 1.25)
      ])
  }, [])

  useFrame((state) => {

      if (group.current) {
          const t = (useStore.getState().motion?state.clock.elapsedTime:0) + offset

          // Body bob - slow, heavy
          group.current.position.y = props.position[1] + Math.sin(t * 8) * 0.03
          group.current.rotation.z = Math.sin(t * 4) * 0.02

          // Head Bob & Look
          if (headGroup.current) {
              const lookX = noise2D(t * 0.2, 0) * 0.5
              const lookY = noise2D(0, t * 0.3) * 0.3

              headGroup.current.rotation.y = THREE.MathUtils.lerp(headGroup.current.rotation.y, lookX, 0.05)
              headGroup.current.rotation.x = THREE.MathUtils.lerp(headGroup.current.rotation.x, lookY, 0.05)
          }

          // Tail sway
          if (tailRef.current) {
              tailRef.current.rotation.x = Math.sin(t * 3) * 0.15
          }
      }
  })

  return (
    <group ref={group} {...props}>
      {/* Main Body Composite */}
      <group position={[0, 2.1, 0]}>
          {/* Ribcage - deep, slightly flattened from the sides */}
          <mesh position={[0, 0, 0.45]} rotation={[0.08, 0, 0]} scale={[0.82, 1, 1.1]} castShadow receiveShadow>
             <sphereGeometry args={[0.78, 10, 10]} />
             <meshStandardMaterial color="#C19A6B" onBeforeCompile={furOnBeforeCompile} />
          </mesh>
          {/* Rear - rounder, a touch lower */}
          <mesh position={[0, -0.02, -0.75]} rotation={[-0.08, 0, 0]} scale={[0.85, 0.95, 1]} castShadow receiveShadow>
             <sphereGeometry args={[0.7, 10, 10]} />
             <meshStandardMaterial color="#C19A6B" onBeforeCompile={furOnBeforeCompile} />
          </mesh>
          {/* Midsection connection */}
          <mesh position={[0, -0.05, -0.1]} rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow>
              <capsuleGeometry args={[0.66, 1.1, 4, 10]} />
              <meshStandardMaterial color="#C19A6B" onBeforeCompile={furOnBeforeCompile} />
          </mesh>
          {/* Lighter belly */}
          <mesh position={[0, -0.55, -0.1]} rotation={[Math.PI/2, 0, 0]} castShadow={false} receiveShadow>
              <capsuleGeometry args={[0.5, 1.0, 4, 8]} />
              <meshStandardMaterial color="#d6b68c" onBeforeCompile={furOnBeforeCompile} />
          </mesh>

          {/* Single dromedary hump - elongated teardrop over the shoulders, slight forward lean */}
          <mesh position={[0, 0.78, 0.05]} rotation={[0.15, 0, 0]} scale={[0.62, 1.05, 1.35]} castShadow receiveShadow>
             <sphereGeometry args={[0.62, 10, 10]} />
             <meshStandardMaterial color="#b8956a" onBeforeCompile={furOnBeforeCompile} />
          </mesh>
          {/* Chest pad between the front legs */}
          <mesh position={[0, -0.75, 0.55]} castShadow={false} receiveShadow>
             <sphereGeometry args={[0.22, 8, 6]} />
             <meshStandardMaterial color="#8a6a42" onBeforeCompile={furOnBeforeCompile} />
          </mesh>
      </group>

      {/* Tail - thin rope with a dark tuft */}
      <group position={[0, 2.15, -1.35]} ref={tailRef}>
          <mesh position={[0, -0.45, 0]} castShadow={false} receiveShadow>
             <capsuleGeometry args={[0.05, 0.75, 4, 4]} />
             <meshStandardMaterial color="#C19A6B" onBeforeCompile={furOnBeforeCompile} />
          </mesh>
          <mesh position={[0, -0.9, 0]} castShadow={false} receiveShadow>
             <sphereGeometry args={[0.09, 6, 5]} />
             <meshStandardMaterial color="#6b4e2e" onBeforeCompile={furOnBeforeCompile} />
          </mesh>
      </group>

      {/* Neck - longer and slimmer */}
      <group position={[0, 2.05, 0.85]}>
         <mesh castShadow receiveShadow>
            <tubeGeometry args={[neckCurve, 12, 0.24, 8, false]} />
            <meshStandardMaterial color="#C19A6B" onBeforeCompile={furOnBeforeCompile} />
         </mesh>
         {/* Short darker mane along the top of the neck */}
         <mesh position={[0, 0.72, 0.62]} rotation={[0.75, 0, 0]} castShadow={false} receiveShadow>
            <boxGeometry args={[0.08, 1.5, 0.3]} />
            <meshStandardMaterial color="#a98a5f" onBeforeCompile={furOnBeforeCompile} />
         </mesh>

         {/* Head */}
         <group position={[0, 1.45, 1.25]} ref={headGroup}>
             {/* Skull Base */}
             <mesh rotation={[0.35, 0, 0]} castShadow receiveShadow>
                <sphereGeometry args={[0.27, 8, 8]} />
                <meshStandardMaterial color="#C19A6B" onBeforeCompile={furOnBeforeCompile} />
             </mesh>
             {/* Long tapering snout */}
             <mesh position={[0, -0.12, 0.4]} rotation={[Math.PI/2 + 0.15, 0, 0]} castShadow receiveShadow>
                 <capsuleGeometry args={[0.15, 0.55, 4, 6]} />
                 <meshStandardMaterial color="#b08a58" onBeforeCompile={furOnBeforeCompile} />
             </mesh>
             {/* Muzzle tip with nostrils */}
             <mesh position={[0, -0.18, 0.72]} castShadow={false} receiveShadow={false}>
                 <sphereGeometry args={[0.13, 8, 6]} />
                 <meshStandardMaterial color="#8a6a42" onBeforeCompile={furOnBeforeCompile} />
             </mesh>
             <mesh position={[0.055, -0.13, 0.78]} castShadow={false} receiveShadow={false}>
                 <sphereGeometry args={[0.03, 4, 4]} />
                 <meshStandardMaterial color="#2b1c10" roughness={0.6} />
             </mesh>
             <mesh position={[-0.055, -0.13, 0.78]} castShadow={false} receiveShadow={false}>
                 <sphereGeometry args={[0.03, 4, 4]} />
                 <meshStandardMaterial color="#2b1c10" roughness={0.6} />
             </mesh>

             {/* Jaw */}
             <mesh position={[0, -0.2, 0.12]} castShadow receiveShadow>
                 <sphereGeometry args={[0.2, 6, 6]} />
                 <meshStandardMaterial color="#C19A6B" onBeforeCompile={furOnBeforeCompile} />
             </mesh>

             {/* Small rounded ears */}
             <mesh position={[0.19, 0.22, -0.08]} rotation={[0, 0, -0.35]} castShadow={false} receiveShadow={false}>
                 <sphereGeometry args={[0.07, 6, 5]} />
                 <meshStandardMaterial color="#C19A6B" onBeforeCompile={furOnBeforeCompile} />
             </mesh>
             <mesh position={[-0.19, 0.22, -0.08]} rotation={[0, 0, 0.35]} castShadow={false} receiveShadow={false}>
                 <sphereGeometry args={[0.07, 6, 5]} />
                 <meshStandardMaterial color="#C19A6B" onBeforeCompile={furOnBeforeCompile} />
             </mesh>

              {/* Big dark eyes under heavy lids, pale highlight */}
              <mesh position={[0.2, 0.06, 0.16]} castShadow={false} receiveShadow={false}>
                  <sphereGeometry args={[0.05, 8, 6]} />
                  <meshStandardMaterial color="#1a120a" roughness={0.15} />
              </mesh>
              <mesh position={[-0.2, 0.06, 0.16]} castShadow={false} receiveShadow={false}>
                  <sphereGeometry args={[0.05, 8, 6]} />
                  <meshStandardMaterial color="#1a120a" roughness={0.15} />
              </mesh>
              <mesh position={[0.2, 0.115, 0.16]} rotation={[0, 0, -0.15]} castShadow={false} receiveShadow={false}>
                  <boxGeometry args={[0.13, 0.035, 0.09]} />
                  <meshStandardMaterial color="#b8956a" onBeforeCompile={furOnBeforeCompile} />
              </mesh>
              <mesh position={[-0.2, 0.115, 0.16]} rotation={[0, 0, 0.15]} castShadow={false} receiveShadow={false}>
                  <boxGeometry args={[0.13, 0.035, 0.09]} />
                  <meshStandardMaterial color="#b8956a" onBeforeCompile={furOnBeforeCompile} />
              </mesh>
         </group>
      </group>

      {/* Legs */}
      <Leg index={0} offset={offset} position={[-0.42, 2.0, 0.75]} />
      <Leg index={1} offset={offset} position={[0.42, 2.0, 0.75]} />
      <Leg index={2} offset={offset} position={[-0.42, 2.05, -0.75]} />
      <Leg index={3} offset={offset} position={[0.42, 2.05, -0.75]} />
    </group>
  )
}
