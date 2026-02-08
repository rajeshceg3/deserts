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

  // Idle animation: bobbing
  useFrame((state) => {
      const time = state.clock.getElapsedTime();
      creatureRefs.current.forEach((ref, i) => {
          if (ref && ref.userData && ref.userData.baseY !== undefined) {
              // Gentle bobbing, offset by index to avoid sync
              // Only bob if we are "settled" (roughly)
              // Actually, just add sine to base Y
              ref.position.y = ref.userData.baseY + Math.sin(time * 2 + i) * 0.1;
          }
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
         // Animate each creature down
         const positions = activeRefs.map(r => r.position)
         const scales = activeRefs.map(r => r.scale)

         gsap.to(positions, {
             y: (i, target) => activeRefs[i].userData.baseY - 2,
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
