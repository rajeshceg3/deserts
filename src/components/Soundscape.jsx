import { motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

export const Soundscape = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContext = useRef(null);
  const gainNode = useRef(null);

  const initAudio = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext.current = new AudioContext();

    // Create Pink Noise Buffer (5 seconds)
    const bufferSize = audioContext.current.sampleRate * 5;
    const buffer = audioContext.current.createBuffer(1, bufferSize, audioContext.current.sampleRate);
    const output = buffer.getChannelData(0);

    let b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;

    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.075076;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // Compensate for gain
        b6 = white * 0.115926;
    }

    // Nodes
    gainNode.current = audioContext.current.createGain();
    gainNode.current.gain.value = 0; // Start silent

    const filter = audioContext.current.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    // Wind modulation
    const osc = audioContext.current.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 0.1; // Slow wind changes
    const oscGain = audioContext.current.createGain();
    oscGain.gain.value = 200; // Range of frequency change
    osc.connect(oscGain);
    oscGain.connect(filter.frequency);
    osc.start();

    // Source
    const sourceNode = audioContext.current.createBufferSource();
    sourceNode.buffer = buffer;
    sourceNode.loop = true;
    sourceNode.connect(filter);
    filter.connect(gainNode.current);
    gainNode.current.connect(audioContext.current.destination);

    sourceNode.start();
  };

  const toggleSound = () => {
    try {
      if (!audioContext.current) {
        initAudio();
      }

      // Resume if suspended (browser policy often suspends initially)
      if (audioContext.current.state === 'suspended') {
        audioContext.current.resume();
      }

      const currentTime = audioContext.current.currentTime;

      if (isPlaying) {
        // Fade out
        gainNode.current.gain.cancelScheduledValues(currentTime);
        gainNode.current.gain.exponentialRampToValueAtTime(
          0.001,
          currentTime + 1
        );
        // Ensure it goes to absolute zero after fade
        gainNode.current.gain.setValueAtTime(0, currentTime + 1.1);
        setIsPlaying(false);
      } else {
        // Fade in
        gainNode.current.gain.cancelScheduledValues(currentTime);
        // Exponential ramp requires starting from a non-zero value
        const currentValue = gainNode.current.gain.value;
        if (currentValue < 0.001) {
            gainNode.current.gain.setValueAtTime(0.001, currentTime);
        } else {
            gainNode.current.gain.setValueAtTime(currentValue, currentTime);
        }

        gainNode.current.gain.exponentialRampToValueAtTime(
          0.1,
          currentTime + 1
        );
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Audio toggle failed:", error);
      setIsPlaying(false);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
        if (audioContext.current) {
            const context = audioContext.current;
            context.close().catch(e => console.error("Error closing AudioContext:", e));
            audioContext.current = null;
        }
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1, duration: 0.8 }}
    >
      <button
        onClick={toggleSound}
        className="bg-black/30 backdrop-blur-md text-white p-4 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
        aria-label={isPlaying ? 'Mute Ambient Sound' : 'Play Ambient Sound'}
      >
        {isPlaying ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
        )}
      </button>
    </motion.div>
  );
};
