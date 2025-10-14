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
 * Orchestrates state, physics, spawning, inputs, and the main loop.
 * NOTE: This file was annotated + lightly refactored for readability/DRY.
 * Behavior is preserved.
 */
export default class Engine {
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {{onKill?: (e:any)=>void, onReset?: ()=>void}} [hooks]
     */
    constructor(canvas, { onKill, onReset } = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.onKill = onKill;
        this.onReset = onReset;
        this.playerX = 0;
        this.playerY = 0;

        /** Score & state flags */
        this.killCount = 0;
        this.gameOver = false;
        this.victory = false;
        this.victoryT = 0;
        this.justReset = false;
        this.playerHitCount = 100;

        // iOS/Android: do this on the CANVAS
        Object.assign(this.canvas.style, {
            touchAction: "none",
            userSelect: "none",
            webkitUserSelect: "none",
            webkitTouchCallout: "none",
        });

        /** Boss-phase control */
        this.inBossPhase = false;
        this.boss = null;
        this.nextEnemyAt = 0; // kept for parity w/ your notes; spawning uses spawnTimer/nextSpawnIn

        /** Random boss sprite */
        const bossImages = [bossImage1, bossImage2, bossImage3];
        const randomIndex = Math.floor(Math.random() * bossImages.length);
        const chosenImage = bossImages[randomIndex];

        this.bossImg = new Image();
        this.bossImgReady = false;
        this.bossImg.onload = () => (this.bossImgReady = true);
        this.bossImg.src = chosenImage;

        /** Scene pieces */
        this.bg = new StarfieldBackground();
        this.renderer = new Renderer();

        /** Galaxy background shown only after victory */
        this.bgImg = new Image();
        this.bgImgReady = false;
        this.bgImg.onload = () => (this.bgImgReady = true);
        this.bgImg.src = new URL("../assets/galaxy.jpeg", import.meta.url).href;

        /** Runtime state containers */
        this.enemies = [];
        this.enemyBullets = [];
        this.myBullets = [];
        this.explosions = [];

        /** Cursor == player position */
        this.cursorX = 0;
        this.cursorY = 0;

        /** Spawn cadence */
        this.spawnTimer = 0;
        this.nextSpawnIn = randBetween(GAME.ENEMY_MIN_SPAWN_MS, GAME.ENEMY_MAX_SPAWN_MS);

        /** Frame timing */
        this.lastT = performance.now();
        this.raf = 0;

        // Bind handlers once (avoids rebind churn)
        this.frame = this.frame.bind(this);
        this.onMove = this.onMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.blockContextMenu = this.blockContextMenu.bind(this);
        this.onExternalFire = this.onExternalFire.bind(this);
        this.onResize = this.onResize.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
        this.onPointerCancel = this.onPointerCancel.bind(this);


        // Init sizing + listeners
        this.onResize();
        window.addEventListener("resize", this.onResize);
        window.addEventListener("mousemove", this.onMove);
        window.addEventListener("mousedown", this.onMouseDown);
        window.addEventListener("contextmenu", this.blockContextMenu);
        window.addEventListener("player-fire", this.onExternalFire);
        window.addEventListener("keydown", this.onKeyDown);

        // Touch support (passive:false so preventDefault() works)
        this.canvas.addEventListener("touchstart", this.onTouchStart, { passive: false });
        this.canvas.addEventListener("touchmove", this.onTouchMove, { passive: false });
        this.canvas.addEventListener("touchend", this.onTouchEnd, { passive: false });
        this.canvas.addEventListener("gesturestart", (ev) => ev.preventDefault(), { passive: false });

        this.canvas.addEventListener("pointerdown", this.onPointerDown, { passive: false });
        this.canvas.addEventListener("pointermove", this.onPointerMove, { passive: false });
        this.canvas.addEventListener("pointerup", this.onPointerUp, { passive: false });
        this.canvas.addEventListener("pointercancel", this.onPointerCancel, { passive: false });




        this.raf = requestAnimationFrame(this.frame);
    }

