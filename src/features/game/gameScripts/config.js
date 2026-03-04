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

    // Boss power-up drops
    BOSS_POWERUP_WEIGHTS: { health: 2, shield: 3, firepower: 4 },
    BOSS_POWERUP_DROP_CHANCE: 0.22,

    // Mini-boss (boss split) — harder than the main boss
    MINI_BOSS_HP: 60,
    MINI_BOSS_FIRE_EVERY: 350,
    MINI_BOSS_SIZE: 64,
    MINI_BOSS_POWERUP_DROP_CHANCE: 0.15,
    MINI_BOSS_POWERUP_WEIGHTS: { health: 9, shield: 1 },

    // Mine system
    MINE_FUSE_TIME: 1.8,
    MINE_EXPLOSION_RADIUS: 80,
    MINE_DAMAGE: 20,
    ELITE_MINE_INTERVAL_MIN: 6.0,
    ELITE_MINE_INTERVAL_MAX: 12.0,
    ELITE_DEATH_MINE_CHANCE: 0.15,

    // ------------------------------------------------------------
    // ADMIN LOCAL TEST MODE (manual config only)
    // ------------------------------------------------------------
    // Purpose: Quickly reach end-game locally and verify all flows.
    // How to use:
    // 1) Set ENABLED to true.
    // 2) Tune values below manually.
    // 3) Run local dev server and test.
    // 4) Set ENABLED back to false after local validation.
    ADMIN: {
        ENABLED: true,

        // If true, player takes no bullet/mine damage.
        INVINCIBLE: true,

        // Starting firepower level when game starts/resets.
        // Valid range: 1..FIREPOWER_MAX
        START_FIREPOWER_LEVEL: 5,

        // Multiplies player bullet speed.
        // Example: 3 means 3x faster lasers.
        BULLET_SPEED_MULTIPLIER: 3,

        // Damage applied per player bullet hit (enemies + bosses + mini-bosses).
        // Example: 25 will melt boss HP quickly.
        SHOT_DAMAGE: 25,

        // Number of shot volleys created per trigger/click.
        // Keep this low (1-3) to avoid noisy visuals.
        SHOTS_PER_TRIGGER: 2,
    },
};
