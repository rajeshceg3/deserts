import { noise2D } from './noise';

/**
 * Calculates the height of the terrain at a given x, z coordinate using Fractal Brownian Motion (FBM).
 * @param {number} x - The x coordinate.
 * @param {number} z - The z coordinate.
 * @param {object} params - The terrain parameters (height, scale).
 * @returns {number} The calculated height (y).
 */
export const getTerrainHeight = (x, z, params) => {
  const { height, scale } = params;

  let total = 0;
  let frequency = 1 / (10 * scale); // Base frequency
  let amplitude = height * 1.2; // Base amplitude
  // Used for normalizing result to 0.0 - 1.0 range if needed, but here we sum directly

  const octaves = 4;
  const persistence = 0.5;
  const lacunarity = 2.0;

  for(let i=0; i<octaves; i++) {
      total += noise2D(x * frequency, z * frequency) * amplitude;

      amplitude *= persistence;
      frequency *= lacunarity;
  }

  // Optional: Add a subtle twist or second layer for more organic feel if needed.
  // But FBM usually provides enough "craggy" look.

  return total;
};
