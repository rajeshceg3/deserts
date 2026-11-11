import { createNoise2D } from 'simplex-noise';

// Create a singleton noise instance to ensure consistent results across the application
let seed=41573;
const noise2D = createNoise2D(()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646});

export { noise2D };
