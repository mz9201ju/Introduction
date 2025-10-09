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
        const enemyImages = [enemyShip1, enemyShip2, enemyShip3, enemyShip4, enemyShip5, enemyShip6, enemyShip7];
        const randomIndex = Math.floor(Math.random() * enemyImages.length);
        const chosenImage = enemyImages[randomIndex];


        this.enemyImg = new Image();
        this.enemyImgReady = false;
        this.enemyImg.onload = () => (this.enemyImgReady = true);
        this.enemyImg.src = chosenImage;
    }

    drawEnemy(ctx, e) {
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(e.angle);
        const SIZE = 28;
        if (this.enemyImgReady) {
            ctx.imageSmoothingEnabled = true;
            ctx.shadowColor = "rgba(255,255,255,0.6)";
            ctx.shadowBlur = 8;
            ctx.drawImage(this.enemyImg, -SIZE / 2, -SIZE / 2, SIZE, SIZE);
        }
        ctx.restore();
    }

    drawEnemyBullet(ctx, b, dt) {
        b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;

        ctx.save();
        ctx.strokeStyle = b.color === "red" ? "rgba(255,60,60,0.95)" : "rgba(40,160,255,0.95)";
        ctx.lineWidth = 2.5;
        const trail = 14, len = Math.hypot(b.vx, b.vy) || 1;
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
    drawExplosion(ctx, ex, dt) {
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
}
