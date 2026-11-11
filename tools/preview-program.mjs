import { LAYER_DEFS, sceneFor } from '../src/audio/desertSoundscape.js';

/* Representative scenes across climates, weathers and light presets. */
export default {
  defaultScene: 'temperateNoon',
  layers: LAYER_DEFS,
  scenes: {
    temperateDawn: sceneFor('Temperate', 'Clear', 0.3),
    temperateNoon: sceneFor('Temperate', 'Clear', 0.5),
    breezyNoon: sceneFor('Temperate', 'Breezy', 0.5),
    frigidNight: sceneFor('Frigid', 'Snowy', 0.95),
    foggyDusk: sceneFor('Cool', 'Foggy', 0.7),
    hotAshyNoon: sceneFor('Hot', 'Ashy', 0.5),
    aridRadiantNoon: sceneFor('Arid', 'Radiant', 0.5),
    dustyNight: sceneFor('Dry', 'Dusty', 0.95),
    humidFoggyDawn: sceneFor('Humid', 'Foggy', 0.3),
  },
};
