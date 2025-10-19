import StarfieldBackground from "./StarfieldBackground";
import Renderer from "./Renderer";
import { GAME } from "./config";
import { randBetween } from "./utils";
import { makeEnemy, makeEnemyBullet, makePlayerBullet, makeExplosion } from "./entities";
import bossImage1 from "../assets/alien-head.png";
import bossImage2 from "../assets/angry.png";
import bossImage3 from "../assets/star.png";

/**
 * Engine
 * Handles game loop, physics, inputs, enemy AI, boss fights, and rendering.
 * Refactored for DRY + clarity. All original behavior preserved.
 */
export default class Engine {
    constructor(canvas, { onKill, onReset } = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.onKill = onKill;
        this.onReset = onReset;

        // --- Game State ---
        this.killCount = 0;
        this.gameOver = false;
        this.victory = false;
        this.victoryT = 0;
        this.justReset = false;
        this.playerHitCount = 100;

        // iOS Safari fix for touch drag
        this.canvas.style.touchAction = "none";
        this.canvas.style.userSelect = "none";
        this.canvas.style.webkitUserSelect = "none";
        this.canvas.style.webkitTouchCallout = "none";

        // --- Boss Config ---
        this.inBossPhase = false;
        this.boss = null;
        this.nextEnemyAt = 0;

        // Randomize boss image
        const bossImages = [bossImage1, bossImage2, bossImage3];
        this.bossImg = new Image();
        this.bossImgReady = false;
        this.bossImg.onload = () => (this.bossImgReady = true);
        this.bossImg.src = bossImages[Math.floor(Math.random() * bossImages.length)];

        // --- Background + Renderer ---
        this.bg = new StarfieldBackground();
        this.renderer = new Renderer();

        // Galaxy background (for victory scene)
        this.bgImg = new Image();
        this.bgImgReady = false;
        this.bgImg.onload = () => (this.bgImgReady = true);
        this.bgImg.src = new URL("../assets/galaxy.jpeg", import.meta.url).href;

        // --- Entities ---
        this.enemies = [];
        this.enemyBullets = [];
        this.myBullets = [];
        this.explosions = [];

        // --- Cursor (player pos) ---
        this.cursorX = 0;
        this.cursorY = 0;

        // --- Spawning ---
        this.spawnTimer = 0;
        this.nextSpawnIn = randBetween(GAME.ENEMY_MIN_SPAWN_MS, GAME.ENEMY_MAX_SPAWN_MS);

        // --- Timing ---
        this.lastT = performance.now();
        this.raf = 0;

        // --- Bind Methods ---
        this.frame = this.frame.bind(this);
        this.onMove = this.onMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.blockContextMenu = this.blockContextMenu.bind(this);
        this.onExternalFire = this.onExternalFire.bind(this);
        this.onExternalMove = this.onExternalMove.bind(this);
        this.onResize = this.onResize.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.onMultiTouch = this.onMultiTouch.bind(this);

        // --- Event Listeners ---
        this.onResize();
        window.addEventListener("resize", this.onResize);
        window.addEventListener("mousemove", this.onMove);
        window.addEventListener("mousedown", this.onMouseDown);
        window.addEventListener("contextmenu", this.blockContextMenu);
        window.addEventListener("player-fire", this.onExternalFire);
        window.addEventListener("player-move", this.onExternalMove);
        window.addEventListener("keydown", this.onKeyDown);
        this.canvas.addEventListener("touchstart", this.onTouchMove, { passive: false });
        this.canvas.addEventListener("touchmove", this.onTouchMove, { passive: false });
        this.canvas.addEventListener("touchend", this.onTouchEnd, { passive: false });
        window.addEventListener("touchstart", this.onMultiTouch, { passive: false });

        this.raf = requestAnimationFrame(this.frame);
    }

    // ============================================================
    // 🧩 Reusable Helpers
    // ============================================================

    _setCursor(x, y) { this.cursorX = x; this.cursorY = y; }
    _dist2(ax, ay, bx, by) { const dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; }
    _isHit(ax, ay, bx, by, radius) { return this._dist2(ax, ay, bx, by) <= radius * radius; }

