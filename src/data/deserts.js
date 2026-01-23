export const deserts = [
  {
    name: 'Ethereal Dunes',
    description: 'A realm where soft peach sands whisper secrets to the morning sun, creating a sanctuary of warmth and tranquility.',
    colors: {
      ground: '#FFDAB9', // Peach
      sky: '#FFF0F5',    // Lavender Blush
      fog: '#FFDAB9',
      groundHigh: '#FFE4E1', // Misty Rose
      groundLow: '#F5DEB3'   // Wheat
    },
    terrainParams: {
      roughness: 0.4,
      height: 2.0,
      scale: 4
    },
    creatures: ['Camel']
  },
  {
    name: 'Glacial Serenity',
    description: 'Crisp, mint-kissed valleys that breathe freshness into the soul, under a sky of infinite possibility.',
    colors: {
      ground: '#E0F2F1', // Mint
      sky: '#E1F5FE',    // Light Sky Blue
      fog: '#E0F2F1',
      groundHigh: '#F0F8FF', // Alice Blue
      groundLow: '#B2DFDB'   // Darker Mint
    },
    terrainParams: {
      roughness: 0.5,
      height: 1.5,
      scale: 5
    },
    creatures: ['Lizard']
  },
  {
    name: 'Velvet Twilight',
    description: 'A dreamscape bathed in lavender hues, where the boundary between earth and mystery dissolves into starlight.',
    colors: {
      ground: '#E6E6FA', // Lavender
      sky: '#F3E5F5',    // Purple 50
      fog: '#E6E6FA',
      groundHigh: '#D1C4E9', // Deep Purple 100
      groundLow: '#EDE7F6'
    },
    terrainParams: {
      roughness: 0.6,
      height: 2.2,
      scale: 3.5
    },
    creatures: ['Scorpion']
  },
  {
    name: 'Golden Hour',
    description: 'An eternal embrace of amber light, casting long, soft shadows across a landscape of pure nostalgia.',
    colors: {
      ground: '#F5E6D3', // Sand
      sky: '#FFF8E1',    // Amber 50
      fog: '#F5E6D3',
      groundHigh: '#FFECB3', // Amber 100
      groundLow: '#FFE0B2'   // Orange 100
    },
    terrainParams: {
      roughness: 0.3,
      height: 1.8,
      scale: 6
    },
    creatures: ['Camel', 'Fox']
  },
  {
    name: 'Rose Horizon',
    description: 'Soft pink waves of sand stretching into forever, painting the world with the gentle blush of a first love.',
    colors: {
      ground: '#FCE4EC', // Rose
      sky: '#FFEBEE',    // Red 50
      fog: '#FCE4EC',
      groundHigh: '#F8BBD0', // Pink 100
      groundLow: '#F48FB1'   // Pink 200
    },
    terrainParams: {
      roughness: 0.45,
      height: 2.5,
      scale: 4.5
    },
    creatures: ['Lizard', 'Fox']
  }
]
