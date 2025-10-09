// Simple POJOs for clarity + autocomplete-friendly shapes.

export function makeEnemy({ x, y, vx, vy, fireEvery, nextFire, spd }) {
    return {
        x, y, vx, vy,
        angle: 0,
        spd,
        fireEvery,
        nextFire,
        alive: true,
        wobblePhase: Math.random() * Math.PI * 2,
    };
}

export function makeEnemyBullet({ x, y, vx, vy, life, color }) {
    return { x, y, vx, vy, life, color };
}

export function makePlayerBullet({ x, y, vx, vy, life, color }) {
    return { x, y, vx, vy, life, color };
}

export function makeExplosion({ x, y }) {
    return { x, y, t: 0 };
}
