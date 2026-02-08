import * as THREE from 'three'

/**
 * Calculates the sky color based on the day/night cycle and desert colors.
 * Uses smoothstep interpolation for smoother transitions.
 * @param {number} cycle - The day/night cycle value (0 to 1).
 * @param {object} colors - The desert colors object (containing at least a 'sky' color hex/string).
 * @returns {THREE.Color} The calculated sky color.
 */
export const getSkyColor = (cycle, colors) => {
    const nightColor = new THREE.Color('#050510')
    const dawnColor = new THREE.Color('#FF9A8B') // Peach/Orange
    const dayColor = new THREE.Color(colors?.sky || '#87CEEB')
    const duskColor = new THREE.Color('#FD5E53') // Coral/Red

    const color = new THREE.Color()

    // Smoothstep function
    const smoothstep = (min, max, value) => {
        const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
        return x * x * (3 - 2 * x);
    };

    // Cycle: 0 (Midnight) -> 0.25 (Dawn) -> 0.5 (Noon) -> 0.75 (Dusk) -> 1 (Midnight)

    // 0.0 - 0.2: Night
    if (cycle < 0.2) {
        return color.copy(nightColor)
    }
    // 0.2 - 0.3: Dawn (Night to Dawn)
    else if (cycle < 0.3) {
        const t = smoothstep(0.2, 0.3, cycle)
        return color.copy(nightColor).lerp(dawnColor, t)
    }
    // 0.3 - 0.4: Day Rise (Dawn to Day)
    else if (cycle < 0.4) {
        const t = smoothstep(0.3, 0.4, cycle)
        return color.copy(dawnColor).lerp(dayColor, t)
    }
    // 0.4 - 0.6: Day
    else if (cycle < 0.6) {
        return color.copy(dayColor)
    }
    // 0.6 - 0.7: Day Set (Day to Dusk)
    else if (cycle < 0.7) {
        const t = smoothstep(0.6, 0.7, cycle)
        return color.copy(dayColor).lerp(duskColor, t)
    }
    // 0.7 - 0.8: Dusk (Dusk to Night)
    else if (cycle < 0.8) {
        const t = smoothstep(0.7, 0.8, cycle)
        return color.copy(duskColor).lerp(nightColor, t)
    }
    // 0.8 - 1.0: Night
    else {
        return color.copy(nightColor)
    }
}
