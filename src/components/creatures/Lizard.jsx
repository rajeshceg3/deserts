import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ScaleMaterial } from '../../utils/proceduralMaterials'

export const Lizard = (props) => {
  const group = useRef()
  const legRefs = useRef([])

  // Random offset
  const offset = React.useMemo(() => Math.random() * 100, [])

  useFrame((state) => {
    if(group.current) {
        const t = state.clock.elapsedTime + offset

        // Use smoothstep for organic start/stop
        // sin(t*2) goes -1 to 1.
        // We want move when > 0, but smooth transition around 0.
        const raw = Math.sin(t * 2);
        const moveFactor = THREE.MathUtils.smoothstep(raw, 0.0, 0.2); // 0 when <0, smooth to 1 when >0.2

        // Breathing
        group.current.scale.y = 1.0 + Math.sin(t * 5.0) * 0.02;

        if (moveFactor > 0.01) {
             // Side-to-side wiggle
             const wiggle = Math.sin(t * 20.0) * 0.1 * moveFactor;
             group.current.rotation.y = wiggle;
             group.current.position.x = props.position[0] + wiggle * 0.5;

             // Animate Legs
             legRefs.current.forEach((leg, i) => {
                if (leg) {
                    const side = i % 2 === 0 ? 1 : -1
                    // Rapid leg movement when moving
                    leg.rotation.y = Math.sin(t * 20.0 + i) * 0.5 * moveFactor;
                    leg.rotation.z = Math.cos(t * 20.0 + i) * 0.2 * moveFactor * side; // Lift leg slightly
                }
             })
        }
    }
  })

  return (
    <group ref={group} {...props}>
      {/* Body - Rotated to be horizontal */}
      <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
         <capsuleGeometry args={[0.15, 0.8, 4, 8]} />
         <ScaleMaterial color="#4caf50" />
      </mesh>

      {/* Head - Rounded Cone (Cylinder with different radii) */}
      <mesh position={[0, 0.15, 0.5]} rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.02, 0.14, 0.4, 8]} />
          <ScaleMaterial color="#388e3c" />
      </mesh>

      {/* Legs */}
      {[
        [-0.2, 0.1, 0.2], [0.2, 0.1, 0.2],
        [-0.2, 0.1, -0.2], [0.2, 0.1, -0.2]
      ].map((pos, i) => (
          <group
            key={i}
            ref={el => legRefs.current[i] = el}
            position={pos}
            rotation={[0, 0, i % 2 === 0 ? 0.2 : -0.2]}
          >
            {/* Upper Leg */}
            <mesh position={[i % 2 === 0 ? -0.15 : 0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
                <capsuleGeometry args={[0.04, 0.3, 4, 8]} />
                <ScaleMaterial color="#2e7d32" />
            </mesh>
          </group>
      ))}
    </group>
  )
}
