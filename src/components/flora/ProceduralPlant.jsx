import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Simple materials for now, could be improved
const PlantMaterial = ({ color, ...props }) => (
  <meshStandardMaterial color={color} roughness={0.8} side={THREE.DoubleSide} {...props} />
)

const Fern = ({ color, scale = 1 }) => {
  return (
    <group scale={scale}>
      {[...Array(5)].map((_, i) => (
        <group key={i} rotation={[0, (i / 5) * Math.PI * 2, 0]}>
          <mesh position={[0.2, 0.5, 0]} rotation={[0, 0, -0.5]} castShadow receiveShadow>
             <planeGeometry args={[0.3, 1.2, 2, 4]} />
             <PlantMaterial color={color} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

const Flower = ({ color, scale = 1 }) => {
  return (
    <group scale={scale}>
      {/* Stem */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 6]} />
        <PlantMaterial color="#556b2f" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <sphereGeometry args={[0.15, 8, 8]} />
        <PlantMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>
    </group>
  )
}

const Grass = ({ color, scale = 1 }) => {
  return (
    <group scale={scale}>
      {[...Array(10)].map((_, i) => (
        <mesh
          key={i}
          position={[(Math.random()-0.5)*0.5, 0.3, (Math.random()-0.5)*0.5]}
          rotation={[Math.random()*0.2, Math.random()*Math.PI, Math.random()*0.2]}
          castShadow receiveShadow
        >
          <coneGeometry args={[0.02, 0.6 + Math.random()*0.3, 4]} />
          <PlantMaterial color={color} />
        </mesh>
      ))}
    </group>
  )
}

const Moss = ({ color, scale = 1 }) => {
  return (
    <group scale={scale}>
        <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
            <circleGeometry args={[0.5 + Math.random()*0.3, 16]} />
            <PlantMaterial color={color} roughness={1} />
        </mesh>
        {[...Array(5)].map((_, i) => (
            <mesh key={i} position={[(Math.random()-0.5)*0.6, 0.05, (Math.random()-0.5)*0.6]} receiveShadow>
                <sphereGeometry args={[0.1 + Math.random()*0.1, 6, 6]} />
                <PlantMaterial color={color} />
            </mesh>
        ))}
    </group>
  )
}

const Bush = ({ color, scale = 1 }) => {
  return (
    <group scale={scale}>
        {[...Array(4)].map((_, i) => (
             <mesh key={i} position={[(Math.random()-0.5)*0.5, 0.3 + Math.random()*0.3, (Math.random()-0.5)*0.5]} castShadow receiveShadow>
                 <sphereGeometry args={[0.3 + Math.random()*0.2, 8, 8]} />
                 <PlantMaterial color={color} />
             </mesh>
        ))}
        {/* Trunk/Root */}
         <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
             <cylinderGeometry args={[0.05, 0.08, 0.5, 6]} />
             <PlantMaterial color="#3e2723" />
         </mesh>
    </group>
  )
}

const Succulent = ({ color, scale = 1 }) => {
  return (
    <group scale={scale}>
        {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2
            return (
                <mesh key={i} position={[0, 0.1, 0]} rotation={[0.5, angle, 0]} castShadow receiveShadow>
                     <coneGeometry args={[0.1, 0.5, 5]} />
                     <PlantMaterial color={color} roughness={0.4} />
                </mesh>
            )
        })}
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
            <coneGeometry args={[0.12, 0.4, 5]} />
            <PlantMaterial color={color} />
        </mesh>
    </group>
  )
}

const Crystal = ({ color, scale = 1 }) => {
    return (
        <group scale={scale}>
             <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
                 <cylinderGeometry args={[0, 0.2, 1, 4]} />
                 <meshPhysicalMaterial
                    color={color}
                    transmission={0.6}
                    roughness={0.1}
                    metalness={0.1}
                    thickness={0.5}
                 />
             </mesh>
             <mesh position={[0.2, 0.3, 0]} rotation={[0, 0, -0.3]} castShadow receiveShadow>
                 <cylinderGeometry args={[0, 0.1, 0.6, 4]} />
                 <meshPhysicalMaterial
                    color={color}
                    transmission={0.6}
                    roughness={0.1}
                    metalness={0.1}
                    thickness={0.3}
                 />
             </mesh>
        </group>
    )
}

const plantTypes = {
  'Fern': Fern,
  'Flower': Flower,
  'Grass': Grass,
  'Moss': Moss,
  'Bush': Bush,
  'Succulent': Succulent,
  'Crystal': Crystal
}

export const ProceduralPlant = ({ type, color, scale = 1 }) => {
  const Component = plantTypes[type] || Bush

  // Add some random rotation for variety
  const rotationY = useMemo(() => Math.random() * Math.PI * 2, [])

  return (
      <group rotation={[0, rotationY, 0]}>
          <Component color={color} scale={scale} />
      </group>
  )
}