    /** Clean teardown: cancel frame + detach listeners. */
    destroy() {
        cancelAnimationFrame(this.raf);
        window.removeEventListener("resize", this.onResize);
        window.removeEventListener("mousemove", this.onMove);
        window.removeEventListener("mousedown", this.onMouseDown);
        window.removeEventListener("contextmenu", this.blockContextMenu);
        window.removeEventListener("player-fire", this.onExternalFire);
        window.removeEventListener("keydown", this.onKeyDown);
        this.canvas.removeEventListener("touchstart", this.onTouchStart);
        this.canvas.removeEventListener("touchmove", this.onTouchMove);
        this.canvas.removeEventListener("touchend", this.onTouchEnd);
        this.canvas.removeEventListener("pointerdown", this.onPointerDown);
        this.canvas.removeEventListener("pointermove", this.onPointerMove);
        this.canvas.removeEventListener("pointerup", this.onPointerUp);
        this.canvas.removeEventListener("pointercancel", this.onPointerCancel);

    }

    // ----------------------------
    // Small, reusable helpers (DRY)
    // ----------------------------

    /** Centralize player/cursor updates (mouse, touch, external). */
    _setCursor(x, y) {
        this.cursorX = x;
        this.cursorY = y;
    }

    /** Fast distance^2 (avoids sqrt). */
    _dist2(ax, ay, bx, by) {
        const dx = ax - bx, dy = ay - by;
        return dx * dx + dy * dy;
    }

    /** Circle hit test using squared radius. */
    _isHit(ax, ay, bx, by, radius) {
        const r2 = radius * radius;
        return this._dist2(ax, ay, bx, by) <= r2;
    }

    /** Renormalize (vx,vy) to target speed `spd` while preserving direction. */
    _renorm(vx, vy, spd) {
        const s = Math.hypot(vx, vy) || 1;
        return [(vx / s) * spd, (vy / s) * spd];
    }

    /** Bounce point+velocity within W×H padded bounds, return new {x,y,vx,vy}. */
    _bounceWithin(x, y, vx, vy, W, H, pad) {
        if (x < pad) { x = pad; vx = Math.abs(vx); }
        else if (x > W - pad) { x = W - pad; vx = -Math.abs(vx); }
        if (y < pad) { y = pad; vy = Math.abs(vy); }
        else if (y > H - pad) { y = H - pad; vy = -Math.abs(vy); }
        return { x, y, vx, vy };
    }

    // ----------------------------
    // Input
    // ----------------------------

    onTouchStart(e) {
        if (e.cancelable) e.preventDefault();
        this._pointerActive = true; // start tracking, but don't set cursor yet
    }

    onPointerDown(e) {
        if (e.cancelable) e.preventDefault();
        this.canvas.setPointerCapture?.(e.pointerId);
        this._pointerActive = true; // no cursor set here -> avoids the initial jump
    }


    onPointerMove(e) {
        if (e.cancelable) e.preventDefault();
        if (!this._pointerActive) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        // console.log('pointermove', x, y);  // TEMP
        this._setCursor(x, y);
    }


    onPointerUp(e) {
        if (e.cancelable) e.preventDefault();
        this._pointerActive = false;
        this.canvas.releasePointerCapture?.(e.pointerId);
    }

    onPointerCancel() {
        this._pointerActive = false;
    }


    /** Touch = direct player movement, no scroll/zoom. */
    onTouchMove(e) {
        if (e.cancelable) e.preventDefault(); // avoids console warnings on some browsers // stop page scroll/zoom
        const t = e.touches[0] || e.changedTouches[0];
        if (!t) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = t.clientX - rect.left;
        const y = t.clientY - rect.top;
        this._setCursor(x, y);
    }

    onTouchEnd(e) {
        if (e.cancelable) e.preventDefault(); // avoids console warnings on some browsers
        // Optional: fire, stop thrust, tap actions, etc.
    }

    /** Keyboard: 'R' = reset (works in all states). */
    onKeyDown(e) {
        const key = (e.key || "").toLowerCase();
        // Always allow 'R' to reset, regardless of state
        if (key === "r") {
            e.preventDefault();
            this.resetGame();
        }

        /**
         * NOTE: The block below duplicates reset semantics specifically when victory is true.
         * Kept as-is to preserve your exact behavior.
         * If you want to fully DRY this, you can remove this block and rely solely on resetGame().
         */
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

            this.onKill?.({ reset: true, kills: 0, absolute: true });
            this.onReset?.();  // <- tell UI to set score = 0
        }

