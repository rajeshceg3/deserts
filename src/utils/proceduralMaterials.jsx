import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

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
    materialRef.current.userData.shader = shader;
    shader.uniforms.uTime = { value: 0 };

    shader.vertexShader = `
      varying vec3 vPos;
      varying vec2 vUv;
      uniform float uTime;
      ${noiseChunk}
      ${shader.vertexShader}
    `.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vPos = position;
      vUv = uv;
      // Organic wind/breathing displacement
      // Low freq breathing + High freq wind flutter
      float breath = sin(uTime * 2.0) * 0.005;
      float wind = snoise(position.xy * 10.0 + uTime * 3.0) * 0.015;

      // Directional bias for wind (assuming Z forward)
      float windDir = snoise(vec2(uTime * 0.5, position.z * 0.1));

      transformed += normal * (breath + wind);
      transformed.x += wind * windDir * 0.5; // Slight sway
      `
    );

    shader.fragmentShader = `
      varying vec3 vPos;
      varying vec2 vUv;
      uniform float uTime;
      ${noiseChunk}
      ${shader.fragmentShader}
    `.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>

      // Multi-layered noise for fur texture
      float n1 = snoise(vPos.xy * 50.0); // Base coat
      float n2 = snoise(vPos.xz * 100.0); // Fine hairs

      // Animate sheen slightly
      float sheen = snoise(vPos.xy * 20.0 + uTime * 0.5);

      float fur = n1 * 0.5 + n2 * 0.5;

      // Darken roots (low values)
      vec3 furColor = diffuseColor.rgb * (0.8 + 0.4 * fur);

      // Add subtle sheen
      furColor += vec3(0.05) * sheen;

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

  useFrame((state) => {
    if (materialRef.current?.userData?.shader) {
        materialRef.current.userData.shader.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return <meshStandardMaterial ref={materialRef} onBeforeCompile={onBeforeCompile} {...props} />;
};


// --- Scale Material (Lizard) ---
export const ScaleMaterial = (props) => {
    const materialRef = useRef();

    const onBeforeCompile = useMemo(() => (shader) => {
      materialRef.current.userData.shader = shader;
      shader.uniforms.uTime = { value: 0 };

      shader.vertexShader = `
        varying vec2 vUv;
        varying vec3 vPos;
        uniform float uTime;
        ${shader.vertexShader}
      `.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        vUv = uv;
        vPos = position;

        // Slight breathing for lizard skin
        float breath = sin(uTime * 4.0 + position.x * 5.0) * 0.002;
        transformed += normal * breath;
        `
      );

      shader.fragmentShader = `
        varying vec2 vUv;
        varying vec3 vPos;
        uniform float uTime;
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

        // Iridescence shift
        float shift = sin(uTime + vUv.x * 10.0) * 0.05;
        scaleColor += vec3(shift, 0.0, -shift) * 0.1;

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

        // To make a dome shape: 1.0 - v (v is distance from center 0 to edge 1 approx)
        // Actually voronoi implementation returns distance to feature point.
        // Min distance. So 0 at center, max at edge.
        float dome = sqrt(clamp(1.0 - v, 0.0, 1.0));

        // Calculate derivatives for bump mapping
        vec3 bumpGrad = vec3(dFdx(dome), dFdy(dome), 0.0);

        // Apply bump to normal
        // Transform bumpGrad to view space normal perturbation?
        // Simple hack: add to normal in tangent space (but we are in view space here mostly)
        // Actually fragment shader 'normal' is view space normal.

        // Factor controls depth
        normal = normalize(normal + bumpGrad * 2.0);
        `
      );
    }, []);

    useFrame((state) => {
        if (materialRef.current?.userData?.shader) {
            materialRef.current.userData.shader.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    return <meshStandardMaterial ref={materialRef} onBeforeCompile={onBeforeCompile} {...props} />;
};


// --- Chitin Material (Scorpion) ---
export const ChitinMaterial = (props) => {
    const materialRef = useRef();

    const onBeforeCompile = useMemo(() => (shader) => {
      materialRef.current.userData.shader = shader;
      shader.uniforms.uTime = { value: 0 };

      // Need view position for Fresnel
      shader.vertexShader = `
        varying vec3 vPos;
        varying vec3 vViewPosition;
        uniform float uTime;
        ${shader.vertexShader}
      `.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        vPos = position;
        // vViewPosition is calculated in 'project_vertex' chunk usually,
        // but let's ensure we have what we need.
        // Three.js Standard material usually has vViewPosition.
        // But to be safe let's rely on standard chunks.
        `
      );

      shader.fragmentShader = `
        varying vec3 vPos;
        varying vec3 vViewPosition;
        uniform float uTime;
        ${noiseChunk}
        ${shader.fragmentShader}
      `.replace(
        '#include <color_fragment>',
        `
        #include <color_fragment>

        // Organic Noise
        float n = snoise(vPos.xyz * 5.0);

        // Fresnel Effect for Chitin Iridescence
        // normal is the varying from normal_fragment_maps (view space normal)
        // vViewPosition is -viewSpacePosition.
        // View direction is normalize(vViewPosition).

        vec3 viewDir = normalize(vViewPosition);
        vec3 viewNormal = normalize(normal);

        float fresnel = pow(1.0 - clamp(dot(viewDir, viewNormal), 0.0, 1.0), 3.0);

        // Iridescent colors (Blue/Green/Purple shift)
        vec3 iridColor = vec3(0.0, 0.5, 1.0); // Cyan base
        iridColor = mix(iridColor, vec3(0.5, 0.0, 1.0), sin(uTime * 0.5) * 0.5 + 0.5); // Shift to purple

        vec3 base = diffuseColor.rgb;

        // Add fresnel glow
        diffuseColor.rgb = mix(base, iridColor, fresnel * 0.6);

        // Add noise variation
        diffuseColor.rgb += (n - 0.5) * 0.1;
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

    useFrame((state) => {
        if (materialRef.current?.userData?.shader) {
            materialRef.current.userData.shader.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    return <meshStandardMaterial ref={materialRef} onBeforeCompile={onBeforeCompile} {...props} />;
};
