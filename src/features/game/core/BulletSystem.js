export default class BulletSystem {
    constructor(engine) { this.engine = engine; }

    enemyFire(en) {
        const e = this.engine;
        const dx = e.cursorX - en.x, dy = e.cursorY - en.y;
        const d = Math.hypot(dx, dy) || 1;
        const bullet = e.makeEnemyBullet({
            x: en.x, y: en.y,
            vx: (dx / d) * e.GAME.BULLET_SPEED,
            vy: (dy / d) * e.GAME.BULLET_SPEED,
            life: e.GAME.BULLET_LIFE,
            color: Math.random() < 0.5 ? "red" : "blue",
        });
        e.enemyBullets.push(bullet);
    }

    playerFire(colorOverride) {
        const e = this.engine;
        const bullet = e.makePlayerBullet({
            x: e.cursorX, y: e.cursorY,
            vx: 0, vy: -e.GAME.MY_BULLET_SPEED,
            life: e.GAME.MY_BULLET_LIFE,
            color: colorOverride || "green",
        });
        e.myBullets.push(bullet);
    }

    cullOutOfBounds() {
        const e = this.engine;
        const { W, H } = e.bg;
        for (let i = e.enemyBullets.length - 1; i >= 0; i--) {
            const b = e.enemyBullets[i];
            if (b.life <= 0 || b.x < -50 || b.x > W + 50 || b.y < -50 || b.y > H + 50) e.enemyBullets.splice(i, 1);
        }
        for (let i = e.myBullets.length - 1; i >= 0; i--) {
            const pb = e.myBullets[i];
            if (pb.life <= 0 || pb.x < -50 || pb.x > W + 50 || pb.y < -50 || pb.y > H + 50) e.myBullets.splice(i, 1);
        }
    }
}
