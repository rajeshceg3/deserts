/* eslint-disable */
import React, { useState, useEffect } from 'react'
import { Camel } from './creatures/Camel'
import { Scorpion } from './creatures/Scorpion'
import { Lizard } from './creatures/Lizard'
import { Fox } from './creatures/Fox'
import { useStore } from '../store'
import { deserts } from '../data/deserts'
import { getTerrainHeight } from '../utils/terrainUtils'

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

  useEffect(() => {
    // Clear existing creatures immediately during transition
    setCreatures([])

    if (!desert.creatures) {
        return
    }

    const timer = setTimeout(() => {
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
    }, 1500) // Delay spawn to match terrain morph duration (stabilization)

    return () => clearTimeout(timer)
  }, [desert])

  return (
    <group>
      {creatures.map(({ id, Component: Cmp, position }) => (
        <Cmp key={id} position={position} />
      ))}
    </group>
  )
}