    /** Device detection (centralized for reuse). */
    _deviceType() {
        const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
        const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
        return { isTouch, isMobile };
    }

    /** Unified reset logic. */
    _resetCore() {
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
        // ✅ Emit all key stats on each update
        this.onKill?.({
            kills: this.killCount,
            playerHP: this.playerHitCount,
            victory: this.victory,
            loss: this.gameOver,
            reset: this.justReset,
        });

        this.onReset?.();
    }

    // ============================================================
    // 🖐️ Input Handlers
    // ============================================================

    onMultiTouch(e) {
        const touches = e.touches?.length || 0;
        if (touches === 2) { e.preventDefault(); console.log("✌️ Two-finger restart"); this.resetGame(); }
        else if (touches === 3) {
            e.preventDefault();
            console.log("🤟 Three-finger 'R' event");
            const evt = new KeyboardEvent("keydown", { key: "r", code: "KeyR" });
            window.dispatchEvent(evt);
        }
    }

    onTouchMove(e) {
        e.preventDefault();
        const t = e.touches[0] || e.changedTouches[0];
        if (!t) return;
        const rect = this.canvas.getBoundingClientRect();
        this._setCursor(t.clientX - rect.left, t.clientY - rect.top);
    }
    onTouchEnd(e) { e.preventDefault(); }
    onMove(e) { this._setCursor(e.clientX, e.clientY); }
    onMouseDown(e) { e.button === 0 ? this.playerFire() : this.playerFire(Math.random() < 0.5 ? "red" : "blue"); }
    blockContextMenu(e) { e.preventDefault(); }

    onExternalFire(e) {
        const { x, y, color } = e.detail || {};
        if (typeof x === "number" && typeof y === "number") this._setCursor(x, y);
        this.playerFire(color);
    }
    onExternalMove(e) {
        const { x, y } = e.detail || {};
        if (typeof x === "number" && typeof y === "number") this._setCursor(x, y);
    }

    onKeyDown(e) {
        if ((e.key || "").toLowerCase() === "r") {
            e.preventDefault();
            this.resetGame();
        }
    }

    // ============================================================
    // 🔁 Game State Control
    // ============================================================

    resetGame() { this._resetCore(); }

    clearWorld() {
        this.enemies.length = 0;
        this.enemyBullets.length = 0;
        this.myBullets.length = 0;
        this.explosions.length = 0;
        this.nextEnemyAt = Infinity;
    }

    onResize() {
        this.canvas.width = this.bg.W = window.innerWidth;
        this.canvas.height = this.bg.H = window.innerHeight;
        this.bg.resize(this.canvas.width, this.canvas.height);
        this._setCursor(this.bg.CX, this.bg.CY);
    }

    destroy() {
        cancelAnimationFrame(this.raf);
        window.removeEventListener("resize", this.onResize);
        window.removeEventListener("mousemove", this.onMove);
        window.removeEventListener("mousedown", this.onMouseDown);
        window.removeEventListener("contextmenu", this.blockContextMenu);
        window.removeEventListener("player-fire", this.onExternalFire);
        window.removeEventListener("player-move", this.onExternalMove);
        window.removeEventListener("keydown", this.onKeyDown);
        this.canvas.removeEventListener("touchstart", this.onTouchMove);
        this.canvas.removeEventListener("touchmove", this.onTouchMove);
        this.canvas.removeEventListener("touchend", this.onTouchEnd);
        window.removeEventListener("touchstart", this.onMultiTouch);
    }

    // ============================================================
    // 🧠 Enemy + Boss Logic
    // ============================================================

