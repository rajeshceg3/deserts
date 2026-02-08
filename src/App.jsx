import React, { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Experience } from './components/Experience'
import { Overlay } from './components/Overlay'
import { Cursor } from './components/Cursor'
import { Loader } from './components/Loader'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  const [started, setStarted] = useState(false)
  const [experienceReady, setExperienceReady] = useState(false)

  return (
    <div className="w-full h-screen bg-black relative cursor-none overflow-hidden">
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
            powerPreference: "high-performance"
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
