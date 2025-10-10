export default class BossSystem {
    constructor(engine) { this.engine = engine; }

    enterBossPhase() {
        const e = this.engine;
        if (e.inBossPhase) return;
        e.inBossPhase = true;
        e.spawnTimer = 0;
        e.nextSpawnIn = Infinity;
        e.clearWorld();
        this.spawnBoss();
    }

    spawnBoss() {
        const e = this.engine;
        e.boss = {
            x: e.bg.CX,
            y: e.bg.CY * 0.5,
            vx: 180 * (Math.random() < 0.5 ? 1 : -1),
            vy: 140 * (Math.random() < 0.5 ? 1 : -1),
            angle: 0,
            hp: 10,
            alive: true,
            radius: 40,
            fireEvery: 800,
            fireT: 0,
        };
    }

    updateBoss(dt) {
        const e = this.engine;
        const b = e.boss;
        if (!b || !b.alive) return;

        b.x += b.vx * dt;
        b.y += b.vy * dt;

        const pad = 40;
        if (b.x < pad || b.x > e.bg.W - pad) b.vx *= -1;
        if (b.y < pad || b.y > e.bg.H - pad) b.vy *= -1;

        b.angle += 0.8 * dt;

        b.fireT += dt * 1000;
        if (b.fireT >= b.fireEvery) {
            b.fireT = 0;
            const dx = e.cursorX - b.x;
            const dy = e.cursorY - b.y;
            const d = Math.hypot(dx, dy) || 1;
            e.enemyBullets.push({
                x: b.x,
                y: b.y,
                vx: (dx / d) * e.GAME.BULLET_SPEED,
                vy: (dy / d) * e.GAME.BULLET_SPEED,
                life: e.GAME.BULLET_LIFE,
                color: Math.random() < 0.5 ? "red" : "blue",
            });
        }

        for (const pb of e.myBullets) {
            if (pb.life <= 0) continue;
            const dx = b.x - pb.x, dy = b.y - pb.y;
            if (dx * dx + dy * dy <= b.radius * b.radius) {
                pb.life = 0;
                b.hp -= 1;
                e.triggerExplosion(b.x, b.y);
                if (b.hp <= 0 && b.alive) {
                    b.alive = false;
                    e.victory = true;
                    e.victoryT = 0;
                    e.clearWorld();
                }
            }
        }
    }

    drawBoss(ctx) {
        const e = this.engine;
        const b = e.boss;
        if (!b || !b.alive) return;

        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.angle);
        const SIZE = 96;
        if (e.bossImgReady) {
            ctx.imageSmoothingEnabled = true;
            ctx.shadowColor = "rgba(255,255,255,0.7)";
            ctx.shadowBlur = 15;
            ctx.drawImage(e.bossImg, -SIZE / 2, -SIZE / 2, SIZE, SIZE);
        } else {
            ctx.fillStyle = "orange";
            ctx.beginPath();
            ctx.arc(0, 0, SIZE / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}
