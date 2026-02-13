export const deserts = [
  {
    name: 'Ethereal Dunes',
    description: 'A realm where soft peach sands whisper secrets to the morning sun, creating a sanctuary of warmth and tranquility.',
    lore: "Legend says these sands were once the bed of a celestial ocean, dried by the gaze of a falling star. The warmth radiating from the ground is said to heal weary travelers, wrapping them in an eternal embrace of comfort. It is a place where time slows, and the air itself seems to shimmer with ancient magic, echoing the laughter of spirits long departed.",
    journalEntry: "Day 4: The warmth here is unlike any other. It doesn't just touch the skin; it seeps into the bones, melting away years of fatigue. Last night, I swear the dunes sang—a low, melodic hum that matched the rhythm of my own heartbeat. I woke up feeling lighter, as if the sand itself had absorbed my burdens.",
    wisdom: "To find peace, one must first learn to be still.",
    features: ['Singing Sands', 'Eternal Sunrise', 'Warm Breezes'],
    factoid: "The temperature here never drops below 20°C, creating a perpetual spring.",
    climate: "Temperate",
    weather: "Clear",
    difficulty: "Easy",
    flora: ['Sun-Kissed Ferns', 'Golden Poppy', 'Mirage Grass'],
    floraDetails: [
      { name: "Sun-Kissed Ferns", description: "Delicate fronds that turn to face the sun throughout the day, storing warmth to release a gentle glow at night." },
      { name: "Golden Poppy", description: "A resilient flower with metallic-sheen petals that reflect sunlight, acting as natural beacons for lost travelers." },
      { name: "Mirage Grass", description: "Tall, swaying grass that seems to vanish when looked at directly, only visible in one's peripheral vision." }
    ],
    soundProfile: 'Soft humming wind, distant chimes',
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
    creatures: ['Camel'],
    creatureDetails: [
      { name: "Camel", description: "The Ethereal Camel is known for its silky, peach-colored fur and ability to sense water sources from miles away." }
    ],
    artifact: {
      name: "Sun-Bleached Hourglass",
      description: "Sand flows upward within this glass, defying gravity and time.",
      icon: "⏳"
    },
    constellation: {
      name: "The Wandering Camel",
      description: "A trail of stars that guides lost travelers back to safety.",
      myth: "It is said that the First Camel walked across the sky to carry the sun to its resting place, leaving a trail of hoofprints that became the stars."
    }
  },
  {
    name: 'Glacial Serenity',
    description: 'Crisp, mint-kissed valleys that breathe freshness into the soul, under a sky of infinite possibility.',
    lore: "A frozen wasteland preserving the silence of the ancient world, untouched by the passage of time. Here, the winds carry stories from epochs past, frozen in the very air you breathe. The stillness is profound, broken only by the gentle chime of shifting ice crystals and the distant roar of auroras dancing above.",
    journalEntry: "Day 12: Silence. Absolute, heavy silence. My breath clouds in front of me, freezing instantly into tiny crystals that drift to the ground. There is no decay here, only preservation. I found a flower encased in ice today—perfectly preserved, as if it bloomed just moments ago. This place is a museum of moments.",
    wisdom: "Silence is not empty; it is full of answers.",
    features: ['Permafrost', 'Aurora Reflections', 'Silent Winds'],
    factoid: "The ice structures here vibrate at a frequency that induces deep relaxation.",
    climate: "Frigid",
    weather: "Snowy",
    difficulty: "Moderate",
    flora: ['Crystal Moss', 'Frost Bloom', 'Ice Willow'],
    floraDetails: [
      { name: "Crystal Moss", description: "A hardy lichen that grows in geometric patterns on the permafrost, crunching like glass underfoot." },
      { name: "Frost Bloom", description: "A flower made entirely of ice that never melts, blooming only during the coldest nights." },
      { name: "Ice Willow", description: "A weeping tree whose branches are heavy with icicles, creating a natural wind chime in the breeze." }
    ],
    soundProfile: 'Crackling ice, deep silence, wind howls',
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
    creatures: ['Lizard'],
    creatureDetails: [
      { name: "Lizard", description: "The Frost-Scale Lizard moves slowly to conserve heat, its blue scales perfectly camouflaging it against the ice." }
    ],
    artifact: {
      name: "Frost-Fire Gem",
      description: "Cold to the touch, yet it glows with an inner, smokeless warmth.",
      icon: "💎"
    },
    constellation: {
      name: "The Frost Wyrm",
      description: "A winding serpent of blue stars said to guard the secrets of the ice.",
      myth: "The Wyrm was a guardian of the north who breathed the first winter into existence to preserve the world's beauty from decay."
    }
  },
  {
    name: 'Velvet Twilight',
    description: 'A dreamscape bathed in lavender hues, where the boundary between earth and mystery dissolves into starlight.',
    lore: "A realm caught in the moment between wakefulness and dreams, where shadows detach and dance on their own. The air is thick with the scent of night-blooming jasmine, and the ground feels soft as velvet underfoot. It is a place for introspection, where the stars seem close enough to touch and the universe whispers its riddles.",
    journalEntry: "Day 7: I am losing track of when I am awake and when I am asleep. The purple haze confusing the horizon makes everything look like a painting. I saw a shadow move today—my own, I think, but it moved a second after I did. The air smells sweet, intoxicatingly so. I could stay here forever and simply dream.",
    wisdom: "The night hides nothing, it only waits for you to see.",
    features: ['Purple Haze', 'Starlight Sands', 'Mystic Fog'],
    factoid: "Compass needles spin wildly here due to the magnetic sands.",
    climate: "Cool",
    weather: "Foggy",
    difficulty: "Easy",
    flora: ['Moonflower', 'Shadow Fern', 'Violet Moss'],
    floraDetails: [
      { name: "Moonflower", description: "Large, white blossoms that open rapidly at dusk, releasing a potent, sleep-inducing fragrance." },
      { name: "Shadow Fern", description: "Dark, semi-translucent fronds that seem to absorb light rather than reflect it." },
      { name: "Violet Moss", description: "Soft, velvet-like ground cover that cushions footsteps, making travel nearly silent." }
    ],
    soundProfile: 'Low rhythmic pulse, insect chirps',
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
    creatures: ['Scorpion'],
    creatureDetails: [
      { name: "Scorpion", description: "The Twilight Scorpion glows faintly in the dark, using its bioluminescence to lure curious prey." }
    ],
    artifact: {
      name: "Moon-Dust Vial",
      description: "A small vial containing dust that shimmers in sync with the moon's phases.",
      icon: "🧪"
    },
    constellation: {
      name: "The Dream Weaver",
      description: "A complex web of faint stars that is said to catch nightmares.",
      myth: "The Weaver sits at the edge of the universe, spinning the threads of fate and dreams into the tapestry of the night sky."
    }
  },
  {
    name: 'Golden Hour',
    description: 'An eternal embrace of amber light, casting long, soft shadows across a landscape of pure nostalgia.',
    lore: "A place where the sun pauses its descent, bathing the land in a nostalgic, amber embrace forever. The shadows here stretch long but never darken, holding the warmth of a day that refuses to end. It feels like a memory you can walk through, a suspended moment of perfect clarity and peace before the night falls.",
    journalEntry: "Day 21: It feels like 5 PM on a Sunday afternoon, forever. That specific feeling of having done enough, of resting before the week begins. The light is perfect—gold, heavy, and thick. I sat for hours watching a single blade of amber wheat sway in the breeze. I miss home, yet I feel entirely at home here.",
    wisdom: "Nostalgia is a warm place to visit, but a cold place to stay.",
    features: ['Amber Light', 'Long Shadows', 'Warmth'],
    factoid: "Photographers flock here, as the lighting is considered perfect at any angle.",
    climate: "Warm",
    weather: "Clear",
    difficulty: "Easy",
    flora: ['Amber Wheat', 'Sunburst Succulent', 'Glow Berry'],
    floraDetails: [
      { name: "Amber Wheat", description: "Tall, golden stalks that yield a grain tasting faintly of honey and sunshine." },
      { name: "Sunburst Succulent", description: "Fleshy leaves arranged in a radial pattern that store heat, remaining warm even in the shade." },
      { name: "Glow Berry", description: "Small, tart fruits that emit a faint, warm light when ripe." }
    ],
    soundProfile: 'Cicada buzz, warm breeze, rustling grass',
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
    creatures: ['Camel', 'Fox'],
    creatureDetails: [
      { name: "Camel", description: "Golden-hued Camels that move with a slow, deliberate grace, perfectly adapted to the eternal afternoon." },
      { name: "Fox", description: "The Amber Fox is playful and curious, often seen chasing the long shadows cast by the setting sun." }
    ],
    artifact: {
      name: "Amber Chronometer",
      description: "A pocket watch that doesn't tick, forever frozen at sunset.",
      icon: "🕰️"
    },
    constellation: {
      name: "The Golden Scythe",
      description: "A curved line of bright stars symbolizing the harvest of time.",
      myth: "The Scythe reminds us that all things must end, but the harvest—the memories we gather—sustains us through the winter."
    }
  },
  {
    name: 'Rose Horizon',
    description: 'Soft pink waves of sand stretching into forever, painting the world with the gentle blush of a first love.',
    lore: "The sands here are stained by the petals of a billion ancient roses that once bloomed before the great drought. Though the flowers are gone, their spirit remains in the soft, blushing dunes that seem to pulse with a gentle heartbeat. Visitors often report vivid dreams of gardens long lost to time.",
    journalEntry: "Day 15: The sand is fine, like cosmetic powder. When the wind blows, it looks like pink smoke. I dug into a dune today and found what looked like a fossilized thorn. The legend must be true. At night, the wind sounds like whispering lovers. It is lonely, but a beautiful kind of loneliness.",
    wisdom: "Love, like the desert wind, shapes us even when unseen.",
    features: ['Pink Sands', 'Floral Scent', 'Soft Light'],
    factoid: "The air here actually smells faintly of rosewater.",
    climate: "Temperate",
    weather: "Breezy",
    difficulty: "Easy",
    flora: ['Petal Grass', 'Blushing Cactus', 'Rosemary Scrub'],
    floraDetails: [
      { name: "Petal Grass", description: "Soft, pink-tinged blades that feel like flower petals to the touch." },
      { name: "Blushing Cactus", description: "A spine-free cactus that turns a deeper shade of red when approached." },
      { name: "Rosemary Scrub", description: "Low-lying bushes that release a scent similar to rosemary and rose when stepped on." }
    ],
    soundProfile: 'Soft whispers, flutter of wings',
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
    creatures: ['Lizard', 'Fox'],
    creatureDetails: [
      { name: "Lizard", description: "A small, pinkish lizard that mimics the appearance of a fallen petal to hide from predators." },
      { name: "Fox", description: "The Rosy Fox has incredibly soft fur and is known to be surprisingly affectionate if approached slowly." }
    ],
    artifact: {
      name: "Petrified Rose",
      description: "A stone flower that, when warmed by hands, smells faintly of perfume.",
      icon: "🌹"
    },
    constellation: {
      name: "The Blooming Rose",
      description: "A cluster of red-tinted stars that resembles an opening flower.",
      myth: "A celestial gift from a star-crossed lover, placed in the sky so their beauty would never wilt."
    }
  },
  {
    name: 'Obsidian Rift',
    description: 'A striking landscape of dark, volcanic glass and ash, where the earth represents raw, unbridled power.',
    lore: "Forged in the fires of a primordial era, the Obsidian Rift is a testament to the planet's volatile youth. The ground is jagged and sharp, composed of black glass that reflects the sky like a shattered mirror. Beneath the surface, the earth still hums with dormant energy, and steam vents hiss warnings to those who tread too heavily.",
    journalEntry: "Day 2: The ground is sharp and unforgiving. Walking here requires intention. The black glass reflects the sky so perfectly that it's sometimes hard to tell up from down. It's hot—dry, baking heat that radiates from the stone long after the sun sets. I feel small here, insignificant against the raw power of the earth.",
    wisdom: "Strength is forged in the fires of adversity.",
    features: ['Volcanic Glass', 'Steam Vents', 'Sharp Terrain'],
    factoid: "The obsidian shards here are sharper than surgical steel.",
    climate: "Hot",
    weather: "Ashy",
    difficulty: "Hard",
    flora: ['Ash Fern', 'Magma Root', 'Charred Bush'],
    floraDetails: [
      { name: "Ash Fern", description: "Grey, brittle-looking fronds that thrive in sulfur-rich soil." },
      { name: "Magma Root", description: "A plant with deep roots that tap into geothermal heat; its veins glow faint orange at night." },
      { name: "Charred Bush", description: "Looks like dead wood, but is actually alive and fire-resistant, producing small, hard berries." }
    ],
    soundProfile: 'Hissing steam, crunching glass, deep rumble',
    colors: {
      ground: '#2D2D2D', // Dark Grey
      sky: '#FFD1DC',    // Pale Red/Pink (contrast)
      fog: '#2D2D2D',
      groundHigh: '#4A4A4A', // Lighter Grey
      groundLow: '#1A1A1A'   // Black
    },
    terrainParams: {
      roughness: 0.8,
      height: 3.0,
      scale: 2.5
    },
    creatures: ['Scorpion', 'Lizard'],
    creatureDetails: [
      { name: "Scorpion", description: "Armor-plated scorpions with obsidian-black shells that blend perfectly with the glass terrain." },
      { name: "Lizard", description: "Fast-moving lizards with toughened skin capable of withstanding the sharp rocks and intense heat." }
    ],
    artifact: {
      name: "Volcanic Geode",
      description: "Pitch black on the outside, but cracking it open reveals burning red crystal.",
      icon: "🌋"
    },
    constellation: {
      name: "The Obsidian Shield",
      description: "A rigid square of stars that stands guard against the void.",
      myth: "The Shield was raised by the Earth Titan to protect the young world from the scouring winds of the cosmos."
    }
  },
  {
    name: 'Nebula Plains',
    description: 'A cosmic expanse where the ground mirrors the galaxy above, blurring the line between planet and space.',
    lore: "It is said that a piece of the night sky fell here eons ago, infusing the soil with stardust. The flora glows with a bioluminescent pulse, and the sand sparkles with colors not found elsewhere on earth. Gravity feels lighter here, and the horizon seems to curve upward, giving the illusion of walking inside a nebula.",
    journalEntry: "Day 9: I haven't needed my lantern for days. The plants provide enough light to read by—a soft, pulsing blue. The sand glitters with iridescent specks that stick to my boots like diamond dust. Looking up at the night sky, I feel a strange vertigo, as if I could simply float away into the stars.",
    wisdom: "We are all made of starstuff, longing to return.",
    features: ['Bioluminescence', 'Starry Ground', 'Low Gravity Feel'],
    factoid: "The soil samples from this region contain trace elements found only in meteorites.",
    climate: "Cool",
    weather: "Clear",
    difficulty: "Moderate",
    flora: ['Star Lily', 'Glowing Moss', 'Cosmic Vine'],
    floraDetails: [
      { name: "Star Lily", description: "A flower with five pointed petals that emits a steady white light." },
      { name: "Glowing Moss", description: "Covers rocks in a carpet of neon blue and purple, pulsing slowly like a heartbeat." },
      { name: "Cosmic Vine", description: "Climbs upward with no support, reaching towards the sky as if trying to return home." }
    ],
    soundProfile: 'Ethereal synth tones, quiet static',
    colors: {
      ground: '#2E2B5F', // Deep Blue-Purple
      sky: '#E0B0FF',    // Mauve
      fog: '#2E2B5F',
      groundHigh: '#483D8B', // Dark Slate Blue
      groundLow: '#191970'   // Midnight Blue
    },
    terrainParams: {
      roughness: 0.3,
      height: 1.2,
      scale: 7
    },
    creatures: ['Fox'],
    creatureDetails: [
      { name: "Fox", description: "The Nebula Fox has fur that shifts color with the angle of light, resembling a walking aurora." }
    ],
    artifact: {
      name: "Star-Metal Compass",
      description: "A compass that points not North, but directly up towards the stars.",
      icon: "🧭"
    },
    constellation: {
      name: "The Cosmic Navigator",
      description: "A pointer of stars that always aligns with the galactic center.",
      myth: "The Navigator was a lost god who turned himself into stars to ensure no traveler would ever be without a guide."
    }
  },
  {
    name: 'Echo Valley',
    description: 'A verdant, misty basin hidden within the desert, where sounds loop and layer into haunting melodies.',
    lore: "Protected by high canyon walls, this valley traps moisture and sound alike. The mist clings to the ground, obscuring the path but nourishing a unique ecosystem of giant succulents. Every sound made here echoes for minutes, layering over itself until speech becomes song and footsteps become thunder.",
    journalEntry: "Day 6: I have to be careful what I say. A simple 'hello' repeats for minutes, morphing into a choir of my own voice. It's maddening and beautiful. The mist dampens the visual world but amplifies the auditory one. I sat by a rock and listened to the echo of a bird for an hour.",
    wisdom: "Listen carefully; the world is always speaking to you.",
    features: ['Eternal Mist', 'Sonic Echoes', 'Giant Succulents'],
    factoid: "The acoustics of the valley are studied by musicians for their natural reverb.",
    climate: "Humid",
    weather: "Foggy",
    difficulty: "Moderate",
    flora: ['Mist Aloe', 'Echo Fern', 'Giant Agave'],
    floraDetails: [
      { name: "Mist Aloe", description: "Broad leaves that collect dew from the fog, providing a source of fresh water." },
      { name: "Echo Fern", description: "Its leaves vibrate sympathetically with nearby sounds, creating a soft rustling chorus." },
      { name: "Giant Agave", description: "Massive succulents that tower over travelers, their spires piercing the mist layer." }
    ],
    soundProfile: 'Water droplets, echoing calls, soft rustle',
    colors: {
      ground: '#8FBC8F', // Dark Sea Green
      sky: '#F0FFF0',    // Honeydew
      fog: '#8FBC8F',
      groundHigh: '#90EE90', // Light Green
      groundLow: '#2F4F4F'   // Dark Slate Gray
    },
    terrainParams: {
      roughness: 0.5,
      height: 2.8,
      scale: 3
    },
    creatures: ['Camel', 'Lizard'],
    creatureDetails: [
      { name: "Camel", description: "Green-tinged Camels that feed on the abundant moisture in the giant succulents." },
      { name: "Lizard", description: "The Echo Lizard communicates by drumming its tail on hollow logs, utilizing the valley's acoustics." }
    ],
    artifact: {
      name: "Whispering Shell",
      description: "Hold it to your ear to hear the echoes of conversations from centuries past.",
      icon: "🐚"
    },
    constellation: {
      name: "The Echoing Horn",
      description: "A spiraling arrangement of stars resembling a great horn.",
      myth: "Legend says the Horn was blown at the creation of the world, and its sound is still echoing through the universe."
    }
  },
  {
    name: 'Crystal Canyons',
    description: 'A sharp, prismatic landscape where giant crystal formations refract light into a thousand rainbows.',
    lore: "Formed by intense geothermal pressure and rapid cooling, the Crystal Canyons are a geological marvel. The towering spires of quartz and selenite sing when the wind passes through them, creating a natural pipe organ. The light here is dazzling, splitting into spectral colors that dance across the canyon walls.",
    journalEntry: "Day 18: I need sunglasses even at dawn. The entire world is a prism. I tapped one of the smaller crystals with my walking stick, and it emitted a pure, resonant tone that lasted for nearly a minute. It feels fragile here, like walking inside a chandelier, yet these structures have stood for millennia.",
    wisdom: "Clarity comes when we stop trying to control the light.",
    features: ['Prismatic Light', 'Singing Crystals', 'Sharp Geometry'],
    factoid: "The largest crystal here is over 40 meters tall and flawless.",
    climate: "Arid",
    weather: "Radiant",
    difficulty: "Hard",
    flora: ['Glass Reed', 'Prism Flower', 'Quartz Lichen'],
    floraDetails: [
      { name: "Glass Reed", description: "Translucent stalks that are brittle to the touch but sharp as razors." },
      { name: "Prism Flower", description: "Geometric petals that refract light, creating mini-rainbows around the plant." },
      { name: "Quartz Lichen", description: "A hard, crusty organism that slowly eats away at the crystal formations." }
    ],
    soundProfile: 'High-pitched ringing, wind chimes, crunching gravel',
    colors: {
      ground: '#E0FFFF', // Light Cyan
      sky: '#F0FFFF',    // Azure Mist
      fog: '#E0FFFF',
      groundHigh: '#AFEEEE', // Pale Turquoise
      groundLow: '#B0E0E6'   // Powder Blue
    },
    terrainParams: {
      roughness: 0.9,
      height: 3.5,
      scale: 3
    },
    creatures: ['Lizard'],
    creatureDetails: [
      { name: "Lizard", description: "The Crystalback Lizard has translucent skin, making it nearly invisible against the quartz." }
    ],
    artifact: {
      name: "Prism Shard",
      description: "A shard that turns any light passing through it into a solid rainbow bridge.",
      icon: "💎"
    },
    constellation: {
      name: "The Prism Key",
      description: "A geometric shape of stars that looks like a keyhole.",
      myth: "The Key unlocks the door to the realm of light, where thoughts become visible and colors can be heard."
    }
  },
  {
    name: 'Crimson Waste',
    description: 'A rust-colored expanse of ancient iron sands, evoking the desolate beauty of a forgotten planet.',
    lore: "The iron-rich sands of the Crimson Waste have rusted over millions of years, painting the landscape in deep shades of blood and clay. It is a place of ancient ruins, half-buried in the shifting dunes, hinting at a civilization that once thrived before the great oxidation. The wind here carries the scent of metal and old earth.",
    journalEntry: "Day 25: Everything I own is now covered in red dust. It gets everywhere. But the sunsets... my god, the sunsets. The red dust in the atmosphere turns the sun into a blood-orange orb that consumes half the sky. I found a pottery shard today with markings I didn't recognize. We are not the first to walk here.",
    wisdom: "Time erodes stone, but memory endures.",
    features: ['Red Dust', 'Ancient Ruins', 'Metallic Scent'],
    factoid: "The magnetic field here is strong enough to lift small metallic objects.",
    climate: "Dry",
    weather: "Dusty",
    difficulty: "Moderate",
    flora: ['Iron Weed', 'Rust Bush', 'Copper Vine'],
    floraDetails: [
      { name: "Iron Weed", description: "Tough, wire-like plants that extract iron from the soil, making them magnetic." },
      { name: "Rust Bush", description: "Its leaves are coated in a fine red powder that stains anything it touches." },
      { name: "Copper Vine", description: "Glows with a metallic green sheen, often found wrapping around ancient ruins." }
    ],
    soundProfile: 'Metallic scraping, low wind drone, shifting sand',
    colors: {
      ground: '#8B4513', // Saddle Brown
      sky: '#FF7F50',    // Coral
      fog: '#8B4513',
      groundHigh: '#A0522D', // Sienna
      groundLow: '#800000'   // Maroon
    },
    terrainParams: {
      roughness: 0.6,
      height: 2.0,
      scale: 5
    },
    creatures: ['Scorpion', 'Camel'],
    creatureDetails: [
      { name: "Scorpion", description: "Large, red scorpions with heavy pincers designed to crush the tough beetles of the wastes." },
      { name: "Camel", description: "The Crimson Camel has thick, coarse fur to protect against sandstorms and carries heavy loads with ease." }
    ],
    artifact: {
      name: "Ancient Gear",
      description: "A rusted cog that still spins perpetually without any power source.",
      icon: "⚙️"
    },
    constellation: {
      name: "The Ancient Gear",
      description: "A circular formation of stars with 'teeth' pointing outward.",
      myth: "Remnants of the Great Machine that once turned the world, now broken and scattered across the sky."
    }
  }
]
