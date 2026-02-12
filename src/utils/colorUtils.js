import * as THREE from 'three'

/**
 * Calculates the sky color based on the day/night cycle and desert colors.
 * Uses continuous interpolation to avoid static bands.
 * @param {number} cycle - The day/night cycle value (0 to 1).
 * @param {object} colors - The desert colors object (containing at least a 'sky' color hex/string).
 * @returns {THREE.Color} The calculated sky color.
 */
export const getSkyColor = (cycle, colors) => {
    const nightColor = new THREE.Color('#050510')
    const dawnColor = new THREE.Color('#FF9A8B') // Peach/Orange
    const dayColor = new THREE.Color(colors?.sky || '#87CEEB')
    const duskColor = new THREE.Color('#FD5E53') // Coral/Red

    // Define keyframes for the sky color cycle
    // We use a continuous loop: Night -> Dawn -> Day -> Dusk -> Night
    // To avoid static "dead zones", we ensure color is always shifting.

    // 0.0: Midnight (Deep Night)
    // 0.25: Sunrise (Dawn)
    // 0.5: Noon (Peak Day)
    // 0.75: Sunset (Dusk)
    // 1.0: Midnight (Deep Night)

    const color = new THREE.Color()

    // Helper to blend between two colors
    const blend = (c1, c2, t) => {
        return color.copy(c1).lerp(c2, t)
    }

    if (cycle < 0.25) {
        // Night -> Dawn
        // Normalize 0.0-0.25 to 0-1
        const t = cycle / 0.25
        // Use smoothstep for non-linear transition
        const smoothT = t * t * (3 - 2 * t)
        return blend(nightColor, dawnColor, smoothT)
    } else if (cycle < 0.5) {
        // Dawn -> Day
        // Normalize 0.25-0.5 to 0-1
        const t = (cycle - 0.25) / 0.25
        const smoothT = t * t * (3 - 2 * t)
        return blend(dawnColor, dayColor, smoothT)
    } else if (cycle < 0.75) {
        // Day -> Dusk
        // Normalize 0.5-0.75 to 0-1
        const t = (cycle - 0.5) / 0.25
        const smoothT = t * t * (3 - 2 * t)
        return blend(dayColor, duskColor, smoothT)
    } else {
        // Dusk -> Night
        // Normalize 0.75-1.0 to 0-1
        const t = (cycle - 0.75) / 0.25
        const smoothT = t * t * (3 - 2 * t)
        return blend(duskColor, nightColor, smoothT)
    }
}
