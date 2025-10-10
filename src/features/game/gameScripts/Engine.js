import StarfieldBackground from "./StarfieldBackground";
import Renderer from "./Renderer";
import { GAME } from "./config";
import { randBetween } from "./utils";
import { makeEnemy, makeEnemyBullet, makePlayerBullet, makeExplosion } from "./entities";
import bossImage1 from "../assets/alien-head.png";
import bossImage2 from "../assets/angry.png";
import bossImage3 from "../assets/star.png";
import galaxy from "../assets/galaxy.jpeg";

import EnemySystem from "../core/EnemySystem";
import BulletSystem from "../core/BulletSystem";
import CollisionSystem from "../core/CollisionSystem";
import ExplosionSystem from "../core/ExplosionSystem";
import BossSystem from "../core/BossSystem";

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
    this.inBossPhase = false;
    this.boss = null;
    this.nextEnemyAt = 0;

    const bossImages = [bossImage1, bossImage2, bossImage3];
    const randomIndex = Math.floor(Math.random() * bossImages.length);
    const chosenImage = bossImages[randomIndex];

    this.bossImg = new Image();
    this.bossImgReady = false;
    this.bossImg.onload = () => (this.bossImgReady = true);
    this.bossImg.src = chosenImage;

    this.bg = new StarfieldBackground();
    this.renderer = new Renderer();

    this.bgImg = new Image();
    this.bgImgReady = false;
    this.bgImg.onload = () => (this.bgImgReady = true);
    this.bgImg.src = galaxy;

    this.enemies = [];
    this.enemyBullets = [];
    this.myBullets = [];
    this.explosions = [];

    this.cursorX = 0; this.cursorY = 0;

    this.spawnTimer = 0;
    this.nextSpawnIn = randBetween(GAME.ENEMY_MIN_SPAWN_MS, GAME.ENEMY_MAX_SPAWN_MS);
    this.lastT = performance.now();
    this.raf = 0;

    // expose originals so systems can call same functions/consts
    this.GAME = GAME;
    this.randBetween = randBetween;
    this.makeEnemy = makeEnemy;
    this.makeEnemyBullet = makeEnemyBullet;
    this.makePlayerBullet = makePlayerBullet;
    this.makeExplosion = makeExplosion;

    // systems
    this.enemySys = new EnemySystem(this);
    this.bulletSys = new BulletSystem(this);
    this.collisionSys = new CollisionSystem(this);
    this.explosionSys = new ExplosionSystem(this);
    this.bossSys = new BossSystem(this);

    this.frame = this.frame.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.blockContextMenu = this.blockContextMenu.bind(this);
    this.onExternalFire = this.onExternalFire.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);

    this.onResize();
    window.addEventListener("resize", this.onResize);
    window.addEventListener("mousemove", this.onMove);
    window.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("contextmenu", this.blockContextMenu);
    window.addEventListener("player-fire", this.onExternalFire);
    window.addEventListener("keydown", this.onKeyDown);

    this.raf = requestAnimationFrame(this.frame);
  }

  // === unchanged handlers (delegating) ===
  onKeyDown(e) {
    if (e.key.toLowerCase() === "r" && this.victory) {
      this.victory = false;
      this.victoryT = 0;
      this.gameOver = false;
      this.inBossPhase = false;
      this.boss = null;
      this.killCount = 0;
      this.clearWorld();
      this.spawnTimer = 0;
      this.nextSpawnIn = randBetween(GAME.ENEMY_MIN_SPAWN_MS, GAME.ENEMY_MAX_SPAWN_MS);
      this.lastT = performance.now();
      this.justReset = true;
      if (this.onKill) this.onKill({ reset: true, kills: 0, absolute: true });
      if (this.onReset) this.onReset();
    }
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
    if (e.button === 0) this.playerFire();
    else if (e.button === 2) this.playerFire(Math.random() < 0.5 ? "red" : "blue");
  }

  blockContextMenu(e) { e.preventDefault(); }

  onExternalFire(e) {
    const { x, y, color } = e.detail || {};
    if (typeof x === "number" && typeof y === "number") { this.cursorX = x; this.cursorY = y; }
    this.playerFire(color);
  }

  // === exact method bodies now call systems ===
  spawnEnemy() { this.enemySys.spawnEnemy(); }
  enemyFire(e) { this.bulletSys.enemyFire(e); }
  playerFire(colorOverride) { this.bulletSys.playerFire(colorOverride); }
  triggerExplosion(x, y) { this.explosionSys.triggerExplosion(x, y); }

  doSpawning(dt) {
    if (this.inBossPhase) return;
    this.spawnTimer += dt * 1000;
    if (this.spawnTimer >= this.nextSpawnIn) {
      this.spawnTimer = 0;
      this.nextSpawnIn = randBetween(GAME.ENEMY_MIN_SPAWN_MS, GAME.ENEMY_MAX_SPAWN_MS);
      this.spawnEnemy();
    }
  }

  updateEnemies(dt, now) { this.enemySys.updateEnemies(dt, now); }

  handleCollisions() { this.collisionSys.handleCollisions(); }

  clearWorld() {
    this.enemies.length = 0;
    this.enemyBullets.length = 0;
    this.myBullets.length = 0;
    this.explosions.length = 0;
    this.nextEnemyAt = Infinity;
  }

  enterBossPhase() { this.bossSys.enterBossPhase(); }
  spawnBoss() { this.bossSys.spawnBoss(); }
  updateBoss(dt) { this.bossSys.updateBoss(dt); }
  drawBoss(ctx) { this.bossSys.drawBoss(ctx); }

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
    ctx.fillText("VICTORY!", 0, 0);
    ctx.font = "20px system-ui";
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fillText("Press R to restart", 0, 52);
    ctx.restore();
  }

  cull() {
    this.enemySys.cullDead();
    this.bulletSys.cullOutOfBounds();
    this.explosionSys.cull();
  }

  frame(tNow) {
    if (this.gameOver) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      return;
    }

    const dt = Math.min(0.033, (tNow - this.lastT) / 1000);
    this.lastT = tNow;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.bg.W, this.bg.H);

    if (this.victory && this.bgImgReady) {
      ctx.drawImage(this.bgImg, 0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.bg.updateAndDraw(ctx);
    }

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

    if (this.victory) this.drawVictory(ctx, dt);

    for (const b of this.enemyBullets) this.renderer.drawEnemyBullet(ctx, b, dt);
    for (const pb of this.myBullets) this.renderer.drawPlayerBullet(ctx, pb, dt);

    this.handleCollisions();

    this.explosionSys.advance(dt);
    for (const ex of this.explosions) this.renderer.drawExplosion(ctx, ex, dt);

    this.cull();

    this.justReset = false;
    this.raf = requestAnimationFrame(this.frame);
  }
}
