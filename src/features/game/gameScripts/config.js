// Central knobs so tuning is painless.
export const STARFIELD = {
    SPEED: 0.0315,
    Z_MIN: 0.08,
    Z_MAX: 1.25,
};

export const GAME = {
    ENEMY_MIN_SPAWN_MS: 1500,
    ENEMY_MAX_SPAWN_MS: 2800,
    ENEMY_SPEED: 70,

    BULLET_SPEED: 520,
    BULLET_LIFE: 1.6,
    ENEMY_FIRE_MIN: 900,
    ENEMY_FIRE_MAX: 1400,

    MY_BULLET_SPEED: 800,
    MY_BULLET_LIFE: 0.9,
    BOSS_BULLET_SPEED: 900,

    HIT_RADIUS: 24,
    EXPLOSION_TIME: 0.4,

    // Elite enemy constants
    ELITE_SPAWN_EVERY: 5,
    ELITE_HP: 3,
    ELITE_SPEED_MULT: 1.45,
    ELITE_SIZE: 40,

    // Player-hit flash
    HIT_FLASH_DURATION: 0.4,

    // Boss laser variants
    BOSS_HEAVY_CHANCE: 0.25,
    BOSS_HEAVY_LIFE_MULT: 2.2,
    BOSS_HEAVY_SPEED_MULT: 0.7,
};
