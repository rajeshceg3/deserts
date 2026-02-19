import React, { forwardRef, useMemo } from 'react'
import { Uniform } from 'three'
import { Effect } from 'postprocessing'

const fragmentShader = `
uniform float time;
uniform float strength;
uniform float speed;

// Simplex 2D noise
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
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

export const HeatHaze = forwardRef(({ strength = 1.0, speed = 1.0 }, ref) => {
  const effect = useMemo(() => new HeatHazeEffectImpl({ strength, speed }), [strength, speed])
  return <primitive ref={ref} object={effect} />
})
