/* Desert Realms soundscape: each invented realm sounds like its imagined
 * climate and weather, and the mix shifts with the light you choose.
 * All synthesis - no samples, no voice, nothing tied to the realm names. */

import {
  windNoise, whistleWind, insects, birdChirps, howls, rumble,
} from './soundscape-layers.js';

const SEED = 904;

export const LAYER_DEFS = {
  windSoft:    { seconds: 10, seed: SEED + 1,  render: (c) => windNoise(c, { color: 0.02,  gustDepth: 0.5,  base: 0.45, seed: SEED + 1 }) },
  windBreezy:  { seconds: 10, seed: SEED + 2,  render: (c) => windNoise(c, { color: 0.02,  gustDepth: 0.72, base: 0.4,  seed: SEED + 2 }) },
  windCold:    { seconds: 10, seed: SEED + 3,  render: (c) => windNoise(c, { color: 0.05,  gustDepth: 0.3,  base: 0.4,  seed: SEED + 3 }) },
  windHot:     { seconds: 10, seed: SEED + 4,  render: (c) => windNoise(c, { color: 0.015, gustDepth: 0.5,  base: 0.45, seed: SEED + 4 }) },
  windMuffled: { seconds: 10, seed: SEED + 5,  render: (c) => windNoise(c, { color: 0.006, gustDepth: 0.35, base: 0.45, seed: SEED + 5 }) },
  windDry:     { seconds: 10, seed: SEED + 6,  render: (c) => windNoise(c, { color: 0.03,  gustDepth: 0.55, base: 0.45, seed: SEED + 6 }) },
  grit:        { seconds: 10, seed: SEED + 7,  render: (c) => windNoise(c, { color: 0.28,  gustDepth: 0.4,  base: 0.3,  seed: SEED + 7 }) },
  whistleIce:  { seconds: 10, seed: SEED + 8,  render: (c) => whistleWind(c, { fMin: 600, fMax: 1700, gain: 0.5, seed: SEED + 8 }) },
  whistleRock: { seconds: 10, seed: SEED + 9,  render: (c) => whistleWind(c, { fMin: 350, fMax: 1100, gain: 0.45, seed: SEED + 9 }) },
  ashRumble:   { seconds: 10, seed: SEED + 10, render: (c) => rumble(c, { gain: 0.4, swellSec: 6, seed: SEED + 10 }) },
  heatShimmer: { seconds: 10, seed: SEED + 11, render: (c) => insects(c, { f: 5800, pulseHz: 31, gain: 0.5, q: 26, seed: SEED + 11 }) },
  birdsDawn:   { seconds: 10, seed: SEED + 12, render: (c) => birdChirps(c, { count: 6, fLo: 2400, fHi: 3800, gain: 0.5, minGap: 0.9, syllables: 2, seed: SEED + 12 }) },
  nightInsects:{ seconds: 10, seed: SEED + 13, render: (c) => insects(c, { f: 4600, pulseHz: 19, gain: 0.5, q: 20, seed: SEED + 13 }) },
  creatureNight:{ seconds: 10, seed: SEED + 14, render: (c) => howls(c, { count: 1, f0: 380, f1: 620, dur: 2.8, gain: 0.4, seed: SEED + 14 }) },
};

/* Pick the base wind for a realm's imagined climate + weather. */
function windFor(climate, weather) {
  if (climate === 'Frigid') return 'windCold';
  if (climate === 'Hot') return 'windHot';
  if (climate === 'Humid' || weather === 'Foggy') return 'windMuffled';
  if (climate === 'Dry' || weather === 'Dusty') return 'windDry';
  if (weather === 'Breezy') return 'windBreezy';
  return 'windSoft';
}

/* Light preset: .3 dawn, .5 noon, .7 dusk, .95 night. */
export function sceneFor(climate, weather, light) {
  const layers = [{ layer: windFor(climate, weather), gain: 0.85 }];
  if (climate === 'Frigid') layers.push({ layer: 'whistleIce', gain: 0.32 });
  if (weather === 'Ashy') layers.push({ layer: 'ashRumble', gain: 0.3 });
  if (weather === 'Radiant' || climate === 'Arid') layers.push({ layer: 'whistleRock', gain: 0.28 });
  if (weather === 'Dusty') layers.push({ layer: 'grit', gain: 0.22 });
  const hot = climate === 'Hot' || climate === 'Arid' || weather === 'Radiant';
  if (light < 0.4) layers.push({ layer: 'birdsDawn', gain: hot ? 0.12 : 0.3 });
  else if (light >= 0.9) {
    layers.push({ layer: 'nightInsects', gain: 0.3 });
    layers.push({ layer: 'creatureNight', gain: 0.22 });
  } else if (light < 0.6 && hot) layers.push({ layer: 'heatShimmer', gain: 0.26 });
  if (light >= 0.7 && light < 0.9) layers[0] = { ...layers[0], gain: 0.7 }; // dusk calm
  return layers;
}
