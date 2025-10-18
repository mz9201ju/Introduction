import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import spaceship from "/spaceship.png";

/**
 * 🚀 SpaceshipCursor
 * - Follows mouse or touch input (mobile-friendly)
 * - Fires lasers on right-click, long-press, or second-finger tap
 * - Clean + reusable event setup
 */
export default function SpaceshipCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const [lasers, setLasers] = useState([]);
  const lastClickRef = useRef(0);

  const FAST_CLICK_MS = 220;
  const TOUCH_FIRE_DELAY = 400; // ms for long-press to fire

  /* ==========================================================
     🎯 Helper functions (reusable & isolated)
     ========================================================== */
  const updatePosition = (x, y) => {
    const newPos = { x, y };
    setPos(newPos);
    posRef.current = newPos;
  };

  const addLaser = (color = "blue") => {
    const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
    const length = 18 + Math.floor(Math.random() * 14);
    const width = 3 + Math.floor(Math.random() * 2);
    const driftX = (Math.random() - 0.5) * 6;
    const { x, y } = posRef.current;

    // 🔊 Dispatch event for external listeners (e.g., explosions or sound)
    window.dispatchEvent(new CustomEvent("player-fire", { detail: { x, y, color } }));

    // Add and auto-remove the laser beam
    setLasers((prev) => [...prev, { id, x, y, color, length, width, driftX }]);
    setTimeout(() => setLasers((prev) => prev.filter((l) => l.id !== id)), 850);
  };

  /* ==========================================================
     🧭 Track mouse/touch movement
     ========================================================== */
  useEffect(() => {
    const onMove = (e) => {
      let x, y;
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        x = touch.clientX;
        y = touch.clientY;
      } else {
        x = e.clientX;
        y = e.clientY;
      }

      const p = { x, y };
      setPos(p);
      posRef.current = p;

      // 🚨 Broadcast movement globally for tracking
      window.dispatchEvent(new CustomEvent("player-move", { detail: p }));
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
    };
  }, []);

  /* ==========================================================
     🖱️ Fire laser on right-click / long-press / second-finger
     ========================================================== */
  useEffect(() => {
    // 🧱 Block default right-click menu
    const blockCtx = (e) => e.preventDefault();
    document.addEventListener("contextmenu", blockCtx, { capture: true });

    const onCtx = (e) => {
      e.preventDefault();

      // 💥 Detect double-tap for red laser
      const now = performance.now();
      const delta = now - (lastClickRef.current || 0);
      lastClickRef.current = now;

      const color = delta > 0 && delta < FAST_CLICK_MS ? "red" : "blue";
      addLaser(color);
    };

    window.addEventListener("contextmenu", onCtx);

    // Mobile: long press OR second finger triggers fire
    let touchTimer;
    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        // 🚀 Second finger detected → immediate fire
        addLaser("blue");
        return;
      }

      // 🕒 Long press fallback
      touchTimer = setTimeout(() => onCtx(e), TOUCH_FIRE_DELAY);
    };

    const onTouchEnd = () => clearTimeout(touchTimer);

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("contextmenu", onCtx);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("contextmenu", blockCtx, { capture: true });
    };
  }, []);

  /* ==========================================================
     🎨 Laser color definitions
     ========================================================== */
  const colorMap = {
    red: {
      fill: "#ff2b2b",
      glow: "0 0 8px rgba(255,43,43,0.9), 0 0 16px rgba(255,43,43,0.6)",
    },
    blue: {
      fill: "#1aa3ff",
      glow: "0 0 8px rgba(26,163,255,0.9), 0 0 16px rgba(26,163,255,0.6)",
    },
  };

  /* ==========================================================
     🧩 Render spaceship & lasers
     ========================================================== */
  return createPortal(
    <>
      {/* 🛸 Spaceship follows pointer */}
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
          userSelect: "none",
          WebkitTouchCallout: "none",
        }}
      />

      {/* 🔫 Render all laser beams */}
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

      {/* ✨ Animations */}
      <style>{`
        @keyframes laserUp {
          from { transform: translate(-50%, -50%) translate(0, 0); }
          to   { transform: translate(-50%, -50%) translate(var(--driftX, 0), -220px); }
        }
        @keyframes fadeOut { 
          from { opacity: 1; } 
          to { opacity: 0; } 
        }
      `}</style>
    </>,
    document.body
  );
}