    /** 🚀 Spawn a single enemy at a random screen edge. */
    spawnEnemy() {
        const { W, H, CX, CY } = this.bg;
        const edge = Math.floor(Math.random() * 4);
        const m = 40;
        let x, y;

        if (edge === 0) { x = Math.random() * W; y = -m; }
        else if (edge === 1) { x = W + m; y = Math.random() * H; }
        else if (edge === 2) { x = Math.random() * W; y = H + m; }
        else { x = -m; y = Math.random() * H; }

        // 🔹 Movement vector toward player
        const toCX = CX - x;
        const toCY = CY - y;
        const len = Math.hypot(toCX, toCY) || 1;
        const vx = (toCX / len) * GAME.ENEMY_SPEED;
        const vy = (toCY / len) * GAME.ENEMY_SPEED;

        const now = performance.now();

        // ✅ Create full enemy object with all expected props
        const enemy = makeEnemy({
            x,
            y,
            vx,
            vy,
            spd: GAME.ENEMY_SPEED,
            alive: true,           // must exist or won’t render
            angle: 0,              // required for Renderer.rotate()
            wobblePhase: 0,        // used in updateEnemies()
            fireEvery: randBetween(GAME.ENEMY_FIRE_MIN, GAME.ENEMY_FIRE_MAX),
            nextFire: now + randBetween(200, 900),
        });

        // 👇 Fix: entry boost to avoid edge-idle delay
        const ENTRY_BOOST = 1.8;
        enemy.x += vx * ENTRY_BOOST;
        enemy.y += vy * ENTRY_BOOST;

        this.enemies.push(enemy);
    }



    enemyFire(e) {
        const dx = this.cursorX - e.x, dy = this.cursorY - e.y, d = Math.hypot(dx, dy) || 1;
        const bullet = makeEnemyBullet({
            x: e.x, y: e.y, vx: (dx / d) * GAME.BULLET_SPEED, vy: (dy / d) * GAME.BULLET_SPEED,
            life: GAME.BULLET_LIFE, color: Math.random() < 0.5 ? "red" : "blue"
        });
        this.enemyBullets.push(bullet);
    }

    playerFire(color = "green") {
        this.myBullets.push(makePlayerBullet({
            x: this.cursorX, y: this.cursorY, vx: 0, vy: -GAME.MY_BULLET_SPEED,
            life: GAME.MY_BULLET_LIFE, color
        }));
    }

    triggerExplosion(x, y) {
        const ex = makeExplosion({ x, y });
        ex.counted = false;
        this.explosions.push(ex);
    }

    doSpawning(dt) {
        if (this.inBossPhase) return;
        this.spawnTimer += dt * 1000;
        if (this.spawnTimer >= this.nextSpawnIn) {
            this.spawnTimer = 0;
            this.nextSpawnIn = randBetween(GAME.ENEMY_MIN_SPAWN_MS, GAME.ENEMY_MAX_SPAWN_MS);
            this.spawnEnemy();
        }
    }

    enterBossPhase() {
        if (this.inBossPhase) return;
        this.inBossPhase = true;
        this.clearWorld();
        this.spawnBoss();
    }

    /** 👾 Spawn Boss — faster movement + smarter firing */
    spawnBoss() {
        this.boss = {
            x: this.bg.CX,
            y: this.bg.CY * 0.45,
            vx: (Math.random() < 0.5 ? 1 : -1) * (this.bg.W * 0.25), // 👈 screen-relative X speed
            vy: (Math.random() < 0.5 ? 1 : -1) * (this.bg.H * 0.20), // 👈 screen-relative Y speed
            angle: 0,
            hp: 12,
            alive: true,
            radius: 45,
            fireEvery: 400,   // 👈 fires roughly twice per second
            fireT: 0
        };
    }

