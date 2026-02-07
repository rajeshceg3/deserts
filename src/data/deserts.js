export const deserts = [
  {
    name: 'Ethereal Dunes',
    description: 'A realm where soft peach sands whisper secrets to the morning sun, creating a sanctuary of warmth and tranquility.',
    lore: "Legend says these sands were once the bed of a celestial ocean, dried by the gaze of a falling star. The warmth radiating from the ground is said to heal weary travelers, wrapping them in an eternal embrace of comfort. It is a place where time slows, and the air itself seems to shimmer with ancient magic.",
    features: ['Singing Sands', 'Eternal Sunrise', 'Warm Breezes'],
    factoid: "The temperature here never drops below 20°C, creating a perpetual spring.",
    climate: "Temperate",
    colors: {
      ground: '#F2D1C9', // Soft Apricot
      sky: '#FFF5F5',    // Blush Cream
      fog: '#F2D1C9',
      groundHigh: '#FFDFD3', // Light Peach
      groundLow: '#E6B8B0'   // Muted Rose
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
    lore: "A frozen wasteland preserving the silence of the ancient world, untouched by the passage of time. Here, the winds carry stories from epochs past, frozen in the very air you breathe. The stillness is profound, broken only by the gentle chime of shifting ice crystals.",
    features: ['Permafrost', 'Aurora Reflections', 'Silent Winds'],
    factoid: "The ice structures here vibrate at a frequency that induces deep relaxation.",
    climate: "Frigid",
    colors: {
      ground: '#D4F1F4', // Icy Mint
      sky: '#E8FAFC',    // Pale Azure
      fog: '#D4F1F4',
      groundHigh: '#E2F7F9', // Lighter Mint
      groundLow: '#BCE3E7'   // Deep Ice
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
    lore: "A realm caught in the moment between wakefulness and dreams, where shadows detach and dance on their own. The air is thick with the scent of night-blooming jasmine, and the ground feels soft as velvet underfoot. It is a place for introspection and confronting the mysteries within.",
    features: ['Purple Haze', 'Starlight Sands', 'Mystic Fog'],
    factoid: "Compass needles spin wildly here due to the magnetic sands.",
    climate: "Cool",
    colors: {
      ground: '#DCD6F7', // Dusty Lilac
      sky: '#F4EEFF',    // Periwinkle Mist
      fog: '#DCD6F7',
      groundHigh: '#E5DFFB', // Light Lilac
      groundLow: '#C5BDF0'   // Deep Lavender
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
    lore: "A place where the sun pauses its descent, bathing the land in a nostalgic, amber embrace forever. The shadows here stretch long but never darken, holding the warmth of a day that refuses to end. It feels like a memory you can walk through.",
    features: ['Amber Light', 'Long Shadows', 'Warmth'],
    factoid: "Photographers flock here, as the lighting is considered perfect at any angle.",
    climate: "Warm",
    colors: {
      ground: '#FBE7C6', // Muted Gold
      sky: '#FFFCF2',    // Vanilla
      fog: '#FBE7C6',
      groundHigh: '#FDF0D8', // Light Gold
      groundLow: '#EACD9E'   // Deep Amber
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
    lore: "The sands here are stained by the petals of a billion ancient roses that once bloomed before the great drought. Though the flowers are gone, their spirit remains in the soft, blushing dunes that seem to pulse with a gentle heartbeat.",
    features: ['Pink Sands', 'Floral Scent', 'Soft Light'],
    factoid: "The air here actually smells faintly of rosewater.",
    climate: "Temperate",
    colors: {
      ground: '#FBC4AB', // Millennial Pink
      sky: '#FDE2E4',    // Blush
      fog: '#FBC4AB',
      groundHigh: '#FCD5C3', // Light Pink
      groundLow: '#F0AFA0'   // Deep Rose
    },
    terrainParams: {
      roughness: 0.45,
      height: 2.5,
      scale: 4.5
    },
    creatures: ['Lizard', 'Fox']
  }
]
