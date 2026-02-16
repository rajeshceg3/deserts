import * as THREE from 'three'

/**
 * Calculates the sky color based on the day/night cycle and desert colors.
 * Uses multi-stage interpolation to create realistic transitions including Golden Hour and Blue Hour.
 * @param {number} cycle - The day/night cycle value (0 to 1).
 * @param {object} colors - The desert colors object (containing at least a 'sky' color hex/string).
 * @returns {THREE.Color} The calculated sky color.
 */
export const getSkyColor = (cycle, colors) => {
    // Define palette based on the desert's base sky color
    const baseSky = new THREE.Color(colors?.sky || '#87CEEB')

    // Key Colors
    const nightColor = new THREE.Color('#02020a') // Deep space black/blue
    const dawnColor = new THREE.Color('#FF9A8B') // Peach/Orange
    const goldenHourColor = new THREE.Color('#FFD700').lerp(baseSky, 0.3) // Gold mixed with sky
    const dayColor = baseSky
    const duskColor = new THREE.Color('#FD5E53') // Coral/Red
    const blueHourColor = new THREE.Color('#4169E1').multiplyScalar(0.4) // Royal Blue, darkened

    // Cycle Map:
    // 0.00 - 0.15: Night
    // 0.15 - 0.20: Night -> Blue Hour
    // 0.20 - 0.25: Blue Hour -> Dawn
    // 0.25 - 0.30: Dawn -> Golden Hour
    // 0.30 - 0.40: Golden Hour -> Day
    // 0.40 - 0.60: Day (Noon at 0.5)
    // 0.60 - 0.70: Day -> Golden Hour
    // 0.70 - 0.75: Golden Hour -> Dusk
    // 0.75 - 0.85: Dusk -> Blue Hour
    // 0.85 - 1.00: Blue Hour -> Night

    const color = new THREE.Color()

    // Helper to blend
    const blend = (c1, c2, t) => {
        // Smoothstep for organic transition
        const smoothT = t * t * (3 - 2 * t)
        return color.copy(c1).lerp(c2, smoothT)
    }

    // Helper to normalize range
    const range = (start, end) => (cycle - start) / (end - start)

    if (cycle < 0.15) {
        return color.copy(nightColor)
    } else if (cycle < 0.20) {
        return blend(nightColor, blueHourColor, range(0.15, 0.20))
    } else if (cycle < 0.25) {
        return blend(blueHourColor, dawnColor, range(0.20, 0.25))
    } else if (cycle < 0.30) {
        return blend(dawnColor, goldenHourColor, range(0.25, 0.30))
    } else if (cycle < 0.40) {
        return blend(goldenHourColor, dayColor, range(0.30, 0.40))
    } else if (cycle < 0.60) {
        return color.copy(dayColor)
    } else if (cycle < 0.70) {
        return blend(dayColor, goldenHourColor, range(0.60, 0.70))
    } else if (cycle < 0.75) {
        return blend(goldenHourColor, duskColor, range(0.70, 0.75))
    } else if (cycle < 0.85) {
        return blend(duskColor, blueHourColor, range(0.75, 0.85))
    } else {
        return blend(blueHourColor, nightColor, range(0.85, 1.0))
    }
}