        /**
         * // ✅ DRY alternative (commented, identical behavior):
         * if (key === "r") this.resetGame();
         */
    }

    /** One source of truth for a clean restart. */
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

        this.onKill?.({ reset: true, kills: 0, absolute: true });
        this.onReset?.();
    }

    /** Scale canvas for devicePixelRatio while keeping logic in CSS pixels */
    _applyDPR() {
        const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
        const cssW = window.innerWidth;
        const cssH = window.innerHeight;

        // Set backing store size
        this.canvas.width = Math.floor(cssW * dpr);
        this.canvas.height = Math.floor(cssH * dpr);

        // Keep CSS size unchanged
        this.canvas.style.width = cssW + "px";
        this.canvas.style.height = cssH + "px";

        // Draw using CSS-px coordinates
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Your game world uses CSS pixels
        this.bg.W = cssW;
        this.bg.H = cssH;
        this.bg.resize(cssW, cssH);
    }


    /** Maintain canvas & background sizes on resize. */
    onResize() {
        this._applyDPR();
        this._setCursor(this.bg.CX, this.bg.CY);
        this.playerX = this.cursorX; this.playerY = this.cursorY;
    }


    /** Mouse move drives cursor (player) position. */
    onMove(e) {
        this._setCursor(e.clientX, e.clientY);
    }

    /** LMB = green fire, RMB = random red/blue. */
    onMouseDown(e) {
        if (e.button === 0) {
            this.playerFire(); // left = green
        } else if (e.button === 2) {
            this.playerFire(Math.random() < 0.5 ? "red" : "blue"); // right = red/blue
        }
    }

    /** No context menu in-game. */
    blockContextMenu(e) { e.preventDefault(); }

    /** External fire events (e.g., UI button) can also reposition aim. */
    onExternalFire(e) {
        const { x, y, color } = e.detail || {};
        if (typeof x === "number" && typeof y === "number") this._setCursor(x, y);
        this.playerFire(color);
    }

    // ----------------------------
    // Spawning & bullets
    // ----------------------------

    /** Spawn a single enemy outside the screen, moving toward center. */
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

    /** Enemy bullet aimed at current cursor position. */
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

    /** Player bullet; `colorOverride` defaults to green. */
    playerFire(colorOverride) {
        const bullet = makePlayerBullet({
            x: this.cursorX, y: this.cursorY,
            vx: 0, vy: -GAME.MY_BULLET_SPEED,
            life: GAME.MY_BULLET_LIFE,
            color: colorOverride || "green",
        });
        this.myBullets.push(bullet);
    }

    /** Explosion FX (uncounted until culled). */
    triggerExplosion(x, y) {
        const ex = makeExplosion({ x, y });
        ex.counted = false;
        this.explosions.push(ex);
    }

    /** Controls spawn cadence in normal phase. */
    doSpawning(dt) {
        if (this.inBossPhase) return; // freeze spawns during boss
        this.spawnTimer += dt * 1000;
        if (this.spawnTimer >= this.nextSpawnIn) {
            this.spawnTimer = 0;
            this.nextSpawnIn = randBetween(GAME.ENEMY_MIN_SPAWN_MS, GAME.ENEMY_MAX_SPAWN_MS);
            this.spawnEnemy();
        }
    }

    // ----------------------------
    // Enemy & boss updates
    // ----------------------------

    /** Apply movement, wobble, bounce, retarget fire. */
    updateEnemies(dt, now) {
        const { W, H } = this.bg;
        const PAD = 24; // inset to avoid clipping

        for (const e of this.enemies) {
            if (!e.alive) continue;

            // Curved path wobble
            e.wobblePhase += dt * 2.2;
            const wobble = Math.sin(e.wobblePhase) * 18;
            const ux = e.vx / (e.spd || 1), uy = e.vy / (e.spd || 1);
            const nx = -uy, ny = ux;

            e.x += e.vx * dt + nx * wobble * dt;
            e.y += e.vy * dt + ny * wobble * dt;

            // Bounce off walls, then re-normalize speed
            {
                const b = this._bounceWithin(e.x, e.y, e.vx, e.vy, W, H, PAD);
                e.x = b.x; e.y = b.y; e.vx = b.vx; e.vy = b.vy;
                const [vx, vy] = this._renorm(e.vx, e.vy, e.spd);
                e.vx = vx; e.vy = vy;
            }

            // Face player
            const dx = this.cursorX - e.x, dy = this.cursorY - e.y;
            e.angle = Math.atan2(dy, dx);

            // Fire cadence
            if (now >= e.nextFire) {
                this.enemyFire(e);
                e.nextFire = now + e.fireEvery;
                if (Math.random() < 0.25) e.nextFire = now + e.fireEvery * 0.45; // occasional burst
            }
        }
    }

    /** Hard clear of dynamic entities; keeps engine running. */
    clearWorld() {
        this.enemies.length = 0;
        this.enemyBullets.length = 0;
        this.myBullets.length = 0;
        this.explosions.length = 0;

        // freeze regular spawning (kept for your reference)
        this.nextEnemyAt = Infinity;
    }

    /** Transition into boss phase (idempotent). */
    enterBossPhase() {
        if (this.inBossPhase) return;
        this.inBossPhase = true;
        this.spawnTimer = 0;
        this.nextSpawnIn = Infinity;
        this.clearWorld();
        this.spawnBoss();
    }

    /** Create boss with movement + fire cadence. */
    spawnBoss() {
        this.boss = {
            x: this.bg.CX,             // center horizontally
            y: this.bg.CY * 0.5,       // roughly top middle
            vx: 180 * (Math.random() < 0.5 ? 1 : -1),
            vy: 140 * (Math.random() < 0.5 ? 1 : -1),
            angle: 0,
            hp: 10,
            alive: true,
            radius: 40,
            fireEvery: 150,
            fireT: 0,
        };
    }

    /** Boss movement, bounce, aim/fire, and damage intake. */
    updateBoss(dt) {
        const b = this.boss;
        if (!b || !b.alive) return;

        // Move + bounce
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        const pad = 40;
        if (b.x < pad || b.x > this.bg.W - pad) b.vx *= -1;
        if (b.y < pad || b.y > this.bg.H - pad) b.vy *= -1;

        b.angle += 0.8 * dt;

        // Fire toward player
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

        // Player bullets hit boss
        for (const pb of this.myBullets) {
            if (pb.life <= 0) continue;
            if (this._isHit(b.x, b.y, pb.x, pb.y, b.radius)) {
                pb.life = 0;
                b.hp -= 1;
                this.triggerExplosion(b.x, b.y);

                if (b.hp <= 0 && b.alive) {
                    b.alive = false;
                    this.victory = true;     // win flag
                    this.victoryT = 0;
                    this.clearWorld();       // wipe bullets/fx (optional)
                    // do not re-enter boss phase here
                }
            }
        }
    }

    // ----------------------------
    // Collisions & player damage
    // ----------------------------

    /** Player bullets vs. regular enemies. One bullet = max one kill. */
    handleCollisions() {
        for (const pb of this.myBullets) {
            if (pb.life <= 0) continue;
            for (const e of this.enemies) {
                if (!e.alive) continue;
                if (this._isHit(e.x, e.y, pb.x, pb.y, GAME.HIT_RADIUS)) {
                    e.alive = false;
                    pb.life = 0;
                    this.triggerExplosion(e.x, e.y);
                    break;
                }
            }
        }
    }

    /** Enemy/boss bullets vs. player (cursor). */
    checkPlayerHit() {
        if (this.victory || this.gameOver) return;

        const px = this.cursorX;
        const py = this.cursorY;

        // Prefer GAME.PLAYER_HIT_RADIUS if provided, otherwise fallback.
        const R =
            (GAME && (GAME.PLAYER_HIT_RADIUS || GAME.HIT_RADIUS))
                ? (GAME.PLAYER_HIT_RADIUS || GAME.HIT_RADIUS)
                : 20;

        for (const b of this.enemyBullets) {
            if (b.life <= 0) continue;
            if (this._isHit(px, py, b.x, b.y, R)) {
                // bullet hits the player
                b.life = 0;
                this.triggerExplosion(px, py);
                if (this.playerHitCount == 50) {
                    this.gameOver = true; // hard stop; frame() overlays UI
                    break;
                }
                this.playerHitCount--;
            }
        }
    }

    // ----------------------------
    // UI overlays
    // ----------------------------

    /** Non-intrusive "Game Over" overlay (keeps scene beneath). */
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

    /** Pulsing "VICTORY!" + subtle celebration. */
    drawVictory(ctx, dt) {
        this.victoryT += dt;

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

    // ----------------------------
    // Cleanup / culling
    // ----------------------------

    /** Remove dead entities + count kills + phase transition. */
    cull() {
        const { W, H } = this.bg;

        // Enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) if (!this.enemies[i].alive) {
            this.enemies.splice(i, 1);
            // Only count during normal phase AND not on the reset frame
            if (!this.inBossPhase && !this.justReset) {
                this.killCount++;
                this.onKill?.({ kills: this.killCount, absolute: true });
                if (this.killCount >= 20) this.enterBossPhase();
            }
        }

        // Enemy bullets
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const b = this.enemyBullets[i];
            if (b.life <= 0 || b.x < -50 || b.x > W + 50 || b.y < -50 || b.y > H + 50) {
                this.enemyBullets.splice(i, 1);
            }
        }

        // Player bullets
        for (let i = this.myBullets.length - 1; i >= 0; i--) {
            const pb = this.myBullets[i];
            if (pb.life <= 0 || pb.x < -50 || pb.x > W + 50 || pb.y < -50 || pb.y > H + 50) {
                this.myBullets.splice(i, 1);
            }
        }

        // Explosions
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const ex = this.explosions[i];
            if (ex.t >= GAME.EXPLOSION_TIME) {
                if (!ex.counted) ex.counted = true;
                this.explosions.splice(i, 1);
            }
        }
    }

    // ----------------------------
    // Main loop
    // ----------------------------

    /**
     * Core frame: update, draw, overlay, cull, schedule next tick.
     * @param {number} tNow
     */
    frame(tNow) {
        const dt = Math.min(0.033, (tNow - this.lastT) / 1000);
        this.lastT = tNow;

        // init once
        if (this.playerX == null) { this.playerX = this.cursorX; this.playerY = this.cursorY; }

        // exponential smoothing (lambda≈8 feels snappy)
        const alpha = 1 - Math.exp(-8 * dt);
        this.playerX += (this.cursorX - this.playerX) * alpha;
        this.playerY += (this.cursorY - this.playerY) * alpha;

        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.bg.W, this.bg.H);

        // Background: starfield by default, galaxy after win
        if (this.victory && this.bgImgReady) {
            ctx.drawImage(this.bgImg, 0, 0, this.bg.W, this.bg.H);
        } else {
            this.bg.updateAndDraw(ctx);
        }

        // Branch: Boss vs Normal
        if (this.inBossPhase) {
            this.updateBoss(dt);
            this.drawBoss(ctx);
        } else {
            this.doSpawning(dt);
            const now = performance.now();
            this.updateEnemies(dt, now);
            for (const e of this.enemies) {
                if (e.alive) this.renderer.drawEnemy(ctx, e, this.killCount);
            }
        }

        // Victory overlay (after bg + phase branch)
        if (this.victory) {
            this.drawVictory(ctx, dt);
        }

        // Common renders
        for (const b of this.enemyBullets) this.renderer.drawEnemyBullet(ctx, b, dt);
        for (const pb of this.myBullets) this.renderer.drawPlayerBullet(ctx, pb, dt);

        // Collisions
        this.handleCollisions();
        this.checkPlayerHit();

        // FX
        for (const ex of this.explosions) {
            ex.t += dt;
            this.renderer.drawExplosion(ctx, ex, dt);
        }

        // Game over UI overlay (keeps scene)
        if (this.gameOver) {
            this.drawGameOver(this.ctx);
        }

        // Prune dead/out-of-bounds
        this.cull();

        // Reset reset-flag + loop
        this.justReset = false;
        this.raf = requestAnimationFrame(this.frame);
    }

    // ----------------------------
    // Rendering helpers (kept same)
    // ----------------------------

    /** Boss draw with glow + fallback circle. */
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
}
