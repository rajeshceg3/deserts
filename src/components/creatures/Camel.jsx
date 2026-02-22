import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FurMaterial } from '../../utils/proceduralMaterials'
import { noise2D } from '../../utils/noise'

const Leg = ({ position, side, index, offset }) => {
    const group = useRef()
    const thighRef = useRef()
    const shinRef = useRef()

    useFrame((state) => {
        if (!group.current) return;
        const t = state.clock.elapsedTime * 4.0 + offset

        // Quadruped Walk Cycle: FL, BR, FR, BL
        // 0: FL, 1: FR, 2: BL, 3: BR
        // Phase offsets
        let phase = 0;
        if (index === 0) phase = 0;         // FL
        if (index === 3) phase = Math.PI/2; // BR
        if (index === 1) phase = Math.PI;   // FR
        if (index === 2) phase = Math.PI*1.5;// BL

        const cycle = t + phase

        // Lift (vertical sine, clipped)
        const lift = Math.max(0, Math.sin(cycle))
        group.current.position.y = position[1] + lift * 0.15

        // Swing (horizontal cosine)
        const swing = Math.cos(cycle) * 0.4
        if (thighRef.current) thighRef.current.rotation.x = swing

        // Knee bending (Inverse Kinematics approximation)
        // Leg straightens when planted (swing ~= 0), bends when lifted
        const bend = Math.max(0, Math.sin(cycle)) * 0.8

        // Front legs (index 0, 1) bend differently than back legs (2, 3) generally
        // But for camel, front knees bend BACK, back knees (stifle) bend FRONT?
        // Actually, let's keep it simple: lower leg always lags behind thigh slightly
        if (shinRef.current) {
            shinRef.current.rotation.x = -bend * 0.5 + 0.2 // Slight natural bend
        }
    })

    return (
        <group position={[position[0], 0, position[2]]} ref={group}>
             {/* Position Y is handled by animation to lift foot */}

            {/* Thigh / Upper Leg */}
            <group position={[0, 0, 0]} ref={thighRef}>
                 <mesh position={[0, -0.4, 0]} castShadow receiveShadow>
                    <capsuleGeometry args={[0.16, 0.8, 4, 8]} />
                    <FurMaterial color="#C19A6B" />
                 </mesh>

                 {/* Knee Joint */}
                 <mesh position={[0, -0.85, 0]} castShadow receiveShadow>
                    <sphereGeometry args={[0.15, 8, 8]} />
                    <FurMaterial color="#a08050" />
                 </mesh>

                 {/* Shin / Lower Leg */}
                 <group position={[0, -0.85, 0]} ref={shinRef}>
                     <mesh position={[0, -0.4, 0]} castShadow receiveShadow>
                        <capsuleGeometry args={[0.13, 0.8, 4, 8]} />
                        <FurMaterial color="#C19A6B" />
                     </mesh>
                     {/* Hoof */}
                     <mesh position={[0, -0.85, 0.05]} castShadow receiveShadow>
                        <cylinderGeometry args={[0.12, 0.15, 0.2, 8]} />
                        <meshStandardMaterial color="#3E2723" roughness={0.9} />
                     </mesh>
                 </group>
            </group>
        </group>
    )
}

