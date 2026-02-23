// Simple POJOs for clarity + autocomplete-friendly shapes.

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

export function makePlayerBullet({ x, y, vx, vy, life, color }) {
    return { x, y, vx, vy, life, color };
}

export function makeExplosion({ x, y }) {
    return { x, y, t: 0 };
}

export function makeHealthPickup({ x, y }) {
    return { x, y, life: 0, t: 0 };
}
