import { useEffect, useRef } from "react";

export default function Starfield() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let raf = 0;

    let W = 0, H = 0, CX = 0, CY = 0, FOV = 0;
    let stars = [];
    const SPEED = 0.0315;     // slow, steady warp speed
    const Z_MIN = 0.08;        // nearest depth
    const Z_MAX = 1.25;        // farthest depth

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

    function frame() {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "hsl(220 95% 85% / 0.9)";
      ctx.lineCap = "round";

      for (const s of stars) {
        const px = s.sx, py = s.sy;

        // Move toward camera — constant screen speed due to z² correction
        s.z -= SPEED * s.z * s.z;
        project(s);

        if (
          s.z <= Z_MIN ||
          s.sx < -120 || s.sx > W + 120 ||
          s.sy < -120 || s.sy > H + 120
        ) {
          resetStar(s);
          continue;
        }

        ctx.lineWidth = s.w;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(s.sx, s.sy);
        ctx.stroke();
      }

      raf = requestAnimationFrame(frame);
    }

    resize();
    frame();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none"
      }}
    />
  );
}