export const Camel = (props) => {
  const group = useRef()
  const headGroup = useRef()

  const [offset] = React.useState(() => Math.random() * 100)

  // Procedural Neck Curve
  const neckCurve = useMemo(() => {
      // S-curve for camel neck
      return new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, -0.3, 0.4),
          new THREE.Vector3(0, 0.6, 1.0),
          new THREE.Vector3(0, 1.2, 1.3)
      ])
  }, [])

  useFrame((state) => {
      if (group.current) {
          const t = state.clock.elapsedTime + offset

          // Body bob - slower
          group.current.position.y = props.position[1] + Math.sin(t * 8) * 0.03

          // Head Bob & Look
          if (headGroup.current) {
              const lookX = noise2D(t * 0.2, 0) * 0.5
              const lookY = noise2D(0, t * 0.3) * 0.3

              headGroup.current.rotation.y = THREE.MathUtils.lerp(headGroup.current.rotation.y, lookX, 0.05)
              headGroup.current.rotation.x = THREE.MathUtils.lerp(headGroup.current.rotation.x, lookY, 0.05)
          }
      }
  })

  return (
    <group ref={group} {...props}>
      {/* Main Body Composite */}
      <group position={[0, 1.8, 0]}>
          {/* Ribcage */}
          <mesh position={[0, 0, 0.4]} rotation={[0.1, 0, 0]} castShadow receiveShadow>
             <sphereGeometry args={[0.75, 16, 16]} />
             <FurMaterial color="#C19A6B" />
          </mesh>
          {/* Rear */}
          <mesh position={[0, 0.1, -0.7]} rotation={[-0.1, 0, 0]} castShadow receiveShadow>
             <sphereGeometry args={[0.7, 16, 16]} />
             <FurMaterial color="#C19A6B" />
          </mesh>
          {/* Midsection connection */}
          <mesh position={[0, 0, -0.1]} rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow>
              <capsuleGeometry args={[0.68, 1.2, 8, 16]} />
              <FurMaterial color="#C19A6B" />
          </mesh>

          {/* Hump */}
           <mesh position={[0, 0.8, -0.1]} scale={[1, 1.1, 1]} castShadow receiveShadow>
             <sphereGeometry args={[0.6, 16, 16]} />
             <FurMaterial color="#C19A6B" />
          </mesh>
      </group>

      {/* Neck */}
      <group position={[0, 1.8, 0.6]}>
         <mesh castShadow receiveShadow>
            <tubeGeometry args={[neckCurve, 16, 0.3, 8, false]} />
            <FurMaterial color="#C19A6B" />
         </mesh>

         {/* Head */}
         <group position={[0, 1.2, 1.3]} ref={headGroup}>
             {/* Skull Base */}
             <mesh castShadow receiveShadow rotation={[0.2, 0, 0]}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <FurMaterial color="#C19A6B" />
             </mesh>
             {/* Snout */}
             <mesh position={[0, -0.1, 0.35]} rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow>
                 <capsuleGeometry args={[0.18, 0.5, 4, 8]} />
                 <FurMaterial color="#a08050" />
             </mesh>

             {/* Cheeks/Jaw */}
             <mesh position={[0, -0.15, 0.1]} castShadow receiveShadow>
                 <sphereGeometry args={[0.25, 12, 12]} />
                 <FurMaterial color="#C19A6B" />
             </mesh>

             {/* Ears */}
             <mesh position={[0.2, 0.25, -0.1]} rotation={[0, 0, -0.3]}>
                 <coneGeometry args={[0.06, 0.15, 8]} />
                 <FurMaterial color="#C19A6B" />
             </mesh>
             <mesh position={[-0.2, 0.25, -0.1]} rotation={[0, 0, 0.3]}>
                 <coneGeometry args={[0.06, 0.15, 8]} />
                 <FurMaterial color="#C19A6B" />
             </mesh>

              {/* Eyes */}
              <mesh position={[0.22, 0.05, 0.1]}>
                  <sphereGeometry args={[0.045, 8, 8]} />
                  <meshStandardMaterial color="#111" roughness={0.1} />
              </mesh>
              <mesh position={[-0.22, 0.05, 0.1]}>
                  <sphereGeometry args={[0.045, 8, 8]} />
                  <meshStandardMaterial color="#111" roughness={0.1} />
              </mesh>
         </group>
      </group>

      {/* Legs - Positioned relative to origin, but using Leg logic to lift Y */}
      {/* Front Left */}
      <Leg side={1} index={0} offset={offset} position={[-0.4, 1.7, 0.7]} />
      {/* Front Right */}
      <Leg side={-1} index={1} offset={offset} position={[0.4, 1.7, 0.7]} />
      {/* Back Left */}
      <Leg side={1} index={2} offset={offset} position={[-0.4, 1.8, -0.7]} />
      {/* Back Right */}
      <Leg side={-1} index={3} offset={offset} position={[0.4, 1.8, -0.7]} />
    </group>
  )
}
