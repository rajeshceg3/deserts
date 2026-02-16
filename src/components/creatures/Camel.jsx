import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FurMaterial } from '../../utils/proceduralMaterials'

// Leg geometry helper
// Pivot is at top (0,0,0 local to group), leg extends down
const Leg = ({ position, legRef }) => (
    <group position={position} ref={legRef}>
        <mesh position={[0, -0.75, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.12, 1.5, 4, 8]} />
          <FurMaterial color="#C19A6B" />
        </mesh>
        {/* Hoof - Rounded cylinder instead of box */}
        <mesh position={[0, -1.5, 0.05]} castShadow receiveShadow>
            <cylinderGeometry args={[0.12, 0.14, 0.15, 8]} />
            <meshStandardMaterial color="#3E2723" roughness={0.9} />
        </mesh>
    </group>
)

export const Camel = (props) => {
  const group = useRef()
  const headRef = useRef()

  // Random offset for this instance to desynchronize animations
  const offset = React.useMemo(() => Math.random() * 100, [])

  // Refs for legs
  const legFL = useRef() // Front Left
  const legFR = useRef() // Front Right
  const legBL = useRef() // Back Left
  const legBR = useRef() // Back Right

  useFrame((state, delta) => {
    if(group.current) {
        // Walking speed with offset
        const t = state.clock.elapsedTime * 4 + offset

        // Add layered noise for organic gait speed variation
        // Primary low-frequency sway + secondary higher-frequency jitter
        const noise = Math.sin(t * 0.1) * 0.2 + Math.sin(t * 0.5) * 0.15
        const walkT = t + noise

        // Procedural Walking Animation (Diagonals synced)
        // Rotate around X axis for legs
        // Adjusted amplitude for realistic gait
        if (legFL.current) legFL.current.rotation.x = Math.sin(walkT) * 0.5
        if (legFR.current) legFR.current.rotation.x = Math.sin(walkT + Math.PI) * 0.5
        if (legBL.current) legBL.current.rotation.x = Math.sin(walkT + Math.PI) * 0.5
        if (legBR.current) legBR.current.rotation.x = Math.sin(walkT) * 0.5

        // Body bobbing - synced with steps (2 steps per cycle)
        const bob = Math.abs(Math.sin(walkT)) * 0.05
        group.current.position.y = props.position[1] + bob

        // Organic head movement
        if (headRef.current) {
             const headT = state.clock.elapsedTime + offset
             // Head turn (slow scan + quick glance + subtle jitter)
             headRef.current.rotation.y = Math.sin(headT * 0.5) * 0.3
                + Math.sin(headT * 1.5) * 0.05
                + Math.sin(headT * 3.7) * 0.02; // Micro-movements

             // Head nod (breathing + attention + step impact)
             headRef.current.rotation.x = 0.5
                + Math.sin(headT * 0.3) * 0.1
                + Math.sin(headT * 2.1) * 0.02
                + Math.cos(walkT * 2) * 0.03; // Sync subtle nod with steps
        }

        // Rotate whole creature slowly around Y axis with variation
        group.current.rotation.y += delta * (0.1 + Math.sin(state.clock.elapsedTime * 0.2) * 0.05)
    }
  })

  return (
    <group ref={group} {...props}>
      {/* Body Main: Capsule rotated 90deg on Z? No, on X or Z.
          Capsule default is vertical (Y). We want horizontal (Z).
          Rotate X 90deg.
      */}
      <mesh position={[0, 1.4, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.7, 1.6, 8, 16]} />
        <FurMaterial color="#C19A6B" />
      </mesh>

      {/* Hump: Sphere merged into body look */}
      <mesh position={[0, 2.1, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.65, 16, 16]} />
        <FurMaterial color="#C19A6B" />
      </mesh>

      {/* Neck & Head Group */}
      <group position={[0, 1.8, 1.4]} ref={headRef} rotation={[0.4, 0, 0]}>
          {/* Neck */}
          <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[0.3, 1.2, 8, 16]} />
            <FurMaterial color="#C19A6B" />
          </mesh>

          {/* Head */}
          <group position={[0, 1.3, 0.2]} rotation={[-0.4, 0, 0]}>
              {/* Skull */}
              <mesh castShadow receiveShadow>
                <sphereGeometry args={[0.35, 16, 16]} />
                <FurMaterial color="#C19A6B" />
              </mesh>
              {/* Snout */}
              <mesh position={[0, -0.1, 0.35]} rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow>
                <capsuleGeometry args={[0.2, 0.5, 4, 8]} />
                <FurMaterial color="#C12A6B" /> {/* Keeping darker nose color */}
              </mesh>
              {/* Eyes */}
              <mesh position={[0.2, 0.1, 0.15]}>
                  <sphereGeometry args={[0.05, 8, 8]} />
                  <meshStandardMaterial color="#111" roughness={0.2} />
              </mesh>
              <mesh position={[-0.2, 0.1, 0.15]}>
                  <sphereGeometry args={[0.05, 8, 8]} />
                  <meshStandardMaterial color="#111" roughness={0.2} />
              </mesh>
          </group>
      </group>

      {/* Legs */}
      <Leg position={[-0.4, 1.3, 1.0]} legRef={legFL} />
      <Leg position={[0.4, 1.3, 1.0]} legRef={legFR} />
      <Leg position={[-0.4, 1.3, -1.0]} legRef={legBL} />
      <Leg position={[0.4, 1.3, -1.0]} legRef={legBR} />
    </group>
  )
}
