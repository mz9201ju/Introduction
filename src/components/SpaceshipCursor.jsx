import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import spaceship from "../assets/spaceship.png";

export default function SpaceshipCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const [lasers, setLasers] = useState([]);
  const lastClickRef = useRef(0);

  const FAST_CLICK_MS = 220;

  // track mouse/touch position
  useEffect(() => {
    const onMove = (e) => {
      const p = { x: e.clientX, y: e.clientY };
      setPos(p); posRef.current = p;
    };
    const onTouchMove = (e) => {
      const t = e.touches?.[0]; if (!t) return;
      const p = { x: t.clientX, y: t.clientY };
      setPos(p); posRef.current = p;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  // right-click + tap to fire (and prevent browser menu)
  useEffect(() => {
    const blockCtx = (e) => e.preventDefault();
    document.addEventListener("contextmenu", blockCtx, { capture: true });

    const onCtx = (e) => {
      e.preventDefault();
      const now = performance.now();
      const delta = now - (lastClickRef.current || 0);
      lastClickRef.current = now;

      const color = delta > 0 && delta < FAST_CLICK_MS ? "red" : "blue";
      const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      const length = 18 + Math.floor(Math.random() * 14);
      const width = 3 + Math.floor(Math.random() * 2);
      const driftX = (Math.random() - 0.5) * 6;

      const { x, y } = posRef.current;
      window.dispatchEvent(new CustomEvent("player-fire", { detail: { x, y, color } }));

      setLasers((p) => [...p, { id, x, y, color, length, width, driftX }]);
      setTimeout(() => setLasers((p) => p.filter((l) => l.id !== id)), 850);
    };

    const onTap = (e) => {
      const t = e.touches?.[0];
      const x = t ? t.clientX : posRef.current.x;
      const y = t ? t.clientY : posRef.current.y;
      e.preventDefault();
      const color = "blue";
      const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      const length = 24, width = 3, driftX = 0;
      window.dispatchEvent(new CustomEvent("player-fire", { detail: { x, y, color } }));
      setLasers((p) => [...p, { id, x, y, color, length, width, driftX }]);
      setTimeout(() => setLasers((p) => p.filter((l) => l.id !== id)), 600);
    };

    window.addEventListener("contextmenu", onCtx);
    window.addEventListener("touchstart", onTap, { passive: false });

    return () => {
      window.removeEventListener("contextmenu", onCtx);
      window.removeEventListener("touchstart", onTap);
      document.removeEventListener("contextmenu", blockCtx, { capture: true });
    };
  }, []);

  const colorMap = {
    red:  { fill: "#ff2b2b", glow: "0 0 8px rgba(255,43,43,0.9), 0 0 16px rgba(255,43,43,0.6)" },
    blue: { fill: "#1aa3ff", glow: "0 0 8px rgba(26,163,255,0.9), 0 0 16px rgba(26,163,255,0.6)" },
  };

  return createPortal(
    <>
      <img
        src={spaceship}
        alt="Spaceship Cursor"
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          width: 40,
          height: 40,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 2147483647,
          willChange: "transform",
          WebkitUserSelect: "none",
          userSelect: "none",
          WebkitTouchCallout: "none",
        }}
      />

      {lasers.map((l) => {
        const c = colorMap[l.color];
        return (
          <div
            key={l.id}
            style={{
              position: "fixed",
              left: l.x,
              top: l.y,
              width: `${l.width}px`,
              height: `${l.length}px`,
              backgroundColor: c.fill,
              transform: "translate(-50%, -50%)",
              animation: `laserUp 0.85s linear forwards, fadeOut 0.85s linear forwards`,
              zIndex: 2147483646,
              boxShadow: c.glow,
              borderRadius: "2px",
              "--driftX": `${l.driftX}px`,
              pointerEvents: "none",
            }}
          />
        );
      })}

      <style>{`
        @keyframes laserUp {
          from { transform: translate(-50%, -50%) translate(0, 0); }
          to   { transform: translate(-50%, -50%) translate(var(--driftX, 0), -220px); }
        }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
      `}</style>
    </>,
    document.body
  );
}
