import React from 'react'
import { Canvas } from '@react-three/fiber'
import { Experience } from './components/Experience'
import { Overlay } from './components/Overlay'

function App() {
  return (
    <div className="w-full h-screen bg-black relative">
      <div className="noise-overlay" />
      <Overlay />
      <Canvas
        camera={{
          fov: 45,
          near: 0.1,
          far: 200,
          position: [0, 5, 10]
        }}
      >
        <Experience />
      </Canvas>
    </div>
  )
}

export default App
