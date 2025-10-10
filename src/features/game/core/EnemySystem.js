export default class EnemySystem {
    constructor(engine) { this.engine = engine; }

    spawnEnemy() {
        const e = this.engine;
        const { W, H, CX, CY } = e.bg;
        const edge = Math.floor(Math.random() * 4);
        let x, y;
        const m = 40;
        if (edge === 0) { x = Math.random() * W; y = -m; }
        else if (edge === 1) { x = W + m; y = Math.random() * H; }
        else if (edge === 2) { x = Math.random() * W; y = H + m; }
        else { x = -m; y = Math.random() * H; }

        const toCX = CX - x, toCY = CY - y;
        const len = Math.hypot(toCX, toCY) || 1;
        const vx = (toCX / len) * e.GAME.ENEMY_SPEED;
        const vy = (toCY / len) * e.GAME.ENEMY_SPEED;

        const now = performance.now();
        const enemy = e.makeEnemy({
            x, y, vx, vy,
            spd: e.GAME.ENEMY_SPEED,
            fireEvery: e.randBetween(e.GAME.ENEMY_FIRE_MIN, e.GAME.ENEMY_FIRE_MAX),
            nextFire: now + e.randBetween(200, 900),
        });
        e.enemies.push(enemy);
    }

    updateEnemies(dt, now) {
        const e = this.engine;
        const { W, H } = e.bg;
        const PAD = 24;

        for (const en of e.enemies) {
            if (!en.alive) continue;

            en.wobblePhase += dt * 2.2;
            const wobble = Math.sin(en.wobblePhase) * 18;
            const ux = en.vx / (en.spd || 1), uy = en.vy / (en.spd || 1);
            const nx = -uy, ny = ux;

            en.x += en.vx * dt + nx * wobble * dt;
            en.y += en.vy * dt + ny * wobble * dt;

            if (en.x < PAD) { en.x = PAD; en.vx = Math.abs(en.vx); }
            else if (en.x > W - PAD) { en.x = W - PAD; en.vx = -Math.abs(en.vx); }
            if (en.y < PAD) { en.y = PAD; en.vy = Math.abs(en.vy); }
            else if (en.y > H - PAD) { en.y = H - PAD; en.vy = -Math.abs(en.vy); }

            const s = Math.hypot(en.vx, en.vy) || 1;
            en.vx = (en.vx / s) * en.spd;
            en.vy = (en.vy / s) * en.spd;

            const dx = e.cursorX - en.x, dy = e.cursorY - en.y;
            en.angle = Math.atan2(dy, dx);

            if (now >= en.nextFire) {
                e.enemyFire(en);
                en.nextFire = now + en.fireEvery;
                if (Math.random() < 0.25) en.nextFire = now + en.fireEvery * 0.45;
            }
        }
    }

    cullDead() {
        const e = this.engine;
        for (let i = e.enemies.length - 1; i >= 0; i--) if (!e.enemies[i].alive) e.enemies.splice(i, 1);
    }
}
