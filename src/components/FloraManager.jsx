import React, { useMemo, useState, useEffect } from 'react'
import { useStore } from '../store'
import { deserts } from '../data/deserts'
import { getTerrainHeight } from '../utils/terrainUtils'
import { ProceduralPlant } from './flora/ProceduralPlant'
import * as THREE from 'three'

const floraConfig = {
  // Ethereal Dunes
  'Sun-Kissed Ferns': { type: 'Fern', color: '#8FBC8F', scale: 1.2 },
  'Golden Poppy': { type: 'Flower', color: '#FFD700', scale: 0.8 },
  'Mirage Grass': { type: 'Grass', color: '#F0E68C', scale: 1.5 },

  // Glacial Serenity
  'Crystal Moss': { type: 'Moss', color: '#E0FFFF', scale: 1.0 },
  'Frost Bloom': { type: 'Flower', color: '#F0FFFF', scale: 0.9 },
  'Ice Willow': { type: 'Bush', color: '#F0F8FF', scale: 2.0 },

  // Velvet Twilight
  'Moonflower': { type: 'Flower', color: '#E6E6FA', scale: 1.0 },
  'Shadow Fern': { type: 'Fern', color: '#483D8B', scale: 1.3 },
  'Violet Moss': { type: 'Moss', color: '#9370DB', scale: 1.0 },

  // Golden Hour
  'Amber Wheat': { type: 'Grass', color: '#DAA520', scale: 1.4 },
  'Sunburst Succulent': { type: 'Succulent', color: '#FFA500', scale: 0.6 },
  'Glow Berry': { type: 'Bush', color: '#FF4500', scale: 1.2 },

  // Rose Horizon
  'Petal Grass': { type: 'Grass', color: '#FFB6C1', scale: 1.0 },
  'Blushing Cactus': { type: 'Succulent', color: '#DB7093', scale: 1.0 },
  'Rosemary Scrub': { type: 'Bush', color: '#556B2F', scale: 1.5 },

  // Obsidian Rift
  'Ash Fern': { type: 'Fern', color: '#696969', scale: 1.1 },
  'Magma Root': { type: 'Bush', color: '#8B0000', scale: 1.3 },
  'Charred Bush': { type: 'Bush', color: '#2F4F4F', scale: 1.4 },

  // Nebula Plains
  'Star Lily': { type: 'Flower', color: '#E0FFFF', scale: 0.9 },
  'Glowing Moss': { type: 'Moss', color: '#00FA9A', scale: 1.0 },
  'Cosmic Vine': { type: 'Bush', color: '#9400D3', scale: 1.8 },

  // Echo Valley
  'Mist Aloe': { type: 'Succulent', color: '#2E8B57', scale: 1.5 },
  'Echo Fern': { type: 'Fern', color: '#3CB371', scale: 1.4 },
  'Giant Agave': { type: 'Succulent', color: '#006400', scale: 2.5 },

  // Crystal Canyons
  'Glass Reed': { type: 'Crystal', color: '#E0FFFF', scale: 1.8 },
  'Prism Flower': { type: 'Crystal', color: '#FF69B4', scale: 1.0 },
  'Quartz Lichen': { type: 'Moss', color: '#F5F5F5', scale: 1.0 },

  // Crimson Waste
  'Iron Weed': { type: 'Grass', color: '#8B4513', scale: 1.2 },
  'Rust Bush': { type: 'Bush', color: '#A0522D', scale: 1.4 },
  'Copper Vine': { type: 'Bush', color: '#B8860B', scale: 1.6 }
}

export const FloraManager = () => {
  const currentDesertIndex = useStore((state) => state.currentDesertIndex)
  const desert = deserts[currentDesertIndex]
  const [plants, setPlants] = useState([])

  useEffect(() => {
    if (!desert || !desert.flora) {
        setPlants([])
        return
    }

    const newPlants = []
    const count = 60 // Number of plants

    for (let i = 0; i < count; i++) {
        // Pick a random flora type from the desert's list
        const floraName = desert.flora[Math.floor(Math.random() * desert.flora.length)]
        const config = floraConfig[floraName]

        if (!config) continue

        // Random position
        const x = (Math.random() - 0.5) * 80
        const z = (Math.random() - 0.5) * 80

        // Don't spawn too close to center (spawn point)
        if (Math.sqrt(x*x + z*z) < 5) continue

        const y = getTerrainHeight(x, z, desert.terrainParams)

        newPlants.push({
            id: i,
            x, y, z,
            ...config,
            // Vary scale slightly
            scale: config.scale * (0.8 + Math.random() * 0.4)
        })
    }
    setPlants(newPlants)
  }, [desert])

  return (
    <group>
      {plants.map((p) => (
        <group key={p.id} position={[p.x, p.y, p.z]}>
            <ProceduralPlant type={p.type} color={p.color} scale={p.scale} />
        </group>
      ))}
    </group>
  )
}
