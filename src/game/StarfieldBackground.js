import { STARFIELD } from "./config";

// Manages the 3D-ish star positions and projection to screen.
export default class StarfieldBackground {
  constructor() {
    this.W = 0; this.H = 0;
    this.CX = 0; this.CY = 0; this.FOV = 0;
    this.stars = [];
  }

  project(s) {
    s.sx = this.CX + (s.x / s.z) * this.FOV;
    s.sy = this.CY + (s.y / s.z) * this.FOV;
    s.w  = Math.max(0.7, (1 - s.z) * 2.5);
  }

  resetStar(s, init = false) {
    const r = Math.pow(Math.random(), 1.4);
    const a = Math.random() * Math.PI * 2;
    s.x = r * Math.cos(a);
    s.y = r * Math.sin(a);
    s.z = init ? Math.random() * (STARFIELD.Z_MAX - STARFIELD.Z_MIN) + STARFIELD.Z_MIN : STARFIELD.Z_MAX;
    this.project(s);
  }

  remakeStars() {
    const count = Math.min(1200, Math.floor((this.W * this.H) / 1500));
    this.stars = Array.from({ length: count }, () => {
      const s = {};
      this.resetStar(s, true);
      return s;
    });
  }

  resize(width, height) {
    this.W = width; this.H = height;
    this.CX = width / 2; this.CY = height / 2;
    this.FOV = Math.min(width, height) * 0.9;
    this.remakeStars();
  }

  updateAndDraw(ctx) {
    ctx.strokeStyle = "hsl(220 95% 85% / 0.9)";
    ctx.lineCap = "round";

    for (const s of this.stars) {
      const px = s.sx, py = s.sy;
      s.z -= STARFIELD.SPEED * s.z * s.z;
      this.project(s);

      const out =
        s.z <= STARFIELD.Z_MIN ||
        s.sx < -120 || s.sx > this.W + 120 ||
        s.sy < -120 || s.sy > this.H + 120;

      if (out) { this.resetStar(s); continue; }

      ctx.lineWidth = s.w;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(s.sx, s.sy);
      ctx.stroke();
    }
  }
}
