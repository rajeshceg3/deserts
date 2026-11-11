import { useEffect, useRef } from 'react';
import { makeCtx } from '../audio/soundscape-layers.js';
import { LAYER_DEFS, sceneFor } from '../audio/desertSoundscape.js';

/* Opt-in realm soundscape. Builds one AudioContext while sound is on,
 * renders each realm's layers once, and crossfades when the realm or the
 * light preset changes. Closing the context on mute, as before. */
export function useSoundscape(on, climate, weather, light) {
  const engineRef = useRef(null);

  useEffect(() => {
    if (!on) return undefined;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const context = new Ctx();
    const master = context.createGain();
    master.gain.value = 0.22;
    master.connect(context.destination);
    const buffers = new Map();
    let current = [];
    let alive = true;

    const bufferFor = (id) => {
      if (!buffers.has(id)) {
        const def = LAYER_DEFS[id];
        const c = makeCtx(context.sampleRate, def.seconds || 10, def.seed || 1);
        const out = def.render(c) || c;
        const b = context.createBuffer(2, out.L.length, context.sampleRate);
        b.getChannelData(0).set(out.L);
        b.getChannelData(1).set(out.R);
        buffers.set(id, b);
      }
      return buffers.get(id);
    };

    const engine = {
      context,
      setScene({ climate: cl, weather: w, light: l }) {
        const t = context.currentTime;
        const next = sceneFor(cl, w, l).map(({ layer, gain }) => {
          const source = context.createBufferSource();
          source.buffer = bufferFor(layer);
          source.loop = true;
          const g = context.createGain();
          g.gain.value = 0;
          g.gain.setTargetAtTime(gain, t, 0.8);
          source.connect(g);
          g.connect(master);
          source.start();
          return { source, g };
        });
        const old = current;
        current = next;
        old.forEach(({ source, g }) => {
          g.gain.setTargetAtTime(0, t, 0.5);
          setTimeout(() => {
            if (!alive) return;
            try { source.stop(); source.disconnect(); g.disconnect(); } catch { /* already stopped */ }
          }, 3000);
        });
      },
      dispose() {
        alive = false;
        current.forEach(({ source }) => { try { source.stop(); } catch { /* already stopped */ } });
        void context.close();
      },
    };

    engineRef.current = engine;
    window.__soundscape = engine;
    engine.setScene({ climate, weather, light });
    void context.resume();
    return () => {
      engine.dispose();
      engineRef.current = null;
      if (window.__soundscape === engine) delete window.__soundscape;
    };
    // The engine is created only when sound turns on; scene changes use the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);

  useEffect(() => {
    engineRef.current?.setScene({ climate, weather, light });
  }, [climate, weather, light]);
}
