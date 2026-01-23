import React, { useEffect, useRef, useState } from 'react'

export const Soundscape = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioContext = useRef(null)
  const gainNode = useRef(null)

  const toggleSound = () => {
    if (!audioContext.current) {
      initAudio()
    }

    if (audioContext.current.state === 'suspended') {
      audioContext.current.resume()
    }

    if (isPlaying) {
      gainNode.current.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + 1)
      setIsPlaying(false)
    } else {
      gainNode.current.gain.exponentialRampToValueAtTime(0.1, audioContext.current.currentTime + 1)
      setIsPlaying(true)
    }
  }

  const initAudio = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    audioContext.current = new AudioContext()

    // Create Pink Noise
    const bufferSize = 4096
    const pinkNoise = (function() {
        let b0, b1, b2, b3, b4, b5, b6
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0
        const node = audioContext.current.createScriptProcessor(bufferSize, 1, 1)
        node.onaudioprocess = function(e) {
            const output = e.outputBuffer.getChannelData(0)
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1
                b0 = 0.99886 * b0 + white * 0.0555179
                b1 = 0.99332 * b1 + white * 0.075076
                b2 = 0.96900 * b2 + white * 0.1538520
                b3 = 0.86650 * b3 + white * 0.3104856
                b4 = 0.55000 * b4 + white * 0.5329522
                b5 = -0.7616 * b5 - white * 0.0168980
                output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
                output[i] *= 0.11 // (roughly) compensate for gain
                b6 = white * 0.115926
            }
        }
        return node
    })()

    // Lowpass filter for wind howl
    const filter = audioContext.current.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 400
    filter.Q.value = 1

    // Modulate filter frequency for "gusts"
    const osc = audioContext.current.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = 0.1 // Slow wind changes
    const oscGain = audioContext.current.createGain()
    oscGain.gain.value = 200 // Range of frequency change
    osc.connect(oscGain)
    oscGain.connect(filter.frequency)
    osc.start()

    // Master Gain
    gainNode.current = audioContext.current.createGain()
    gainNode.current.gain.value = 0.001

    pinkNoise.connect(filter)
    filter.connect(gainNode.current)
    gainNode.current.connect(audioContext.current.destination)
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioContext.current) {
        audioContext.current.close()
      }
    }
  }, [])

  return (
    <div className="absolute top-8 right-8 pointer-events-auto mr-56">
       {/* Positioned to the left of the Time Control */}
      <button
        onClick={toggleSound}
        className="bg-black/30 backdrop-blur-md text-white p-3 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
        title={isPlaying ? "Mute Ambient Sound" : "Play Ambient Sound"}
      >
        {isPlaying ? (
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
        ) : (
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line></svg>
        )}
      </button>
    </div>
  )
}
