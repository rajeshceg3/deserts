import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'

// Leg geometry helper
// Pivot is at top (0,0,0 local to group), leg extends down
const Leg = ({ position, legRef }) => (
    <group position={position} ref={legRef}>
        <mesh position={[0, -1, 0]}>
          <cylinderGeometry args={[0.15, 0.1, 2]} />
          <meshStandardMaterial color="#C19A6B" />
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

        // Add some noise to the walk cycle speed
        const noise = Math.sin(t * 0.1) * 0.2
        const walkT = t + noise

        // Procedural Walking Animation (Diagonals synced)
        // Rotate around X axis for legs
        if (legFL.current) legFL.current.rotation.x = Math.sin(walkT) * 0.4
        if (legFR.current) legFR.current.rotation.x = Math.sin(walkT + Math.PI) * 0.4
        if (legBL.current) legBL.current.rotation.x = Math.sin(walkT + Math.PI) * 0.4
        if (legBR.current) legBR.current.rotation.x = Math.sin(walkT) * 0.4

        // Body bobbing - synced with steps (2 steps per cycle)
        const bob = Math.abs(Math.sin(walkT)) * 0.1
        group.current.position.y = props.position[1] + bob

        // Organic head movement using noise-like composition
        if (headRef.current) {
             const headT = state.clock.elapsedTime + offset
             // Head turn (slow scan + quick glance)
             headRef.current.rotation.y = Math.sin(headT * 0.5) * 0.3 + Math.sin(headT * 1.5) * 0.05
             // Head nod (breathing + attention)
             headRef.current.rotation.x = 0.5 + Math.sin(headT * 0.3) * 0.1 + Math.sin(headT * 2.1) * 0.02
        }

        // Rotate whole creature slowly around Y axis with variation
        group.current.rotation.y += delta * (0.1 + Math.sin(state.clock.elapsedTime * 0.2) * 0.05)
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

      {/* Neck & Head Group */}
      <group position={[0, 2, 1.5]} ref={headRef} rotation={[0.5, 0, 0]}>
          <mesh position={[0, 0.75, 0]}>
            <boxGeometry args={[0.4, 1.5, 0.4]} />
            <meshStandardMaterial color="#C19A6B" />
          </mesh>
          <mesh position={[0, 1.55, 0.2]}>
            <boxGeometry args={[0.5, 0.5, 0.8]} />
            <meshStandardMaterial color="#C19A6B" />
          </mesh>
      </group>

      {/* Legs - Attached at body height (1.5 - 0.5 = 1.0 approx) */}
      {/* Body is 1.5 high, 1 thick. Bottom is at 1.0. */}
      {/* Leg pivot should be at 1.0 */}

      <Leg position={[-0.5, 1.0, 1.2]} legRef={legFL} />
      <Leg position={[0.5, 1.0, 1.2]} legRef={legFR} />
      <Leg position={[-0.5, 1.0, -1.2]} legRef={legBL} />
      <Leg position={[0.5, 1.0, -1.2]} legRef={legBR} />
    </group>
  )
}
