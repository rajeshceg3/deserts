import { useRef, useCallback, useEffect } from 'react';

export const useUISound = () => {
  const audioContext = useRef(null);

  useEffect(() => {
    return () => {
      if (audioContext.current) {
        audioContext.current.close().catch(e => console.error("Error closing AudioContext:", e));
      }
    }
  }, [])

  const initAudio = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.current.state === 'suspended') {
      audioContext.current.resume();
    }
  };

  const play = useCallback((type) => {
    initAudio();
    const ctx = audioContext.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'hover') {
      // High, short "tick"
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.start(now);
      osc.stop(now + 0.05);
    }
    else if (type === 'click') {
      // Lower, "pop"
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.start(now);
      osc.stop(now + 0.1);
    }
    else if (type === 'transition') {
      // Soft swoosh
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(600, now + 0.3);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.15);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);

      osc.start(now);
      osc.stop(now + 0.3);
    }
  }, []);

  return { play };
};
