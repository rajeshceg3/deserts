import { noise2D } from './noise';
import * as THREE from 'three';

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

  // Apply Edge Falloff (Skirt) to hide plane edges
  // Plane is typically 100x100, so radius ~50
  const dist = Math.sqrt(x * x + z * z);
  const falloffStart = 40.0;
  const falloffEnd = 48.0;

  if (dist > falloffStart) {
      if (dist > falloffEnd) {
          total = -20.0;
      } else {
          // Normalized distance within falloff zone (0 to 1)
          const t = (dist - falloffStart) / (falloffEnd - falloffStart);
          // Smoothstep interpolation
          const smoothT = t * t * (3 - 2 * t);
          // Drop the terrain down significantly at the edges
          total = THREE.MathUtils.lerp(total, -20.0, smoothT);
      }
  }

  return total;
};
