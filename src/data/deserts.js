export const deserts = [
  {
    name: 'Sahara',
    description: 'The largest hot desert in the world, known for its endless golden dunes.',
    colors: {
      ground: '#e0c090',
      sky: '#87CEEB',
      fog: '#e0c090',
      groundHigh: '#ffcc00',
      groundLow: '#c2b280'
    },
    terrainParams: {
      roughness: 0.5,
      height: 2.5,
      scale: 3
    },
    creatures: ['Camel', 'Scorpion']
  },
  {
    name: 'Gobi',
    description: 'A vast, arid region in northern China and southern Mongolia, known for its dunes and rare animals.',
    colors: {
      ground: '#a08060',
      sky: '#b0c0d0',
      fog: '#a08060',
      groundHigh: '#8a6e4e',
      groundLow: '#6b543a'
    },
    terrainParams: {
      roughness: 1.2,
      height: 1.5,
      scale: 5
    },
    creatures: ['Lizard', 'Camel']
  },
  {
    name: 'Atacama',
    description: 'The driest non-polar desert in the world, located in Chile.',
    colors: {
      ground: '#c06040',
      sky: '#506080',
      fog: '#c06040',
      groundHigh: '#e08060',
      groundLow: '#a04020'
    },
    terrainParams: {
      roughness: 0.8,
      height: 2.0,
      scale: 4
    },
    creatures: ['Lizard']
  },
  {
    name: 'Mojave',
    description: 'A rain-shadow desert in the southwestern United States.',
    colors: {
      ground: '#d0c0a0',
      sky: '#88aaff',
      fog: '#d0c0a0',
      groundHigh: '#e0d0b0',
      groundLow: '#b0a080'
    },
    terrainParams: {
      roughness: 0.6,
      height: 1.0,
      scale: 2
    },
    creatures: ['Fox', 'Scorpion']
  },
  {
    name: 'Thar',
    description: 'Also known as the Great Indian Desert, a large, arid region in the northwestern part of the Indian subcontinent.',
    colors: {
      ground: '#f0d060',
      sky: '#ffeecc',
      fog: '#f0d060',
      groundHigh: '#ffe080',
      groundLow: '#d0b040'
    },
    terrainParams: {
      roughness: 0.7,
      height: 1.8,
      scale: 3.5
    },
    creatures: ['Camel']
  }
]
