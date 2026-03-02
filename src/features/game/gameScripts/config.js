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

    MAX_PLAYER_HP: 100,

    // Boss laser variants
    BOSS_HEAVY_CHANCE: 0.25,
    BOSS_HEAVY_LIFE_MULT: 2.2,
    BOSS_HEAVY_SPEED_MULT: 0.7,

    // Boss stats
    BOSS_HP: 100,
    BOSS_LASER_DAMAGE: 5,

    // Health pickup drops
    HEALTH_DROP_CHANCE: 0.4,
    HEALTH_PICKUP_RADIUS: 22,
    HEALTH_PICKUP_LIFE: 8,
    HEALTH_PICKUP_HP: 15,

    // Force field
    FORCE_FIELD_DURATION: 6,

    // Firepower system
    FIREPOWER_MAX: 5,

    // Power-up unified drop system
    POWERUP_DROP_CHANCE: 0.45,
    POWERUP_WEIGHTS: { health: 3, shield: 2, firepower: 4 },
    POWERUP_LIFE: 8,

    // Boss power-up drops
    BOSS_POWERUP_WEIGHTS: { health: 2, shield: 3, firepower: 4 },
    BOSS_POWERUP_DROP_CHANCE: 0.22,

    // Mini-boss (boss split)
    MINI_BOSS_HP: 30,
    MINI_BOSS_FIRE_EVERY: 650,
    MINI_BOSS_SIZE: 64,
    MINI_BOSS_POWERUP_DROP_CHANCE: 0.12,
    MINI_BOSS_POWERUP_WEIGHTS: { health: 2, shield: 2, firepower: 1 },

    // Mine system
    MINE_FUSE_TIME: 1.8,
    MINE_EXPLOSION_RADIUS: 80,
    MINE_DAMAGE: 20,
    ELITE_MINE_INTERVAL_MIN: 6.0,
    ELITE_MINE_INTERVAL_MAX: 12.0,
    ELITE_DEATH_MINE_CHANCE: 0.15,
};
