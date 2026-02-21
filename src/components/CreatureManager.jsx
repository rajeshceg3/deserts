/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react'
import { Camel } from './creatures/Camel'
import { Scorpion } from './creatures/Scorpion'
import { Lizard } from './creatures/Lizard'
import { Fox } from './creatures/Fox'
import { useStore } from '../store'
import { deserts } from '../data/deserts'
import { getTerrainHeight } from '../utils/terrainUtils'
import { gsap } from 'gsap'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const CreatureMap = {
  Camel,
  Scorpion,
  Lizard,
  Fox
}

export const CreatureManager = () => {
  const currentDesertIndex = useStore((state) => state.currentDesertIndex)
  const desert = deserts[currentDesertIndex]
  const [creatures, setCreatures] = useState([])
  const creatureRefs = useRef([])
  const groupRef = useRef()

  // Reset refs array when creature count changes
  useEffect(() => {
    creatureRefs.current = creatureRefs.current.slice(0, creatures.length);
  }, [creatures]);

  // Wandering & Terrain Following Logic
  useFrame((state, delta) => {
      if (!desert) return

      creatureRefs.current.forEach((ref, i) => {
          if (!ref || ref.userData?.isExiting) return

          // Initialize wandering state if missing
          if (!ref.userData.target) {
              // Pick random target
              const range = 15;
              const tx = ref.position.x + (Math.random() - 0.5) * range;
              const tz = ref.position.z + (Math.random() - 0.5) * range;
              ref.userData.target = new THREE.Vector3(tx, 0, tz);
              ref.userData.speed = 0.5 + Math.random() * 1.5; // Random speed
              ref.userData.waitTime = 0;
              ref.userData.state = 'moving';
          }

          // State Machine
          if (ref.userData.state === 'moving') {
              const target = ref.userData.target;
              const currentPos = ref.position;

              // Direction vector (ignore Y)
              const dx = target.x - currentPos.x;
              const dz = target.z - currentPos.z;
              const dist = Math.sqrt(dx*dx + dz*dz);

              if (dist < 0.5) {
                  // Arrived
                  ref.userData.state = 'idle';
                  ref.userData.waitTime = 1 + Math.random() * 3; // Wait 1-4s
              } else {
                  // Move
                  const moveDist = ref.userData.speed * delta;
                  const factor = moveDist / dist;

                  ref.position.x += dx * factor;
                  ref.position.z += dz * factor;

                  // Rotate towards target
                  const targetRotation = Math.atan2(dx, dz);
                  let rotDiff = targetRotation - ref.rotation.y;
                  while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
                  while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;

                  // Smooth turn
                  ref.rotation.y += rotDiff * delta * 2;
              }
          } else {
              // Idle
              ref.userData.waitTime -= delta;
              if (ref.userData.waitTime <= 0) {
                  // Pick new target
                  const range = 20;
                  // Bias towards center slightly to keep them on map
                  const biasX = -ref.position.x * 0.05;
                  const biasZ = -ref.position.z * 0.05;

                  let tx = ref.position.x + (Math.random() - 0.5) * range + biasX;
                  let tz = ref.position.z + (Math.random() - 0.5) * range + biasZ;

                  // Clamp to safe area
                  tx = Math.max(-45, Math.min(45, tx));
                  tz = Math.max(-45, Math.min(45, tz));

                  ref.userData.target.set(tx, 0, tz);
                  ref.userData.state = 'moving';
              }
          }

          // Update Y based on Terrain
          const targetY = getTerrainHeight(ref.position.x, ref.position.z, desert.terrainParams)

          // Smooth terrain following
          const currentBaseY = ref.userData.baseY || ref.position.y;
          // Faster lerp for Y to prevent clipping into steep dunes
          const newBaseY = THREE.MathUtils.lerp(currentBaseY, targetY, delta * 5);

          ref.userData.baseY = newBaseY;
          ref.position.y = newBaseY;
      });
  });

  // Handle Desert Change (Exit -> Spawn)
  useEffect(() => {
    if (!desert) return

    let spawnTimer

    const spawn = () => {
        if (!desert.creatures) {
            setCreatures([])
            return
        }

        const list = []
        desert.creatures.forEach((type) => {
          const ComponentType = CreatureMap[type]
          if (!ComponentType) return

          // Spawn 3 of each type
          for (let i = 0; i < 3; i++) {
            const x = (Math.random() - 0.5) * 40
            const z = (Math.random() - 0.5) * 40
            if (Math.abs(x) < 5 && Math.abs(z) < 5) continue

            const y = getTerrainHeight(x, z, desert.terrainParams)
            const rotationY = Math.random() * Math.PI * 2

            list.push({
              id: `${type}-${Date.now()}-${i}`, // Unique ID
              Component: ComponentType,
              position: [x, y, z],
              rotation: [0, rotationY, 0],
              baseY: y
            })
          }
        })
        setCreatures(list)
    }

    // Animate Out existing creatures
    const activeRefs = creatureRefs.current.filter(Boolean)
    if (activeRefs.length > 0) {
         // Mark as exiting to disable useFrame updates
         activeRefs.forEach(ref => { if (ref.userData) ref.userData.isExiting = true })

         // Animate each creature down
         const positions = activeRefs.map(r => r.position)
         const scales = activeRefs.map(r => r.scale)

         gsap.to(positions, {
             y: (i) => (activeRefs[i].userData.baseY || 0) - 2,
             duration: 0.5,
             ease: "power2.in",
             stagger: 0.05
         });

         gsap.to(scales, {
             x: 0, y: 0, z: 0,
             duration: 0.5,
             ease: "back.in(1.7)",
             stagger: 0.05,
             onComplete: () => {
                 setCreatures([])
                 spawnTimer = setTimeout(spawn, 500)
             }
         });
    } else {
        // First load or empty
        spawn()
    }

    return () => clearTimeout(spawnTimer)
  }, [desert])

  // Animate In New Creatures
  useEffect(() => {
      if (creatures.length === 0) return;

      // Small delay to ensure refs are attached
      const t = setTimeout(() => {
          const activeRefs = creatureRefs.current.filter(Boolean)

          if (activeRefs.length === 0) return

          // Set initial state
          activeRefs.forEach((el, i) => {
             const data = creatures[i]
             if (data) {
                 el.position.y = data.baseY - 2
                 el.scale.set(0, 0, 0)
                 el.userData.baseY = data.baseY
                 // Clear any stale userData
                 el.userData.target = null
                 el.userData.isExiting = false
             }
          })

          const positions = activeRefs.map(r => r.position)
          const scales = activeRefs.map(r => r.scale)

          // Animate Up
          gsap.to(positions, {
              y: (i) => activeRefs[i].userData.baseY,
              duration: 1.2,
              ease: "power3.out",
              stagger: 0.1
          })

          gsap.to(scales, {
              x: 1, y: 1, z: 1,
              duration: 0.8,
              ease: "back.out(1.2)",
              stagger: 0.1,
              delay: 0.1
          })

      }, 50)

      return () => clearTimeout(t)
  }, [creatures])

  return (
    <group ref={groupRef}>
      {creatures.map((c, index) => {
        const Cmp = c.Component
        return (
            <group
                key={c.id}
                ref={el => creatureRefs.current[index] = el}
                position={c.position}
                rotation={c.rotation}
            >
                {/* Pass zero position to component so it animates relative to parent group */}
                <Cmp position={[0, 0, 0]} />
            </group>
        )
      })}
    </group>
  )
}
