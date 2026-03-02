// Simple POJOs for clarity + autocomplete-friendly shapes.

/** Power-up type constants */
export const POWERUP_TYPE = Object.freeze({
    HEALTH: "health",
    SHIELD: "shield",
    FIREPOWER: "firepower",
});

/** Firepower star colors (one per fp level, index 0 = level 1 star look) */
export const FP_COLORS = ["#ffa020", "#ffe020", "#bf40ff", "#ff40c0", "#40f0ff"];

export function makePowerup({ x, y, type, life = 8 }) {
    return { x, y, type, life, t: 0 };
}

export function makeMine({ x, y }) {
    return { x, y, fuse: 0, alive: true };
}

export function makeEnemy({ x, y, vx, vy, fireEvery, nextFire, spd, isElite = false, hp = 1 }) {
    return {
        x, y, vx, vy,
        angle: 0,
        spd,
        fireEvery,
        nextFire,
        alive: true,
        wobblePhase: Math.random() * Math.PI * 2,
        isElite,
        hp,
    };
}

export function makeEnemyBullet({ x, y, vx, vy, life, color }) {
    return { x, y, vx, vy, life, color };
}

export function makePlayerBullet({ x, y, vx, vy, life, color, fp = 1 }) {
    return { x, y, vx, vy, life, color, fp };
}

export function makeExplosion({ x, y }) {
    return { x, y, t: 0 };
}
