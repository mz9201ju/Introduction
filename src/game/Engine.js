import StarfieldBackground from "./StarfieldBackground";
import Renderer from "./Renderer";
import { GAME } from "./config";
import { randBetween } from "./utils";
import { makeEnemy, makeEnemyBullet, makePlayerBullet, makeExplosion } from "./entities";

// Orchestrates state, physics, spawning, inputs, and the main loop.
export default class Engine {
    constructor(canvas, { onKill } = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.onKill = onKill;

        // Scene pieces
        this.bg = new StarfieldBackground();
        this.renderer = new Renderer();

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

        // Init
        this.onResize();
        window.addEventListener("resize", this.onResize);
        window.addEventListener("mousemove", this.onMove);
        window.addEventListener("mousedown", this.onMouseDown);
        window.addEventListener("contextmenu", this.blockContextMenu);
        window.addEventListener("player-fire", this.onExternalFire);

        this.raf = requestAnimationFrame(this.frame);
    }

    destroy() {
        cancelAnimationFrame(this.raf);
        window.removeEventListener("resize", this.onResize);
        window.removeEventListener("mousemove", this.onMove);
        window.removeEventListener("mousedown", this.onMouseDown);
        window.removeEventListener("contextmenu", this.blockContextMenu);
        window.removeEventListener("player-fire", this.onExternalFire);
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
        this.spawnTimer += dt * 1000;
        if (this.spawnTimer >= this.nextSpawnIn) {
            this.spawnTimer = 0;
            this.nextSpawnIn = randBetween(GAME.ENEMY_MIN_SPAWN_MS, GAME.ENEMY_MAX_SPAWN_MS);
            this.spawnEnemy();
        }
    }

    updateEnemies(dt, now) {
        const { W, H } = this.bg;

        for (const e of this.enemies) {
            if (!e.alive) continue;

            e.wobblePhase += dt * 2.2;
            const wobble = Math.sin(e.wobblePhase) * 18;
            const ux = e.vx / (e.spd || 1), uy = e.vy / (e.spd || 1);
            const nx = -uy, ny = ux;

            e.x += e.vx * dt + nx * wobble * dt;
            e.y += e.vy * dt + ny * wobble * dt;

            const dx = this.cursorX - e.x, dy = this.cursorY - e.y;
            e.angle = Math.atan2(dy, dx);

            if (now >= e.nextFire) {
                this.enemyFire(e);
                e.nextFire = now + e.fireEvery;
                if (Math.random() < 0.25) e.nextFire = now + e.fireEvery * 0.45; // burst
            }

            if (e.x < -200 || e.x > W + 200 || e.y < -200 || e.y > H + 200) e.alive = false;
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

    cull() {
        const { W, H } = this.bg;
        for (let i = this.enemies.length - 1; i >= 0; i--) if (!this.enemies[i].alive) this.enemies.splice(i, 1);
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
                if (!ex.counted && this.onKill) this.onKill();
                ex.counted = true;
                this.explosions.splice(i, 1);
            }
        }
    }

    frame(tNow) {
        const dt = Math.min(0.033, (tNow - this.lastT) / 1000);
        this.lastT = tNow;

        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.bg.W, this.bg.H);

        this.bg.updateAndDraw(ctx);

        this.doSpawning(dt);
        const now = performance.now();

        this.updateEnemies(dt, now);
        for (const e of this.enemies) if (e.alive) this.renderer.drawEnemy(ctx, e);

        for (const b of this.enemyBullets) this.renderer.drawEnemyBullet(ctx, b, dt);
        for (const pb of this.myBullets) this.renderer.drawPlayerBullet(ctx, pb, dt);

        this.handleCollisions();

        for (const ex of this.explosions) {
            ex.t += dt;                // advance time only here
            this.renderer.drawExplosion(ctx, ex, dt);
        }

        this.cull();

        this.raf = requestAnimationFrame(this.frame);
    }
}
