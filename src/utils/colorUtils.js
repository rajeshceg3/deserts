import * as THREE from 'three'

/**
 * Calculates the sky color based on the day/night cycle and desert colors.
 * Uses multi-stage interpolation to create realistic transitions including Golden Hour and Blue Hour.
 * @param {number} cycle - The day/night cycle value (0 to 1).
 * @param {object} colors - The desert colors object (containing at least a 'sky' color hex/string).
 * @returns {THREE.Color} The calculated sky color.
 */
// Reusable color instances to avoid garbage collection overhead in hot loops
const _baseSky = new THREE.Color()
const _nightColor = new THREE.Color('#02020a') // Deep space black/blue
const _dawnColor = new THREE.Color('#FF9A8B') // Peach/Orange
const _goldenHourColor = new THREE.Color()
const _duskColor = new THREE.Color('#FD5E53') // Coral/Red
const _blueHourColor = new THREE.Color('#4169E1').multiplyScalar(0.4) // Royal Blue, darkened
const _defaultReturnColor = new THREE.Color()

export const getSkyColor = (cycle, colors, targetColor = _defaultReturnColor) => {
    // Define palette based on the desert's base sky color
    _baseSky.set(colors?.sky || '#87CEEB')
    _goldenHourColor.set('#FFD700').lerp(_baseSky, 0.3) // Gold mixed with sky
    const dayColor = _baseSky

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

    // Helper to blend
    const blend = (c1, c2, t) => {
        // Smoothstep for organic transition
        const smoothT = t * t * (3 - 2 * t)
        return targetColor.copy(c1).lerp(c2, smoothT)
    }

    // Helper to normalize range
    const range = (start, end) => (cycle - start) / (end - start)

    if (cycle < 0.15) {
        return targetColor.copy(_nightColor)
    } else if (cycle < 0.20) {
        return blend(_nightColor, _blueHourColor, range(0.15, 0.20))
    } else if (cycle < 0.25) {
        return blend(_blueHourColor, _dawnColor, range(0.20, 0.25))
    } else if (cycle < 0.30) {
        return blend(_dawnColor, _goldenHourColor, range(0.25, 0.30))
    } else if (cycle < 0.40) {
        return blend(_goldenHourColor, dayColor, range(0.30, 0.40))
    } else if (cycle < 0.60) {
        return targetColor.copy(dayColor)
    } else if (cycle < 0.70) {
        return blend(dayColor, _goldenHourColor, range(0.60, 0.70))
    } else if (cycle < 0.75) {
        return blend(_goldenHourColor, _duskColor, range(0.70, 0.75))
    } else if (cycle < 0.85) {
        return blend(_duskColor, _blueHourColor, range(0.75, 0.85))
    } else {
        return blend(_blueHourColor, _nightColor, range(0.85, 1.0))
    }
}
