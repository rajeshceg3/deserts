import React, { forwardRef, useMemo } from 'react'
import { Uniform } from 'three'
import { Effect } from 'postprocessing'

const fragmentShader = `
uniform float time;
uniform float strength;
uniform float speed;

// Fast sine wave pseudo-noise
float snoise(vec2 v) {
  return sin(v.x) * sin(v.y);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // Generate noise based on UV and time
    // Scale UV for frequency
    vec2 noiseUV = uv * vec2(20.0, 50.0);
    // Animate Y for rising heat
    noiseUV.y -= time * speed;

    float n = snoise(noiseUV);

    // Distortion strength
    // Mask edges to avoid tearing/wrapping artifacts
    float edgeMask = smoothstep(0.0, 0.1, uv.x) * smoothstep(1.0, 0.9, uv.x) *
                     smoothstep(0.0, 0.1, uv.y) * smoothstep(1.0, 0.9, uv.y);

    // Mask top half of screen to keep sky clear (optional, but realistic for ground heat)
    // Actually, let's just let it be global for now as "hot air" everywhere

    vec2 distortion = vec2(n * 0.003, n * 0.005) * strength * edgeMask;

    // Sample input buffer at distorted coordinate
    outputColor = texture2D(inputBuffer, uv + distortion);
}
`

class HeatHazeEffectImpl extends Effect {
  constructor({ strength = 1.0, speed = 1.0 } = {}) {
    super('HeatHazeEffect', fragmentShader, {
      uniforms: new Map([
        ['time', new Uniform(0)],
        ['strength', new Uniform(strength)],
        ['speed', new Uniform(speed)],
      ]),
    })
  }

  update(renderer, inputBuffer, deltaTime) {
    this.uniforms.get('time').value += deltaTime
  }
}

// eslint-disable-next-line react/display-name
export const HeatHaze = forwardRef(({ strength = 1.0, speed = 1.0 }, ref) => {
  const effect = useMemo(() => new HeatHazeEffectImpl({ strength, speed }), [strength, speed])
  return <primitive ref={ref} object={effect} />
})
