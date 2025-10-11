import StarfieldBackground from "./StarfieldBackground";
import Renderer from "./Renderer";
import { GAME } from "./config";
import { randBetween } from "./utils";
import { makeEnemy, makeEnemyBullet, makePlayerBullet, makeExplosion } from "./entities";
import bossImage1 from "../assets/alien-head.png";
import bossImage2 from "../assets/angry.png";
import bossImage3 from "../assets/star.png"

// Orchestrates state, physics, spawning, inputs, and the main loop.
export default class Engine {
    constructor(canvas, { onKill, onReset } = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.onKill = onKill;
        this.onReset = onReset;
        this.killCount = 0;
        this.gameOver = false;
        this.victory = false;
        this.victoryT = 0;
        this.justReset = false;
        this.playerHitCount = 100;

        this.inBossPhase = false;
        this.boss = null;
        this.nextEnemyAt = 0; // you likely already have this; we’ll freeze it in boss phase.

        const bossImages = [bossImage1, bossImage2, bossImage3];
        const randomIndex = Math.floor(Math.random() * bossImages.length);
        const chosenImage = bossImages[randomIndex];

        // (optional) boss sprite
        this.bossImg = new Image();
        this.bossImgReady = false;
        this.bossImg.onload = () => (this.bossImgReady = true);
        this.bossImg.src = chosenImage;

        // Scene pieces
        this.bg = new StarfieldBackground();
        this.renderer = new Renderer();

        // createGalaxyBackGroundImage
        this.bgImg = new Image();
        this.bgImgReady = false;
        this.bgImg.onload = () => (this.bgImgReady = true);
        this.bgImg.src = new URL("../assets/galaxy.jpeg", import.meta.url).href;;

        // Runtime state
        this.enemies = [];
        this.enemyBullets = [];
        this.myBullets = [];
        this.explosions = [];

        this.cursorX = 0; this.cursorY = 0;

        this.spawnTimer = 0;
        this.nextSpawnIn = randBetween(GAME.ENEMY_MIN_SPAWN_MS, GAME.ENEMY_MAX_SPAWN_MS);
        this.lastT = performance.now();
        this.raf = 0;

        // Bind handlers
        this.frame = this.frame.bind(this);
        this.onMove = this.onMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.blockContextMenu = this.blockContextMenu.bind(this);
        this.onExternalFire = this.onExternalFire.bind(this);
        this.onResize = this.onResize.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);

        // Init
        this.onResize();
        window.addEventListener("resize", this.onResize);
        window.addEventListener("mousemove", this.onMove);
        window.addEventListener("mousedown", this.onMouseDown);
        window.addEventListener("contextmenu", this.blockContextMenu);
        window.addEventListener("player-fire", this.onExternalFire);
        window.addEventListener("keydown", this.onKeyDown);

