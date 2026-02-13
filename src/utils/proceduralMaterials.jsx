import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'

// --- Shared Shader Utilities ---

const noiseFunctions = `
// Simple hash function for noise
float hash(vec3 p) {
    p  = fract( p*0.3183099 + .1 );
    p *= 17.0;
    return fract( p.x*p.y*p.z*(p.x+p.y+p.z) );
}

// 2D Random
vec2 random2( vec2 p ) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}

// Voronoi / Cellular Noise
float cellular(vec2 P) {
    vec2 Pi = floor(P);
    vec2 Pf = fract(P);
    float min_dist = 1.0;
    for (int y= -1; y <= 1; y++) {
        for (int x= -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x),float(y));
            vec2 point = random2(Pi + neighbor);
            point = 0.5 + 0.5*sin(6.2831*point); // Animate? No need for static scales
            vec2 diff = neighbor + point - Pf;
            float dist = length(diff);
            min_dist = min(min_dist, dist);
        }
    }
    return min_dist;
}
`;

// --- Fur Material ---
// Used for Camel, Fox
export const FurMaterial = (props) => {
    const materialRef = useRef()

    const onBeforeCompile = useMemo(() => (shader) => {
        shader.vertexShader = `
            varying vec3 vPos;
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
            ${noiseFunctions}
            ${shader.fragmentShader}
        `.replace(
            '#include <color_fragment>',
            `
            #include <color_fragment>
            float noise = hash(vPos * 200.0);
            diffuseColor.rgb *= (0.8 + 0.2 * noise);
            `
        ).replace(
            '#include <roughnessmap_fragment>',
            `
            #include <roughnessmap_fragment>
            float rNoise = hash(vPos * 200.0);
            roughnessFactor = 0.9 + 0.1 * rNoise;
            `
        );
    }, []);

    return <meshStandardMaterial ref={materialRef} onBeforeCompile={onBeforeCompile} {...props} />
}

// --- Scale Material ---
// Used for Lizard
export const ScaleMaterial = (props) => {
    const materialRef = useRef()

    const onBeforeCompile = useMemo(() => (shader) => {
        shader.vertexShader = `
            varying vec2 vUv;
            ${shader.vertexShader}
        `.replace(
            '#include <uv_vertex>',
            `
            #include <uv_vertex>
            vUv = uv;
            `
        );

        shader.fragmentShader = `
            varying vec2 vUv;
            ${noiseFunctions}
            ${shader.fragmentShader}
        `.replace(
            '#include <roughnessmap_fragment>',
            `
            #include <roughnessmap_fragment>
            float s_r = cellular(vUv * 30.0);
            float p_r = smoothstep(0.1, 0.9, s_r);
            roughnessFactor = 0.4 + 0.4 * (1.0 - p_r);
            `
        ).replace(
            '#include <color_fragment>',
            `
            #include <color_fragment>
            float s_c = cellular(vUv * 30.0);
            float p_c = smoothstep(0.1, 0.9, s_c);
            diffuseColor.rgb *= (0.5 + 0.5 * p_c);
            vec3 colorVar = vec3(0.0, 0.1, 0.0) * (1.0 - p_c);
            diffuseColor.rgb += colorVar;
            `
        );
    }, []);

    return <meshStandardMaterial ref={materialRef} onBeforeCompile={onBeforeCompile} {...props} />
}

// --- Chitin Material ---
// Used for Scorpion
export const ChitinMaterial = (props) => {
    const materialRef = useRef()

    const onBeforeCompile = useMemo(() => (shader) => {
        shader.vertexShader = `
            varying vec3 vPos;
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
            ${noiseFunctions}
            ${shader.fragmentShader}
        `.replace(
            '#include <roughnessmap_fragment>',
            `
            #include <roughnessmap_fragment>
            float n_r = hash(vPos * 50.0);
            roughnessFactor = 0.2 + 0.1 * n_r;
            `
        ).replace(
            '#include <metalnessmap_fragment>',
            `
            #include <metalnessmap_fragment>
            metalnessFactor = 0.3;
            `
        ).replace(
            '#include <color_fragment>',
            `
            #include <color_fragment>
            float n_c = hash(vPos * 50.0);
            diffuseColor.rgb += (n_c - 0.5) * 0.1;
            `
        );
    }, []);

    return <meshStandardMaterial ref={materialRef} onBeforeCompile={onBeforeCompile} {...props} />
}
