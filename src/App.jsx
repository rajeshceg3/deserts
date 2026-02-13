import React, { useState, Suspense, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Experience } from './components/Experience'
import { Overlay } from './components/Overlay'
import { Cursor } from './components/Cursor'
import { Loader } from './components/Loader'
import ErrorBoundary from './components/ErrorBoundary'
import * as THREE from 'three'
import { useStore } from './store'
import { deserts } from './data/deserts'
import { getSkyColor } from './utils/colorUtils'

function App() {
  const [started, setStarted] = useState(false)
  const [experienceReady, setExperienceReady] = useState(false)
  const containerRef = useRef()

  // Optimize Performance: Subscribe to store changes directly to update DOM style
  // This avoids re-rendering the entire App component (and Canvas) on every frame/drag of the time slider
  useEffect(() => {
    const updateBackground = (state) => {
        if (!containerRef.current) return
        const desert = deserts[state.currentDesertIndex]
        if (desert) {
            const color = getSkyColor(state.dayNightCycle, desert.colors)
            containerRef.current.style.backgroundColor = '#' + color.getHexString()
        }
    }

    // Subscribe to all store changes
    const unsub = useStore.subscribe(updateBackground)

    // Initial set
    updateBackground(useStore.getState())

    return unsub
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full h-screen relative cursor-none overflow-hidden transition-colors duration-500 ease-linear"
    >
      <ErrorBoundary>
        <Cursor />

        {/* Loader handles the initial loading state and the 'Enter' interaction */}
        <Loader started={started} onStarted={() => setStarted(true)} ready={experienceReady} />

        {/* UI Overlay appears only after the user has entered */}
        <Overlay started={started} />

        <Canvas
          shadows
          dpr={[1, 2]} // Handle high-DPI screens
          camera={{
            fov: 45,
            near: 0.1,
            far: 200,
            position: [0, 5, 10]
          }}
          gl={{
            antialias: false, // Post-processing handles AA usually, or we want crispness
            stencil: false,
            alpha: false,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
            outputColorSpace: THREE.SRGBColorSpace,
            preserveDrawingBuffer: true
          }}
        >
          <Suspense fallback={null}>
            <Experience onReady={() => setExperienceReady(true)} />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  )
}

export default App