        this.raf = requestAnimationFrame(this.frame);
    }

    onKeyDown(e) {
        const key = (e.key || "").toLowerCase();
        // Always allow 'R' to reset, regardless of state
        if (key === "r") {
            e.preventDefault();
            this.resetGame();
        }

        if (e.key.toLowerCase() === "r" && this.victory) {
            this.victory = false;
            this.victoryT = 0;
            this.gameOver = false;     // ← allow restart after death
            this.playerHitCount = 100;

            this.inBossPhase = false;
            this.boss = null;

            this.killCount = 0;
            this.clearWorld();

            this.spawnTimer = 0;
            this.nextSpawnIn = randBetween(GAME.ENEMY_MIN_SPAWN_MS, GAME.ENEMY_MAX_SPAWN_MS);

            this.lastT = performance.now();
            this.justReset = true; // <-- tells cull() to ignore any stale explosions this frame

            this.onKill({ reset: true, kills: 0, absolute: true });
            this.onReset();  // <- tell UI to set score = 0
        }
    }

    // single source of truth for resetting the game
    resetGame() {
        this.victory = false;
        this.victoryT = 0;
        this.gameOver = false;
        this.playerHitCount = 100;

        this.inBossPhase = false;
        this.boss = null;

        this.killCount = 0;
        this.clearWorld();

        this.spawnTimer = 0;
        this.nextSpawnIn = randBetween(GAME.ENEMY_MIN_SPAWN_MS, GAME.ENEMY_MAX_SPAWN_MS);

        this.lastT = performance.now();
        this.justReset = true;

        this.onKill({ reset: true, kills: 0, absolute: true });
        this.onReset();
    }

    destroy() {
        cancelAnimationFrame(this.raf);
        window.removeEventListener("resize", this.onResize);
        window.removeEventListener("mousemove", this.onMove);
        window.removeEventListener("mousedown", this.onMouseDown);
        window.removeEventListener("contextmenu", this.blockContextMenu);
        window.removeEventListener("player-fire", this.onExternalFire);
        window.removeEventListener("keydown", this.onKeyDown);
    }

    onResize() {
        this.canvas.width = this.bg.W = window.innerWidth;
        this.canvas.height = this.bg.H = window.innerHeight;
        this.bg.resize(this.canvas.width, this.canvas.height);
        this.cursorX = this.bg.CX; this.cursorY = this.bg.CY;
    }

    onMove(e) { this.cursorX = e.clientX; this.cursorY = e.clientY; }

    onMouseDown(e) {
        if (e.button === 0) {
            this.playerFire(); // left = green
        } else if (e.button === 2) {
            this.playerFire(Math.random() < 0.5 ? "red" : "blue"); // right = red/blue
        }
    }

    blockContextMenu(e) { e.preventDefault(); }

    onExternalFire(e) {
        const { x, y, color } = e.detail || {};
        if (typeof x === "number" && typeof y === "number") { this.cursorX = x; this.cursorY = y; }
        this.playerFire(color);
    }

    spawnEnemy() {
        const { W, H, CX, CY } = this.bg;
        const edge = Math.floor(Math.random() * 4);
        let x, y;
        const m = 40;
        if (edge === 0) { x = Math.random() * W; y = -m; }
        else if (edge === 1) { x = W + m; y = Math.random() * H; }
        else if (edge === 2) { x = Math.random() * W; y = H + m; }
        else { x = -m; y = Math.random() * H; }

        const toCX = CX - x, toCY = CY - y;
        const len = Math.hypot(toCX, toCY) || 1;
        const vx = (toCX / len) * GAME.ENEMY_SPEED;
        const vy = (toCY / len) * GAME.ENEMY_SPEED;

        const now = performance.now();
        const enemy = makeEnemy({
            x, y, vx, vy,
            spd: GAME.ENEMY_SPEED,
            fireEvery: randBetween(GAME.ENEMY_FIRE_MIN, GAME.ENEMY_FIRE_MAX),
            nextFire: now + randBetween(200, 900),
        });

        this.enemies.push(enemy);
    }

    enemyFire(e) {
        const dx = this.cursorX - e.x, dy = this.cursorY - e.y;
        const d = Math.hypot(dx, dy) || 1;
        const bullet = makeEnemyBullet({
            x: e.x, y: e.y,
            vx: (dx / d) * GAME.BULLET_SPEED,
            vy: (dy / d) * GAME.BULLET_SPEED,
            life: GAME.BULLET_LIFE,
            color: Math.random() < 0.5 ? "red" : "blue",
        });
        this.enemyBullets.push(bullet);
    }

    playerFire(colorOverride) {
        const bullet = makePlayerBullet({
            x: this.cursorX, y: this.cursorY,
            vx: 0, vy: -GAME.MY_BULLET_SPEED,
            life: GAME.MY_BULLET_LIFE,
            color: colorOverride || "green",
        });
        this.myBullets.push(bullet);
    }

    triggerExplosion(x, y) {
        const ex = makeExplosion({ x, y });
        ex.counted = false;
        this.explosions.push(ex);
    }

    doSpawning(dt) {
        if (this.inBossPhase) return; // <-- add this guard for Boss
        this.spawnTimer += dt * 1000;
        if (this.spawnTimer >= this.nextSpawnIn) {
            this.spawnTimer = 0;
            this.nextSpawnIn = randBetween(GAME.ENEMY_MIN_SPAWN_MS, GAME.ENEMY_MAX_SPAWN_MS);
            this.spawnEnemy();
        }
    }


    updateEnemies(dt, now) {
        const { W, H } = this.bg;
        const PAD = 24; // small inset so sprites don’t clip the edge

        for (const e of this.enemies) {
            if (!e.alive) continue;

            e.wobblePhase += dt * 2.2;
            const wobble = Math.sin(e.wobblePhase) * 18;
            const ux = e.vx / (e.spd || 1), uy = e.vy / (e.spd || 1);
            const nx = -uy, ny = ux;

            e.x += e.vx * dt + nx * wobble * dt;
            e.y += e.vy * dt + ny * wobble * dt;

            // --- bounce off walls ---
            // clamp + reflect velocity, preserve speed magnitude
            if (e.x < PAD) {
                e.x = PAD;
                e.vx = Math.abs(e.vx);
            } else if (e.x > W - PAD) {
                e.x = W - PAD;
                e.vx = -Math.abs(e.vx);
            }
            if (e.y < PAD) {
                e.y = PAD;
                e.vy = Math.abs(e.vy);
            } else if (e.y > H - PAD) {
                e.y = H - PAD;
                e.vy = -Math.abs(e.vy);
            }

            // keep velocity at target speed after reflections
            {
                const s = Math.hypot(e.vx, e.vy) || 1;
                e.vx = (e.vx / s) * e.spd;
                e.vy = (e.vy / s) * e.spd;
            }

            const dx = this.cursorX - e.x, dy = this.cursorY - e.y;
            e.angle = Math.atan2(dy, dx);

            if (now >= e.nextFire) {
                this.enemyFire(e);
                e.nextFire = now + e.fireEvery;
                if (Math.random() < 0.25) e.nextFire = now + e.fireEvery * 0.45; // burst
            }
        }
    }

    handleCollisions() {
        for (const pb of this.myBullets) {
            if (pb.life <= 0) continue;
            for (const e of this.enemies) {
                if (!e.alive) continue;
                const dx = e.x - pb.x, dy = e.y - pb.y;
                if (dx * dx + dy * dy <= GAME.HIT_RADIUS * GAME.HIT_RADIUS) {
                    e.alive = false;
                    pb.life = 0;
                    this.triggerExplosion(e.x, e.y);
                    break; // one bullet -> at most one kill
                }
            }
        }
    }

    clearWorld() {
        // hard reset of swarm state but keep the engine alive
        this.enemies.length = 0;
        this.enemyBullets.length = 0;
        this.myBullets.length = 0;
        this.explosions.length = 0;

        // freeze regular spawning
        this.nextEnemyAt = Infinity;
    }

    enterBossPhase() {
        if (this.inBossPhase) return;   // <-- guard
        this.inBossPhase = true;
        this.spawnTimer = 0;            // freeze spawns
        this.nextSpawnIn = Infinity;
        this.clearWorld();
        this.spawnBoss();
    }

    spawnBoss() {
        this.boss = {
            x: this.bg.CX,  // center horizontally
            y: this.bg.CY * 0.5, // roughly top middle
            vx: 180 * (Math.random() < 0.5 ? 1 : -1), // random left/right direction
            vy: 140 * (Math.random() < 0.5 ? 1 : -1), // random up/down
            angle: 0,
            hp: 10,
            alive: true,
            radius: 40,
            fireEvery: 150,
            fireT: 0,
        };
    }


    updateBoss(dt) {
        const b = this.boss;
        if (!b || !b.alive) return;

        // Move and bounce within screen bounds
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        const pad = 40;
        if (b.x < pad || b.x > this.bg.W - pad) b.vx *= -1;
        if (b.y < pad || b.y > this.bg.H - pad) b.vy *= -1;

        b.angle += 0.8 * dt;

        // Fire bullets toward the player
        b.fireT += dt * 1000;
        if (b.fireT >= b.fireEvery) {
            b.fireT = 0;
            const dx = this.cursorX - b.x;
            const dy = this.cursorY - b.y;
            const d = Math.hypot(dx, dy) || 1;
            const bullet = {
                x: b.x,
                y: b.y,
                vx: (dx / d) * GAME.BULLET_SPEED,
                vy: (dy / d) * GAME.BULLET_SPEED,
                life: GAME.BULLET_LIFE,
                color: Math.random() < 0.5 ? "red" : "blue",
            };
            this.enemyBullets.push(bullet);
        }

        // Detect player bullet hits
        for (const pb of this.myBullets) {
            if (pb.life <= 0) continue;
            const dx = b.x - pb.x, dy = b.y - pb.y;
            if (dx * dx + dy * dy <= b.radius * b.radius) {
                pb.life = 0;
                b.hp -= 1;
                this.triggerExplosion(b.x, b.y);

                if (b.hp <= 0 && b.alive) {
                    b.alive = false;
                    this.victory = true;     // <-- flag win
                    this.victoryT = 0;
                    this.clearWorld();       // optional: wipe bullets/fx
                    // DO NOT call enterBossPhase() here
                }
            }
        }
    }


    drawBoss(ctx) {
        const b = this.boss;
        if (!b || !b.alive) return;

        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.angle);
        const SIZE = 96;
        if (this.bossImgReady) {
            ctx.imageSmoothingEnabled = true;
            ctx.shadowColor = "rgba(255,255,255,0.7)";
            ctx.shadowBlur = 15;
            ctx.drawImage(this.bossImg, -SIZE / 2, -SIZE / 2, SIZE, SIZE);
        } else {
            ctx.fillStyle = "orange";
            ctx.beginPath();
            ctx.arc(0, 0, SIZE / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    drawVictory(ctx, dt) {
        this.victoryT += dt;

        // subtle starfield slow-down effect (optional)
        // if your StarfieldBackground supports a speed param, tweak it here

        // pulsing “VICTORY!”
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const t = this.victoryT;
        const pulse = 1 + 0.06 * Math.sin(t * 3.2);
        ctx.translate(this.bg.CX, this.bg.CY);
        ctx.scale(pulse, pulse);

        ctx.font = "bold 64px system-ui";
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.shadowColor = "rgba(255,255,150,0.9)";
        ctx.shadowBlur = 30;
        ctx.fillText("VICTORY! 100 shots!", 0, 0);

        ctx.font = "20px system-ui";
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fillText("Press R to restart", 0, 52);
        ctx.restore();
    }

    // detect player (cursor) getting hit by enemy/boss lasers
    checkPlayerHit() {
        if (this.victory || this.gameOver) return;

        const px = this.cursorX;
        const py = this.cursorY;

        // Use a small radius for the player's hit circle.
        // Will honor GAME.PLAYER_HIT_RADIUS if you add it; otherwise falls back to GAME.HIT_RADIUS or 20.
        const R =
            (GAME && (GAME.PLAYER_HIT_RADIUS || GAME.HIT_RADIUS)) ? (GAME.PLAYER_HIT_RADIUS || GAME.HIT_RADIUS) : 20;
        const R2 = R * R;
        for (const b of this.enemyBullets) {
            if (b.life <= 0) continue;
            const dx = px - b.x, dy = py - b.y;
            if (dx * dx + dy * dy <= R2) {
                // bullet hits the player
                b.life = 0;
                this.triggerExplosion(px, py);
                if (this.playerHitCount == 50) {
                    this.gameOver = true;       // hard stop (your frame() already handles this)
                    break;
                }
                this.playerHitCount--;
            }
        }
    }

    // paint a non-intrusive "Game Over" overlay
    drawGameOver(ctx) {
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, this.bg.W, this.bg.H);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.font = "bold 56px system-ui";
        ctx.fillStyle = "#fff";
        ctx.fillText("GAME OVER", this.bg.CX, this.bg.CY - 10);

        ctx.font = "20px system-ui";
        ctx.fillText("Press R to restart", this.bg.CX, this.bg.CY + 28);
        ctx.restore();
    }

    cull() {
        const { W, H } = this.bg;
        for (let i = this.enemies.length - 1; i >= 0; i--) if (!this.enemies[i].alive) {
            this.enemies.splice(i, 1);
            // Only count during normal phase AND not on the reset frame
            if (!this.inBossPhase && !this.justReset) {
                this.killCount++;
                if (this.onKill) this.onKill({ kills: this.killCount, absolute: true });
                if (this.killCount >= 100) this.enterBossPhase();
            }
        }
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const b = this.enemyBullets[i];
            if (b.life <= 0 || b.x < -50 || b.x > W + 50 || b.y < -50 || b.y > H + 50) this.enemyBullets.splice(i, 1);
        }
        for (let i = this.myBullets.length - 1; i >= 0; i--) {
            const pb = this.myBullets[i];
            if (pb.life <= 0 || pb.x < -50 || pb.x > W + 50 || pb.y < -50 || pb.y > H + 50) this.myBullets.splice(i, 1);
        }
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const ex = this.explosions[i];
            if (ex.t >= GAME.EXPLOSION_TIME) {
                if (!ex.counted) {
                    ex.counted = true;
                }
                this.explosions.splice(i, 1);
            }
        }
    }


    frame(tNow) {
        const dt = Math.min(0.033, (tNow - this.lastT) / 1000);
        this.lastT = tNow;

        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.bg.W, this.bg.H);
        // Only show galaxy background after victory
        if (this.victory && this.bgImgReady) {
            ctx.drawImage(this.bgImg, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.bg.updateAndDraw(ctx); // normal starfield until victory
        }

        if (this.inBossPhase) {
            // === BOSS PHASE ===
            this.updateBoss(dt);
            this.drawBoss(ctx);
        } else {
            // === NORMAL PHASE ===
            this.doSpawning(dt);
            const now = performance.now();
            this.updateEnemies(dt, now);
            for (const e of this.enemies) {
                if (e.alive) this.renderer.drawEnemy(ctx, e, this.killCount);
            }
        }

        // after bg + branch work
        if (this.victory) {
            this.drawVictory(ctx, dt);
        }

        // Common rendering/logic for both phases
        for (const b of this.enemyBullets) this.renderer.drawEnemyBullet(ctx, b, dt);
        for (const pb of this.myBullets) this.renderer.drawPlayerBullet(ctx, pb, dt);

        this.handleCollisions();

        // check if enemy/boss lasers hit the player (cursor)
        this.checkPlayerHit();

        for (const ex of this.explosions) {
            ex.t += dt;
            this.renderer.drawExplosion(ctx, ex, dt);
        }

        if (this.gameOver) {
            // keep whatever you already drew (bg, bullets, etc.) and overlay on top
            this.drawGameOver(this.ctx);
        }

        this.cull();

        this.justReset = false;
        this.raf = requestAnimationFrame(this.frame);
    }
}
