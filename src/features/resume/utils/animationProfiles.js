/**
 * Animation profiles for ProjectCard hover backgrounds.
 * Each profile defines the emoji symbols and motion parameters
 * for the Canvas particle animation that plays on card hover.
 *
 * To add a new profile: add an entry keyed by animKey and assign
 * that animKey to the project in projects.js.
 */

const PROFILES = {
    'nyc-lux-ride': {
        symbols: ['🚗', '🚙', '🏎️', '🚕'],
        vxRange: [1.5, 3.0],
        vyRange: [-0.2, 0.2],
        sizeRange: [24, 36],
        opacityRange: [0.22, 0.45],
        count: 7,
    },
    'bell-aviation': {
        symbols: ['✈️', '🛩️', '🛫'],
        vxRange: [1.0, 2.5],
        vyRange: [-0.6, -0.1],
        sizeRange: [26, 40],
        opacityRange: [0.20, 0.42],
        count: 6,
    },
    'tikka-masala': {
        symbols: ['🌶️', '🍛', '🫙', '🌿'],
        vxRange: [-0.3, 0.3],
        vyRange: [-1.6, -0.8],
        sizeRange: [18, 28],
        opacityRange: [0.20, 0.40],
        count: 8,
    },
    'skylight-ksa': {
        symbols: ['⚡', '✨', '💡', '🌟'],
        vxRange: [-0.4, 0.4],
        vyRange: [-2.0, -0.6],
        sizeRange: [16, 28],
        opacityRange: [0.15, 0.38],
        count: 10,
    },
    'deebas-daycare': {
        symbols: ['🎈', '⭐', '🌈', '🎀'],
        vxRange: [-0.4, 0.4],
        vyRange: [-1.2, -0.4],
        sizeRange: [20, 32],
        opacityRange: [0.20, 0.45],
        count: 8,
    },
    'oz-studios': {
        symbols: ['💻', '🚀', '⚡', '🌐'],
        vxRange: [0.6, 1.6],
        vyRange: [-0.8, 0.8],
        sizeRange: [18, 28],
        opacityRange: [0.20, 0.40],
        count: 7,
    },
    'elia-barber': {
        symbols: ['✂️', '💈', '🪒', '💇'],
        vxRange: [-0.4, 0.4],
        vyRange: [-1.0, -0.3],
        sizeRange: [18, 30],
        opacityRange: [0.20, 0.42],
        count: 7,
    },
    'rashida-daycare': {
        symbols: ['🌟', '🎠', '🎨', '🎪'],
        vxRange: [-0.3, 0.3],
        vyRange: [-1.2, -0.4],
        sizeRange: [20, 32],
        opacityRange: [0.20, 0.45],
        count: 8,
    },
};

const DEFAULT_PROFILE = {
    symbols: ['✨', '⭐', '🌟'],
    vxRange: [-0.3, 0.3],
    vyRange: [-1.2, -0.5],
    sizeRange: [16, 26],
    opacityRange: [0.15, 0.35],
    count: 6,
};

export function getAnimationProfile(key) {
    return PROFILES[key] || DEFAULT_PROFILE;
}
