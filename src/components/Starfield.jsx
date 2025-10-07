import enemyShip from "../assets/enemySpaceShip.png";
import { useEffect, useRef } from "react";

export default function Starfield() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");

    const enemyImg = new Image();
    let enemyImgReady = false;
    enemyImg.onload = () => (enemyImgReady = true);
    enemyImg.src = enemyShip;

    let raf = 0;

    let W = 0, H = 0, CX = 0, CY = 0, FOV = 0;
    let stars = [];

    const SPEED = 0.0315;
    const Z_MIN = 0.08;
    const Z_MAX = 1.25;

    const ENEMY_MIN_SPAWN_MS = 2500;
    const ENEMY_MAX_SPAWN_MS = 4800;
    const ENEMY_SPEED = 70;
    const BULLET_SPEED = 520;
    const BULLET_LIFE = 1.6;
    const ENEMY_FIRE_MIN = 900;
    const ENEMY_FIRE_MAX = 1400;

    const MY_BULLET_SPEED = 800;
    const MY_BULLET_LIFE = 0.9;
    const HIT_RADIUS = 24;         // bumped from 16 for consistent kills
    const EXPLOSION_TIME = 0.4;

    const enemies = [];
    const bullets = [];
    const myBullets = [];
    const explosions = [];

    let spawnTimer = 0;
    let nextSpawnIn = randBetween(ENEMY_MIN_SPAWN_MS, ENEMY_MAX_SPAWN_MS);
    let cursorX = CX;
    let cursorY = CY;
    let lastT = performance.now();

    function randBetween(a, b) { return a + Math.random() * (b - a); }

    function project(s) {
      s.sx = CX + (s.x / s.z) * FOV;
      s.sy = CY + (s.y / s.z) * FOV;
      s.w = Math.max(0.7, (1 - s.z) * 2.5);
    }

    function resetStar(s, init = false) {
      const r = Math.pow(Math.random(), 1.4);
      const a = Math.random() * Math.PI * 2;
      s.x = r * Math.cos(a);
      s.y = r * Math.sin(a);
      s.z = init ? Math.random() * (Z_MAX - Z_MIN) + Z_MIN : Z_MAX;
      project(s);
    }

    function makeStars() {
      const count = Math.min(1200, Math.floor((W * H) / 1500));
      stars = Array.from({ length: count }, () => {
        const s = {};
        resetStar(s, true);
        return s;
      });
    }

    function resize() {
      canvas.width = W = window.innerWidth;
      canvas.height = H = window.innerHeight;
      CX = W / 2;
      CY = H / 2;
      FOV = Math.min(W, H) * 0.9;
      makeStars();
    }

    function spawnEnemy() {
      const edge = Math.floor(Math.random() * 4);
      let x, y;
      const margin = 40;
      if (edge === 0) { x = Math.random() * W; y = -margin; }
      else if (edge === 1) { x = W + margin; y = Math.random() * H; }
      else if (edge === 2) { x = Math.random() * W; y = H + margin; }
      else { x = -margin; y = Math.random() * H; }

      const toCenterX = CX - x;
      const toCenterY = CY - y;
      const len = Math.hypot(toCenterX, toCenterY) || 1;
      const vx = (toCenterX / len) * ENEMY_SPEED;
      const vy = (toCenterY / len) * ENEMY_SPEED;

      const now = performance.now();
      enemies.push({
        x, y, vx, vy,
        angle: 0,
        spd: ENEMY_SPEED,
        fireEvery: randBetween(ENEMY_FIRE_MIN, ENEMY_FIRE_MAX),
        nextFire: now + randBetween(200, 900),
        alive: true,
        wobblePhase: Math.random() * Math.PI * 2
      });
    }

    function enemyFire(e) {
      const dx = cursorX - e.x;
      const dy = cursorY - e.y;
      const d = Math.hypot(dx, dy) || 1;
      const vx = (dx / d) * BULLET_SPEED;
      const vy = (dy / d) * BULLET_SPEED;

      bullets.push({ x: e.x, y: e.y, vx, vy, life: BULLET_LIFE, color: e.fireEvery < 550 ? "red" : "blue" });
    }

    function playerFire() {
      myBullets.push({ x: cursorX, y: cursorY, vx: 0, vy: -MY_BULLET_SPEED, life: MY_BULLET_LIFE });
    }

    function triggerExplosion(x, y) { explosions.push({ x, y, t: 0 }); }

    function drawShip(x, y, angle) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      const SIZE = 28;
      if (enemyImgReady) {
        ctx.imageSmoothingEnabled = true;
        ctx.shadowColor = "rgba(255,255,255,0.6)";
        ctx.shadowBlur = 8;
        ctx.drawImage(enemyImg, -SIZE / 2, -SIZE / 2, SIZE, SIZE);
      }
      ctx.restore();
    }

    function frame(tNow) {
      const dt = Math.min(0.033, (tNow - lastT) / 1000);
      lastT = tNow;

      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "hsl(220 95% 85% / 0.9)";
      ctx.lineCap = "round";

      for (const s of stars) {
        const px = s.sx, py = s.sy;
        s.z -= SPEED * s.z * s.z;
        project(s);
        if (s.z <= Z_MIN || s.sx < -120 || s.sx > W + 120 || s.sy < -120 || s.sy > H + 120) { resetStar(s); continue; }
        ctx.lineWidth = s.w;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(s.sx, s.sy);
        ctx.stroke();
      }

      spawnTimer += dt * 1000;
      if (spawnTimer >= nextSpawnIn) { spawnTimer = 0; nextSpawnIn = randBetween(ENEMY_MIN_SPAWN_MS, ENEMY_MAX_SPAWN_MS); spawnEnemy(); }

      const now = performance.now();

      for (const e of enemies) {
        if (!e.alive) continue;
        e.wobblePhase += dt * 2.2;
        const wobble = Math.sin(e.wobblePhase) * 18;
        const ux = e.vx / (e.spd || 1), uy = e.vy / (e.spd || 1);
        const nx = -uy, ny = ux;
        e.x += e.vx * dt + nx * wobble * dt;
        e.y += e.vy * dt + ny * wobble * dt;
        const dx = cursorX - e.x, dy = cursorY - e.y;
        e.angle = Math.atan2(dy, dx);
        if (now >= e.nextFire) { enemyFire(e); e.nextFire = now + e.fireEvery; if (Math.random() < 0.25) e.nextFire = now + e.fireEvery * 0.45; }
        if (e.x < -200 || e.x > W + 200 || e.y < -200 || e.y > H + 200) e.alive = false;
        drawShip(e.x, e.y, e.angle);
      }

      for (const b of bullets) {
        b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
        ctx.save();
        ctx.strokeStyle = b.color === "red" ? "rgba(255,60,60,0.95)" : "rgba(40,160,255,0.95)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const trail = 14, len = Math.hypot(b.vx, b.vy) || 1;
        const tx = (b.vx / len) * trail, ty = (b.vy / len) * trail;
        ctx.moveTo(b.x - tx, b.y - ty); ctx.lineTo(b.x, b.y); ctx.stroke();
        ctx.restore();
        if (b.life <= 0 || b.x < -50 || b.x > W + 50 || b.y < -50 || b.y > H + 50) b.life = 0;
      }

      for (const pb of myBullets) {
        pb.x += pb.vx * dt; pb.y += pb.vy * dt; pb.life -= dt;
        ctx.save();
        ctx.strokeStyle = "rgba(120, 255, 140, 0.95)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(pb.x, pb.y + 18); ctx.lineTo(pb.x, pb.y); ctx.stroke();
        ctx.restore();

        for (const e of enemies) {
          if (!e.alive) continue;
          const dx = e.x - pb.x, dy = e.y - pb.y;
          if (dx * dx + dy * dy <= HIT_RADIUS * HIT_RADIUS) {
            e.alive = false; pb.life = 0; triggerExplosion(e.x, e.y);
          }
        }
        if (pb.life <= 0 || pb.x < -50 || pb.x > W + 50 || pb.y < -50 || pb.y > H + 50) pb.life = 0;
      }

      for (const ex of explosions) {
        ex.t += dt;
        const p = Math.min(1, ex.t / EXPLOSION_TIME);
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

      for (let i = enemies.length - 1; i >= 0; i--) if (!enemies[i].alive) enemies.splice(i, 1);
      for (let i = bullets.length - 1; i >= 0; i--) if (bullets[i].life <= 0) bullets.splice(i, 1);
      for (let i = myBullets.length - 1; i >= 0; i--) if (myBullets[i].life <= 0) myBullets.splice(i, 1);
      for (let i = explosions.length - 1; i >= 0; i--) if (explosions[i].t >= EXPLOSION_TIME) explosions.splice(i, 1);

      raf = requestAnimationFrame(frame);
    }

    // Right-click: event from SpaceshipCursor
    const onExternalFire = (e) => {
      const { x, y } = e.detail || {};
      if (typeof x === "number" && typeof y === "number") {
        cursorX = x; cursorY = y;        // align canvas with cursor sprite coords
      }
      playerFire();
    };

    // Left-click: fire from current cursorX/cursorY
    const onLeftDown = (e) => { if (e.button === 0) playerFire(); }; // use mousedown for reliability
    const onMove = (e) => { cursorX = e.clientX; cursorY = e.clientY; };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onLeftDown);           // LEFT CLICK
    window.addEventListener("player-fire", onExternalFire);     // RIGHT CLICK

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onLeftDown);
      window.removeEventListener("player-fire", onExternalFire);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      role="presentation"
      style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" }}
    />
  );
}
