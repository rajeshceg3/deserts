import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// --- Shared Shader Chunks ---
const noiseChunk = `
// Simplex 2D/3D noise

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

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

// 3D Simplex Noise for Volumetric effects
float snoise3(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //  x0 = x0 - 0.0 + 0.0 * C.xxx;
  //  x1 = x0 - i1  + 1.0 * C.xxx;
  //  x2 = x0 - i2  + 2.0 * C.xxx;
  //  x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

  // Permutations
  i = mod(i, 289.0 );
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  // Gradients: 7x7 points over a square, mapped onto an octahedron.
  // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  //Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
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

// Domain Warping for Organic Look
float fbm(vec2 p) {
    float f = 0.0;
    f += 0.5000 * snoise(p); p = p*2.02;
    f += 0.2500 * snoise(p); p = p*2.03;
    f += 0.1250 * snoise(p); p = p*2.01;
    return f;
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
      uniform float uTime;
      ${noiseChunk}
      ${shader.vertexShader}
    `.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vPos = position;
      // vUv is already available in standard material
      // vNormal is available

      // Improved Organic Wind
      float windFreq = 2.0;
      float windAmp = 0.02;

      // Turbulence
      float turbulence = snoise(position.xy * 0.5 + uTime * 0.5) * 0.5 + 0.5;

      // Main wind direction
      float wind = sin(uTime * windFreq + position.x * 2.0 + position.y) * windAmp * turbulence;

      // Breathing / Life pulse
      float pulse = sin(uTime * 1.5) * 0.003;

      // Apply displacement
      transformed += normal * (wind + pulse);
      `
    );

    shader.fragmentShader = `
      varying vec3 vPos;
      uniform float uTime;
      ${noiseChunk}
      ${shader.fragmentShader}
    `.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>

      // Multi-layered noise for realistic fur strands
      float n1 = snoise(vPos.xy * 60.0);
      float n2 = snoise(vPos.yz * 120.0);
      float n3 = snoise(vPos.xz * 200.0); // Fine details

      // Fur density mask
      float fur = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;

      // Roots are darker, tips are lighter
      vec3 rootColor = diffuseColor.rgb * 0.6;
      vec3 tipColor = diffuseColor.rgb * 1.2;

      vec3 furColor = mix(rootColor, tipColor, smoothstep(-0.2, 0.5, fur));

      // Fresnel Rim Light (Velvet effect)
      // vViewPosition is available in Standard material fragment
      vec3 viewDir = normalize(vViewPosition);

      // vNormal might need to be 'normal' (the calculated normal in fragment)
      // In color_fragment, 'normal' isn't fully ready yet?
      // Actually standard material calculates 'normal' in 'normal_fragment_maps' which comes before 'color_fragment' usually?
      // Let's check order:
      // normal_fragment_begin -> normal_fragment_maps -> ... -> color_fragment ?
      // No, color_fragment is usually early.

      // If 'normal' is not ready, we use vNormal.
      // But standard material vertex shader exports vNormal.
      vec3 viewVec = normalize(-vViewPosition);
      float NdotV = clamp(dot(normalize(vNormal), viewVec), 0.0, 1.0);

      // Rim effect
      float rim = 1.0 - NdotV;
      rim = pow(rim, 3.0); // Sharpen rim

      furColor += vec3(0.1, 0.1, 0.15) * rim * 0.5; // Blue-ish rim for sky reflection hint

      diffuseColor.rgb = furColor;
      `
    ).replace(
      '#include <roughnessmap_fragment>',
      `
      #include <roughnessmap_fragment>
      // Fur catches light at grazing angles (sheen)
      // Low roughness at rim, high at center
      roughnessFactor = 0.6 + 0.3 * (1.0 - pow(1.0 - abs(dot(vNormal, vec3(0,0,1))), 2.0));
      // Simplified Fresnel approx for roughness
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
        varying vec3 vPos;
        uniform float uTime;
        ${shader.vertexShader}
      `.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        vPos = position;

        // Breathing
        float breath = sin(uTime * 3.0 + position.y * 2.0) * 0.003;
        transformed += normal * breath;
        `
      );

      shader.fragmentShader = `
        varying vec3 vPos;
        uniform float uTime;
        ${noiseChunk}
        ${voronoiChunk}
        ${shader.fragmentShader}
      `.replace(
        '#include <color_fragment>',
        `
        #include <color_fragment>

        // Domain Warping for Organic Scales
        vec2 warpedUV = vUv * 25.0;
        float warp = fbm(warpedUV * 0.1 + uTime * 0.05); // Slow morph
        warpedUV += vec2(warp, warp) * 2.0;

        // Voronoi
        float v = voronoi(warpedUV);

        // Edge Softness
        float edge = smoothstep(0.05, 0.15, v);

        // Iridescence based on viewing angle
        vec3 viewVec = normalize(-vViewPosition);
        float NdotV = dot(normalize(vNormal), viewVec);

        vec3 scaleColor = diffuseColor.rgb;

        // Color variation
        float cellNoise = snoise(floor(warpedUV));
        scaleColor += (cellNoise * 0.1);

        // Iridescence shift
        vec3 shiftColor = vec3(0.0, 0.2, 0.1); // Green shift
        float irid = pow(1.0 - NdotV, 2.0);
        scaleColor = mix(scaleColor, scaleColor + shiftColor, irid * 0.5);

        // Darken interstitial
        scaleColor *= edge;
        scaleColor = mix(vec3(0.05, 0.05, 0.02), scaleColor, edge);

        diffuseColor.rgb = scaleColor;
        `
      ).replace(
        '#include <roughnessmap_fragment>',
        `
        #include <roughnessmap_fragment>
        float v = voronoi(vUv * 25.0 + fbm(vUv * 2.5)); // Approx same UV
        float edge = smoothstep(0.05, 0.1, v);
        // Scales are shiny (wet/smooth), gaps are rough
        roughnessFactor = mix(0.9, 0.3, edge);
        `
      ).replace(
        '#include <normal_fragment_maps>',
        `
        #include <normal_fragment_maps>
        // Procedural Bump
        vec2 wUV = vUv * 25.0;
        float warp = fbm(wUV * 0.1);
        wUV += vec2(warp) * 2.0;

        float v = voronoi(wUV);

        // Dome profile
        float dome = sqrt(clamp(1.0 - v, 0.0, 1.0));

        // Derivatives
        vec3 bumpGrad = vec3(dFdx(dome), dFdy(dome), 0.0);

        // Perturb normal
        normal = normalize(normal + bumpGrad * 1.5);
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

      shader.vertexShader = `
        varying vec3 vPos;
        uniform float uTime;
        ${shader.vertexShader}
      `.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        vPos = position;
        `
      );

      shader.fragmentShader = `
        varying vec3 vPos;
        uniform float uTime;
        ${noiseChunk}
        ${shader.fragmentShader}
      `.replace(
        '#include <color_fragment>',
        `
        #include <color_fragment>

        // Base noise for shell texture imperfections
        float n = snoise(vPos.xyz * 8.0);

        // View Direction & Fresnel
        vec3 viewDir = normalize(-vViewPosition); // Camera vector
        vec3 N = normalize(vNormal);
        float NdotV = dot(N, viewDir);
        float fresnel = pow(1.0 - clamp(NdotV, 0.0, 1.0), 4.0);

        // Iridescent Thin Film Interference (Fake)
        // Shifts from base color to Cyan/Purple at grazing angles
        vec3 iridColor = vec3(0.0, 0.8, 1.0); // Cyan
        vec3 iridColor2 = vec3(0.6, 0.0, 1.0); // Purple

        vec3 shift = mix(iridColor, iridColor2, sin(uTime + vPos.x) * 0.5 + 0.5);

        vec3 base = diffuseColor.rgb;

        // Subsurface Scattering (Fake)
        // Light passing through thin parts (edges)
        // Approximated by inverting NdotV slightly
        float sss = smoothstep(0.0, 0.5, 1.0 - NdotV);
        vec3 sssColor = vec3(1.0, 0.4, 0.0); // Orange glow

        // Mix all
        // Base -> SSS Glow -> Fresnel Irid
        vec3 finalColor = base;
        finalColor += sssColor * sss * 0.3; // Add internal glow
        finalColor = mix(finalColor, shift, fresnel * 0.7); // Coat with iridescence

        // Surface imperfections
        finalColor -= abs(n) * 0.1;

        diffuseColor.rgb = finalColor;
        `
      ).replace(
        '#include <roughnessmap_fragment>',
        `
        #include <roughnessmap_fragment>
        // Very glossy
        roughnessFactor = 0.15;

        // Scratches
        float scratch = snoise(vPos.xyz * 40.0);
        if (scratch > 0.7) roughnessFactor = 0.5;
        `
      ).replace(
        '#include <normal_fragment_maps>',
        `
        #include <normal_fragment_maps>
        // Micro-bumps
        float micro = snoise(vPos.xyz * 100.0);
        vec3 microBump = vec3(dFdx(micro), dFdy(micro), 0.0);
        normal = normalize(normal + microBump * 0.1);
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
