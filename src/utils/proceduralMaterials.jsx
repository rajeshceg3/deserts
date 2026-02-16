import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';

// --- Shared Shader Chunks ---
const noiseChunk = `
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
`;

const voronoiChunk = `
// Cellular noise
vec2 random2( vec2 p ) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}

float voronoi(vec2 x) {
    vec2 n = floor(x);
    vec2 f = fract(x);
    float m_dist = 1.0;
    for(int j=-1; j<=1; j++) {
        for(int i=-1; i<=1; i++) {
            vec2 g = vec2(float(i),float(j));
            vec2 o = random2( n + g );
            o = 0.5 + 0.5*sin( 6.2831*o );
            vec2 r = g + o - f;
            float d = dot(r,r);
            m_dist = min(m_dist, d);
        }
    }
    return m_dist;
}
`;

// --- Fur Material ---
export const FurMaterial = (props) => {
  const materialRef = useRef();

  const onBeforeCompile = useMemo(() => (shader) => {
    shader.uniforms.uTime = { value: 0 };

    shader.vertexShader = `
      varying vec3 vPos;
      varying vec2 vUv;
      ${noiseChunk}
      ${shader.vertexShader}
    `.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vPos = position;
      vUv = uv;
      // Subtle vertex displacement for "fluff"
      float n = snoise(position.xy * 20.0);
      transformed += normal * n * 0.02;
      `
    );

    shader.fragmentShader = `
      varying vec3 vPos;
      varying vec2 vUv;
      ${noiseChunk}
      ${shader.fragmentShader}
    `.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>

      // Multi-layered noise for fur texture
      float n1 = snoise(vPos.xy * 50.0); // Base coat
      float n2 = snoise(vPos.xz * 100.0); // Fine hairs

      float fur = n1 * 0.5 + n2 * 0.5;

      // Darken roots (low values)
      vec3 furColor = diffuseColor.rgb * (0.8 + 0.4 * fur);

      diffuseColor.rgb = furColor;
      `
    ).replace(
      '#include <roughnessmap_fragment>',
      `
      #include <roughnessmap_fragment>
      // Fur is matte but tips might catch light
      float n = snoise(vPos.xy * 80.0);
      roughnessFactor = 0.8 + 0.2 * n;
      `
    );
  }, []);

  return <meshStandardMaterial ref={materialRef} onBeforeCompile={onBeforeCompile} {...props} />;
};


// --- Scale Material (Lizard) ---
export const ScaleMaterial = (props) => {
    const materialRef = useRef();

    const onBeforeCompile = useMemo(() => (shader) => {
      shader.vertexShader = `
        varying vec2 vUv;
        varying vec3 vPos;
        ${shader.vertexShader}
      `.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        vUv = uv;
        vPos = position;
        `
      );

      shader.fragmentShader = `
        varying vec2 vUv;
        varying vec3 vPos;
        ${voronoiChunk}
        ${shader.fragmentShader}
      `.replace(
        '#include <color_fragment>',
        `
        #include <color_fragment>

        // Generate scales using Voronoi
        // Scale UVs for density
        float v = voronoi(vUv * 30.0);

        // Create edges
        float edge = smoothstep(0.05, 0.1, v);

        // Color variation per scale
        // We can use the cell center ID concept but simple noise works too
        float colorVar = voronoi(vUv * 5.0);

        vec3 scaleColor = diffuseColor.rgb;
        scaleColor *= (0.8 + 0.4 * colorVar); // Macro variation

        // Darken edges (interstitial tissue)
        scaleColor *= edge;
        scaleColor = mix(vec3(0.1, 0.1, 0.1), scaleColor, edge);

        diffuseColor.rgb = scaleColor;
        `
      ).replace(
        '#include <roughnessmap_fragment>',
        `
        #include <roughnessmap_fragment>
        // Scales are shiny, edges are rough
        float v = voronoi(vUv * 30.0);
        float edge = smoothstep(0.05, 0.1, v);
        roughnessFactor = mix(0.8, 0.3, edge); // Shiny scales
        `
      ).replace(
        '#include <normal_fragment_maps>',
        `
        #include <normal_fragment_maps>
        // Perturb normal based on scale shape
        float v = voronoi(vUv * 30.0);
        // Gradient of voronoi gives us "bump"
        // Simple approximation: normal up in center, down at edges
        // Actually voronoi returns distance to center, so 0 at center, 1 at edge
        // But Voronoi implementation above returns min distance, so 0 at center, max at edge?
        // Wait, standard voronoi is distance to closest point. So 0 at center of cell.

        // To make a dome shape: 1.0 - v
        float dome = sqrt(1.0 - v); // Simulates rounded scale

        // Calculate derivatives
        vec3 bumpGrad = vec3(dFdx(dome), dFdy(dome), 0.0);

        normal = normalize(normal + bumpGrad * 1.0);
        `
      );
    }, []);

    return <meshStandardMaterial ref={materialRef} onBeforeCompile={onBeforeCompile} {...props} />;
};


// --- Chitin Material (Scorpion) ---
export const ChitinMaterial = (props) => {
    const materialRef = useRef();

    const onBeforeCompile = useMemo(() => (shader) => {
      shader.vertexShader = `
        varying vec3 vPos;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        ${shader.vertexShader}
      `.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        vPos = position;
        vNormal = normal;
        `
      );

      shader.fragmentShader = `
        varying vec3 vPos;
        varying vec3 vNormal;
        ${noiseChunk}
        ${shader.fragmentShader}
      `.replace(
        '#include <color_fragment>',
        `
        #include <color_fragment>

        // Organic Noise
        float n = snoise(vPos.xyz * 5.0);

        // Slight iridescence / color shift based on viewing angle (Fresnel-ish) not easily accessible here
        // But we can vary color

        vec3 base = diffuseColor.rgb;
        vec3 highlight = base + vec3(0.1, 0.1, 0.2); // Blue-ish tint

        diffuseColor.rgb = mix(base, highlight, n * 0.5 + 0.5);
        `
      ).replace(
        '#include <roughnessmap_fragment>',
        `
        #include <roughnessmap_fragment>
        // Chitin is very smooth/shiny
        roughnessFactor = 0.2;

        // Scratches
        float scratch = snoise(vPos.xyz * 50.0);
        if (scratch > 0.6) roughnessFactor = 0.6;
        `
      );
    }, []);

    return <meshStandardMaterial ref={materialRef} onBeforeCompile={onBeforeCompile} {...props} />;
};