    /** 👾 Boss movement + firing logic (speed boost + tighter fire loop) */
    updateBoss(dt) {
        const b = this.boss;
        if (!b || !b.alive) return;

        // Move + bounce
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        const pad = 50;
        if (b.x < pad || b.x > this.bg.W - pad) b.vx *= -1;
        if (b.y < pad || b.y > this.bg.H - pad) b.vy *= -1;

        // Smooth rotation
        b.angle += 1.5 * dt;

        // 💣 Boss fires 3-shot bursts of ultra-fast lasers
        b.fireT += dt * 1000;
        if (b.fireT >= b.fireEvery) {
            b.fireT = 0;
            const dx = this.cursorX - b.x;
            const dy = this.cursorY - b.y;
            const d = Math.hypot(dx, dy) || 1;
            const speed = GAME.BOSS_BULLET_SPEED || GAME.BULLET_SPEED * 2.2;

            for (let i = 0; i < 3; i++) {
                const spread = (Math.random() - 0.5) * 0.25;
                const delay = i * 80; // 80ms between each laser
                setTimeout(() => {
                    this.enemyBullets.push({
                        x: b.x,
                        y: b.y,
                        vx: (dx / d) * speed + spread,
                        vy: (dy / d) * speed + spread,
                        life: GAME.BULLET_LIFE,
                        color: i % 2 === 0 ? "red" : "blue",
                    });
                }, delay);
            }
        }

        // 💥 Damage check
        for (const pb of this.myBullets) {
            if (pb.life <= 0) continue;
            if (this._isHit(b.x, b.y, pb.x, pb.y, b.radius)) {
                pb.life = 0;
                b.hp -= 1;
                this.triggerExplosion(b.x, b.y);
                if (b.hp <= 0) {
                    b.alive = false;
                    this.victory = true;
                    this.victoryT = 0;
                    this.clearWorld();
                }
            }
        }
    }

    // ============================================================
    // 🎯 Collisions + Damage
    // ============================================================

    handleCollisions() {
        for (const pb of this.myBullets) {
            if (pb.life <= 0) continue;
            for (const e of this.enemies) {
                if (!e.alive) continue;
                if (this._isHit(e.x, e.y, pb.x, pb.y, GAME.HIT_RADIUS)) {
                    e.alive = false; pb.life = 0; this.triggerExplosion(e.x, e.y);
                    break;
                }
            }
        }
    }

    checkPlayerHit() {
        if (this.victory || this.gameOver) return;
        const R = GAME.PLAYER_HIT_RADIUS || GAME.HIT_RADIUS || 20;
        for (const b of this.enemyBullets) {
            if (b.life <= 0) continue;
            if (this._isHit(this.cursorX, this.cursorY, b.x, b.y, R)) {
                b.life = 0; this.triggerExplosion(this.cursorX, this.cursorY);
                if (this.playerHitCount == 0) { this.gameOver = true; break; }
                this.playerHitCount--;
                this.onKill?.({
                    kills: this.killCount,
                    playerHP: this.playerHitCount,
                    victory: this.victory,
                    loss: this.gameOver,
                });

            }
        }
    }

    // ============================================================
    // 🖼️ UI Overlays
    // ============================================================

    drawGameOver(ctx) {
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, this.bg.W, this.bg.H);
        ctx.textAlign = "center"; ctx.textBaseline = "middle";

        ctx.font = "bold 56px system-ui";
        ctx.fillStyle = "#fff"; ctx.shadowColor = "rgba(255,0,0,0.9)"; ctx.shadowBlur = 20;
        ctx.fillText("GAME OVER", this.bg.CX, this.bg.CY - 10);

        const { isTouch, isMobile } = this._deviceType();
        const restartMessage = isMobile && isTouch ? "✌️ Two-finger tap to restart" : "Press R to restart";

