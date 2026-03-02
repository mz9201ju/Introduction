import enemyShip1 from "../assets/enemySpaceShip.png";
import enemyShip2 from "../assets/alien.png";
import enemyShip3 from "../assets/alien-ship.png";
import enemyShip4 from "../assets/enemyShip.png";
import enemyShip5 from "../assets/evilShip.png";
import enemyShip6 from "../assets/enemyFigterShip.png";
import enemyShip7 from "../assets/ufo.png";

import { GAME } from "./config";

// Handles drawing of enemies, bullets, explosions, and ship sprite.
export default class Renderer {
    constructor() {
        const enemyImages = [
            enemyShip1, enemyShip2, enemyShip3,
            enemyShip4, enemyShip5, enemyShip6, enemyShip7
        ];

        // Preload all enemy sprites
        this.enemyImgs = enemyImages.map((src) => {
            const img = new Image();
            const slot = { img, ready: false };
            img.onload = () => (slot.ready = true);
            img.src = src;
            return slot;
        });

        // Cache: enemy object -> sprite index
        this.enemySprite = new WeakMap();
    }

    drawEnemy(ctx, e) {
        // get or assign a stable sprite index for this enemy
        const n = this.enemyImgs.length;
        let idx = this.enemySprite.get(e);
        if (idx == null) {
            idx = Math.floor(Math.random() * n);
            this.enemySprite.set(e, idx);
        }
        const slot = this.enemyImgs[idx];
        const SIZE = e.isElite ? GAME.ELITE_SIZE : 28;

        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(e.angle);
        if (slot?.ready) {
            ctx.imageSmoothingEnabled = true;
            ctx.shadowColor = e.isElite ? "rgba(255,200,0,0.9)" : "rgba(255,255,255,0.6)";
            ctx.shadowBlur = e.isElite ? 18 : 8;
            ctx.drawImage(slot.img, -SIZE / 2, -SIZE / 2, SIZE, SIZE);
        }
        // Elite HP indicator (small pips below the sprite)
        if (e.isElite && e.hp > 0) {
            ctx.shadowBlur = 0;
            for (let i = 0; i < e.hp; i++) {
                ctx.fillStyle = "rgba(255,200,0,0.9)";
                ctx.beginPath();
                ctx.arc(-4 + i * 5, SIZE / 2 + 5, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
    }

    drawEnemyBullet(ctx, b, dt) {
        b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;

        ctx.save();
        if (b.laser) {
            ctx.strokeStyle = "rgba(255, 30, 0, 0.97)";
            ctx.lineWidth = 14;
            ctx.shadowColor = "rgba(255,80,0,1)";
            ctx.shadowBlur = 28;
        } else if (b.heavy) {
            ctx.strokeStyle = b.color === "red" ? "rgba(255,120,0,0.95)" : "rgba(180,60,255,0.95)";
            ctx.lineWidth = 5;
        } else {
            ctx.strokeStyle = b.color === "red" ? "rgba(255,60,60,0.95)" : "rgba(40,160,255,0.95)";
            ctx.lineWidth = 2.5;
        }
        const trail = b.laser ? 52 : b.heavy ? 28 : 14;
        const len = Math.hypot(b.vx, b.vy) || 1;
        const tx = (b.vx / len) * trail, ty = (b.vy / len) * trail;
        ctx.beginPath();
        ctx.moveTo(b.x - tx, b.y - ty);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.restore();

        if (b.life <= 0) b.life = 0;
    }

    drawPlayerBullet(ctx, pb, dt) {
        pb.x += pb.vx * dt; pb.y += pb.vy * dt; pb.life -= dt;

        ctx.save();
        if (pb.color === "red") ctx.strokeStyle = "rgba(255, 60, 60, 0.95)";
        else if (pb.color === "blue") ctx.strokeStyle = "rgba(40, 160, 255, 0.95)";
        else ctx.strokeStyle = "rgba(120, 255, 140, 0.95)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(pb.x, pb.y + 18);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
        ctx.restore();

        if (pb.life <= 0) pb.life = 0;
    }

    // Pure draw: does NOT mutate ex.t
    drawExplosion(ctx, ex) {
        const p = Math.min(1, ex.t / GAME.EXPLOSION_TIME);
        const r = 10 + 42 * p, alpha = 1 - p;
        ctx.save();
        ctx.globalAlpha = alpha;
        const grad = ctx.createRadialGradient(ex.x, ex.y, 0, ex.x, ex.y, r);
        grad.addColorStop(0, "rgba(255,240,200,1)");
        grad.addColorStop(0.4, "rgba(255,140,40,0.9)");
        grad.addColorStop(1, "rgba(160,20,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(ex.x, ex.y, r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    drawHealthPickup(ctx, p) {
        const pulse = 1 + 0.18 * Math.sin(p.t * 4.5);
        const fade = Math.min(1, p.life / 1.5);
        const radius = GAME.HEALTH_PICKUP_RADIUS * pulse;
        ctx.save();
        ctx.globalAlpha = fade * 0.92;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        grad.addColorStop(0, "rgba(180,255,220,1)");
        grad.addColorStop(0.5, "rgba(0,220,120,0.85)");
        grad.addColorStop(1, "rgba(0,180,80,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
        // Cross symbol
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        const arm = radius * 0.45;
        ctx.beginPath(); ctx.moveTo(p.x, p.y - arm); ctx.lineTo(p.x, p.y + arm); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(p.x - arm, p.y); ctx.lineTo(p.x + arm, p.y); ctx.stroke();
        ctx.restore();
    }

    drawForceField(ctx, x, y, timer, maxTimer) {
        const frac = Math.max(0, timer / maxTimer);
        const pulse = 1 + 0.08 * Math.sin(timer * 8);
        const radius = 36 * pulse;
        ctx.save();
        ctx.globalAlpha = 0.35 + 0.2 * frac;
        const grad = ctx.createRadialGradient(x, y, radius * 0.3, x, y, radius);
        grad.addColorStop(0, "rgba(80,200,255,0)");
        grad.addColorStop(0.6, "rgba(80,200,255,0.5)");
        grad.addColorStop(1, "rgba(40,120,255,0.9)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(120,220,255,${0.7 + 0.3 * frac})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }
}
