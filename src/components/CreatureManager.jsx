import React, { useMemo } from 'react'
import { Camel } from './creatures/Camel'
import { Scorpion } from './creatures/Scorpion'
import { Lizard } from './creatures/Lizard'
import { Fox } from './creatures/Fox'
import { useStore } from '../store'
import { deserts } from '../data/deserts'

const CreatureMap = {
  Camel,
  Scorpion,
  Lizard,
  Fox
}

export const CreatureManager = () => {
  const currentDesertIndex = useStore((state) => state.currentDesertIndex)
  const desert = deserts[currentDesertIndex]

  // Generate random positions for creatures
  // We recreate this when desert changes
  const creatures = useMemo(() => {
    const list = []
    if (!desert.creatures) return list

    desert.creatures.forEach((type) => {
      const Component = CreatureMap[type]
      if (!Component) return

      // Spawn 3 of each type
      for (let i = 0; i < 3; i++) {
        const x = (Math.random() - 0.5) * 40
        const z = (Math.random() - 0.5) * 40
        // Avoid center where camera might be looking or close to 0,0
        if (Math.abs(x) < 5 && Math.abs(z) < 5) continue

        list.push({
          id: `${type}-${i}`,
          Component,
          position: [x, 0, z], // Y will need to be adjusted if terrain is high, but we'll keep it simple or raycast
          // For now, let's assume flat-ish ground or adjust slightly.
          // Since terrain has height, we might clip.
          // Better: We could raycast to find height, but that's complex for this step.
          // We will just float them a bit or put them on "average" height.
          // Or let the creature component handle it (not easy without knowing terrain).
          // We'll put them at y=0 and hope terrain isn't too high, or adjust manually.
        })
      }
    })
    return list
  }, [desert])

  return (
    <group>
      {creatures.map(({ id, Component, position }) => (
        <Component key={id} position={position} />
      ))}
    </group>
  )
}
