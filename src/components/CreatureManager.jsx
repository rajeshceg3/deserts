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
  const groupRef = useRef()

  useEffect(() => {
    if (!desert || !desert.creatures) {
      setCreatures([])
      return
    }

    let spawnTimer

    // Function to spawn new creatures
    const spawn = () => {
        const list = []
        desert.creatures.forEach((type) => {
          const ComponentType = CreatureMap[type]
          if (!ComponentType) return

          // Spawn 3 of each type
          for (let i = 0; i < 3; i++) {
            const x = (Math.random() - 0.5) * 40
            const z = (Math.random() - 0.5) * 40
            // Avoid center where camera might be looking or close to 0,0
            if (Math.abs(x) < 5 && Math.abs(z) < 5) continue

            // Calculate correct Y position so creatures are on the ground
            const y = getTerrainHeight(x, z, desert.terrainParams)

            list.push({
              id: `${type}-${i}`,
              Component: ComponentType,
              position: [x, y, z],
            })
          }
        })
        setCreatures(list)

        // Animate In
        if (groupRef.current) {
            gsap.fromTo(groupRef.current.scale,
                { x: 0, y: 0, z: 0 },
                { x: 1, y: 1, z: 1, duration: 0.5, ease: "back.out(1.7)" }
            )
        }
    }

    // Animate Out existing creatures
    if (groupRef.current) {
        gsap.to(groupRef.current.scale, {
            x: 0,
            y: 0,
            z: 0,
            duration: 0.5,
            ease: "back.in(1.7)",
            onComplete: () => {
                setCreatures([]) // Clear existing
                // Wait for terrain to settle (Total ~1500ms: 500ms fade out + 1000ms wait)
                spawnTimer = setTimeout(spawn, 1000)
            }
        })
    } else {
        // Should generally not happen as ref is attached, but for safety
        spawnTimer = setTimeout(spawn, 1500)
    }

    return () => {
        gsap.killTweensOf(groupRef.current?.scale)
        clearTimeout(spawnTimer)
    }
  }, [desert])

  return (
    <group ref={groupRef}>
      {creatures.map(({ id, Component: Cmp, position }) => (
        <Cmp key={id} position={position} />
      ))}
    </group>
  )
}
