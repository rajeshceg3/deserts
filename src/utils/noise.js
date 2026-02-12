import { createNoise2D } from 'simplex-noise';

// Create a singleton noise instance to ensure consistent results across the application
const noise2D = createNoise2D();

export { noise2D };
