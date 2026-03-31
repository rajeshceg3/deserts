import React from 'react';
import * as THREE from 'three';

// --- Shared Shader Chunks ---
const noiseChunk = `
// Fast sine-wave based pseudo-noise
float snoise(vec2 v) {
    return sin(v.x) * sin(v.y);
}
float snoise3(vec3 v) {
    return sin(v.x) * sin(v.y) * sin(v.z);
}
`;

const voronoiChunk = `
// Fast sine-wave pseudo-voronoi
float voronoi(vec2 x) {
    return sin(x.x * 10.0) * sin(x.y * 10.0) * 0.5 + 0.5;
}
float fbm(vec2 p) {
    return sin(p.x * 2.0) * sin(p.y * 2.0) * 0.5 + 0.5;
}
`;

// Global uniforms shared by all procedural materials
export const proceduralUniforms = {
    uTime: { value: 0 }
};

// --- Fur Material ---
export const furOnBeforeCompile = (shader) => {
    shader.uniforms.uTime = proceduralUniforms.uTime;

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

      // Turbulence (Simplified)
      float turbulence = sin(position.x * 2.0 + uTime) * sin(position.y * 2.0 + uTime) * 0.5 + 0.5;

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

      // Multi-layered noise for realistic fur strands (Simplified)
      float fur = sin(vPos.x * 60.0) * sin(vPos.y * 60.0) * sin(vPos.z * 60.0) * 0.5 + 0.5;

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
};


// --- Scale Material (Lizard) ---
export const scaleOnBeforeCompile = (shader) => {
      shader.uniforms.uTime = proceduralUniforms.uTime;

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

        // Domain Warping for Organic Scales (Simplified)
        vec2 warpedUV = vUv * 25.0;
        float warp = sin(warpedUV.x * 0.1 + uTime * 0.05) * sin(warpedUV.y * 0.1 + uTime * 0.05); // Slow morph
        warpedUV += vec2(warp, warp) * 2.0;

        // Simplified pattern instead of Voronoi
        float v = sin(warpedUV.x) * sin(warpedUV.y) * 0.5 + 0.5;

        // Edge Softness
        float edge = smoothstep(0.05, 0.15, v);

        // Iridescence based on viewing angle
        vec3 viewVec = normalize(-vViewPosition);
        float NdotV = dot(normalize(vNormal), viewVec);

        vec3 scaleColor = diffuseColor.rgb;

        // Color variation
        float cellNoise = sin(floor(warpedUV.x)) * sin(floor(warpedUV.y));
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
        float v = sin(vUv.x * 25.0 + sin(vUv.x * 2.5)) * sin(vUv.y * 25.0 + sin(vUv.y * 2.5)) * 0.5 + 0.5;
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
        float warp = sin(wUV.x * 0.1) * sin(wUV.y * 0.1);
        wUV += vec2(warp) * 2.0;

        float v = sin(wUV.x) * sin(wUV.y) * 0.5 + 0.5;

        // Dome profile
        float dome = sqrt(clamp(1.0 - v, 0.0, 1.0));

        // Derivatives
        vec3 bumpGrad = vec3(dFdx(dome), dFdy(dome), 0.0);

        // Perturb normal
        normal = normalize(normal + bumpGrad * 1.5);
        `
      );
};


// --- Chitin Material (Scorpion) ---
export const chitinOnBeforeCompile = (shader) => {
      shader.uniforms.uTime = proceduralUniforms.uTime;

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

        // Base noise for shell texture imperfections (Simplified)
        float n = sin(vPos.x * 16.0) * sin(vPos.y * 16.0) * sin(vPos.z * 16.0);

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

        // Scratches (Simplified)
        float scratch = sin(vPos.x * 40.0) * sin(vPos.y * 40.0) * sin(vPos.z * 40.0);
        if (scratch > 0.7) roughnessFactor = 0.5;
        `
      ).replace(
        '#include <normal_fragment_maps>',
        `
        #include <normal_fragment_maps>
        // Micro-bumps (Simplified)
        float micro = sin(vPos.x * 100.0) * sin(vPos.y * 100.0) * sin(vPos.z * 100.0);
        vec3 microBump = vec3(dFdx(micro), dFdy(micro), 0.0);
        normal = normalize(normal + microBump * 0.1);
        `
      );
};
