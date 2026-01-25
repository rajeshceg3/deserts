import { createNoise2D } from 'simplex-noise';

// Create a single instance of noise to be shared or recreated if needed.
// Ideally, we want the same seed if we want reproducibility, but createNoise2D uses Math.random by default.
// If the app reloads, terrain changes. That's fine for now.
const noise2D = createNoise2D();

/**
 * Calculates the height of the terrain at a given x, z coordinate.
 * @param {number} x - The x coordinate.
 * @param {number} z - The z coordinate.
 * @param {object} params - The terrain parameters (height, scale).
 * @returns {number} The calculated height (y).
 */
export const getTerrainHeight = (x, z, params) => {
  const { height, scale } = params;

  // Matches logic in Terrain.jsx
  // noise2D(x / (10 * scale), z / (10 * scale)) * height * 1.5 +
  // noise2D(x / (3 * scale), z / (3 * scale)) * (height / 2)

  return noise2D(x / (10 * scale), z / (10 * scale)) * height * 1.5 +
         noise2D(x / (3 * scale), z / (3 * scale)) * (height / 2);
};