        ctx.font = "20px system-ui";
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fillText(restartMessage, this.bg.CX, this.bg.CY + 28);
        ctx.restore();
    }

    drawVictory(ctx, dt) {
        this.victoryT += dt;
        ctx.save();
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        const pulse = 1 + 0.06 * Math.sin(this.victoryT * 3.2);
        ctx.translate(this.bg.CX, this.bg.CY); ctx.scale(pulse, pulse);

        ctx.font = "bold 64px system-ui";
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.shadowColor = "rgba(255,255,150,0.9)"; ctx.shadowBlur = 30;
        ctx.fillText("VICTORY!", 0, 0);

        const { isTouch, isMobile } = this._deviceType();
        const message = isMobile && isTouch ? "✌️ Two-finger tap to restart" : "Press R to restart";

        ctx.font = "20px system-ui";
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fillText(message, 0, 52);
        ctx.restore();
    }

    // ============================================================
    // ♻️ Cleanup + Culling
    // ============================================================

    cull() {
        const { W, H } = this.bg;
        // Enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            if (!this.enemies[i].alive) {
                this.enemies.splice(i, 1);
                if (!this.inBossPhase && !this.justReset) {
                    this.killCount++;
                    // ✅ Emit all key stats on each update
                    this.onKill?.({
                        kills: this.killCount,
                        playerHP: this.playerHitCount,
                        victory: this.victory,
                        loss: this.gameOver,
                        reset: this.justReset,
                    });
                    if (this.killCount >= 10) this.enterBossPhase();
                }
            }
        }
        // Bullets
        this.enemyBullets = this.enemyBullets.filter(b => b.life > 0 && b.x >= -50 && b.x <= W + 50 && b.y >= -50 && b.y <= H + 50);
        this.myBullets = this.myBullets.filter(b => b.life > 0 && b.x >= -50 && b.x <= W + 50 && b.y >= -50 && b.y <= H + 50);
        // Explosions
        this.explosions = this.explosions.filter(ex => ex.t < GAME.EXPLOSION_TIME);
    }

    // ============================================================
    // 🚀 Main Loop
    // ============================================================

    frame(tNow) {
        const dt = Math.min(0.033, (tNow - this.lastT) / 1000);
        this.lastT = tNow;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.bg.W, this.bg.H);

        // Draw background (starfield or galaxy)
        if (this.victory && this.bgImgReady)
            ctx.drawImage(this.bgImg, 0, 0, this.canvas.width, this.canvas.height);
        else this.bg.updateAndDraw(ctx);

        // Phase: Boss or Normal
        if (this.inBossPhase) {
            this.updateBoss(dt);
            this.drawBoss(ctx);
        } else {
            this.doSpawning(dt);
            const now = performance.now();
            this.updateEnemies?.(dt, now);
            for (const e of this.enemies) if (e.alive) this.renderer.drawEnemy(ctx, e, this.killCount);
        }

        // Overlays + rendering
        if (this.victory) this.drawVictory(ctx, dt);
        for (const b of this.enemyBullets) this.renderer.drawEnemyBullet(ctx, b, dt);
        for (const pb of this.myBullets) this.renderer.drawPlayerBullet(ctx, pb, dt);
        this.handleCollisions();
        this.checkPlayerHit();

        for (const ex of this.explosions) { ex.t += dt; this.renderer.drawExplosion(ctx, ex, dt); }
        if (this.gameOver) this.drawGameOver(ctx);

        this.cull();
        this.justReset = false;
        this.raf = requestAnimationFrame(this.frame);
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

    /** 🧠 Enemy AI update: seek player, bounce, fire */
    updateEnemies(dt, now) {
        const { W, H } = this.bg;
        const PAD = 24;

        for (const e of this.enemies) {
            if (!e.alive) continue;

            // Smoothly steer toward player
            const dx = this.cursorX - e.x;
            const dy = this.cursorY - e.y;
            const dist = Math.hypot(dx, dy) || 1;
            const desiredVX = (dx / dist) * e.spd;
            const desiredVY = (dy / dist) * e.spd;

            e.vx += (desiredVX - e.vx) * 0.08;
            e.vy += (desiredVY - e.vy) * 0.08;

            // Add wobble for less robotic motion
            e.wobblePhase += dt * 2.2;
            const wobble = Math.sin(e.wobblePhase) * 18;
            const ux = e.vx / (e.spd || 1);
            const uy = e.vy / (e.spd || 1);
            const nx = -uy, ny = ux;

            e.x += e.vx * dt + nx * wobble * dt;
            e.y += e.vy * dt + ny * wobble * dt;

            // Bounce off edges
            if (e.x < PAD || e.x > W - PAD) e.vx *= -1;
            if (e.y < PAD || e.y > H - PAD) e.vy *= -1;

            // Face player for rendering
            e.angle = Math.atan2(this.cursorY - e.y, this.cursorX - e.x);

            // Fire logic
            if (now >= e.nextFire) {
                this.enemyFire(e);
                e.nextFire = now + e.fireEvery;
                if (Math.random() < 0.25) e.nextFire = now + e.fireEvery * 0.45;
            }
        }
    }

}
