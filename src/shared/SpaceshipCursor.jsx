import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import spaceship from "/spaceship.png";

/**
 * 🚀 SpaceshipCursor
 * - Follows mouse or touch (mobile-friendly)
 * - Fires on right-click, long-press, or second-finger tap
 * - Prevents screen zooming/resizing on mobile
 */
export default function SpaceshipCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const [lasers, setLasers] = useState([]);
  const lastClickRef = useRef(0);

  const FAST_CLICK_MS = 220;
  const TOUCH_FIRE_DELAY = 400; // ms

  /* ==========================================================
     ⚙️ Helper utilities
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

    window.dispatchEvent(new CustomEvent("player-fire", { detail: { x, y, color } }));

    setLasers((prev) => [...prev, { id, x, y, color, length, width, driftX }]);
    setTimeout(() => setLasers((prev) => prev.filter((l) => l.id !== id)), 850);
  };

  /* ==========================================================
     🧭 Movement tracking (mouse + touch)
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
     🔫 Fire logic (desktop + mobile)
     ========================================================== */
  useEffect(() => {
    const blockCtx = (e) => e.preventDefault();
    document.addEventListener("contextmenu", blockCtx, { capture: true });

    const onCtx = (e) => {
      e.preventDefault();

      const now = performance.now();
      const delta = now - (lastClickRef.current || 0);
      lastClickRef.current = now;

      const color = delta > 0 && delta < FAST_CLICK_MS ? "red" : "blue";
      addLaser(color);
    };

    window.addEventListener("contextmenu", onCtx);

    let touchTimer;
    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        // 🚀 Fire when second finger detected
        addLaser("blue");
        return;
      }
      touchTimer = setTimeout(() => onCtx(e), TOUCH_FIRE_DELAY);
    };

    const onTouchEnd = () => clearTimeout(touchTimer);

    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("contextmenu", onCtx);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("contextmenu", blockCtx, { capture: true });
    };
  }, []);

  /* ==========================================================
     🧱 Prevent mobile screen resizing / zooming
     ========================================================== */
  useEffect(() => {
    // ✅ Lock viewport scale to prevent zoom
    const meta = document.querySelector("meta[name=viewport]");
    if (meta) {
      meta.setAttribute(
        "content",
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
      );
    } else {
      const newMeta = document.createElement("meta");
      newMeta.name = "viewport";
      newMeta.content =
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
      document.head.appendChild(newMeta);
    }

    // 🧤 Prevent pinch zoom
    const blockZoom = (e) => {
      if (e.touches && e.touches.length > 1) e.preventDefault();
    };

    // 🧤 Prevent double-tap zoom
    let lastTouchEnd = 0;
    const preventDoubleTapZoom = (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) e.preventDefault();
      lastTouchEnd = now;
    };

    document.addEventListener("touchmove", blockZoom, { passive: false });
    document.addEventListener("touchend", preventDoubleTapZoom, { passive: false });

    return () => {
      document.removeEventListener("touchmove", blockZoom);
      document.removeEventListener("touchend", preventDoubleTapZoom);
    };
  }, []);

  /* ==========================================================
     🎨 Laser colors
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
      {/* 🛸 Spaceship follows finger/mouse */}
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

      {/* 🔫 Render lasers */}
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
        @keyframes fadeOut { 
          from { opacity: 1; } 
          to { opacity: 0; } 
        }
      `}</style>
    </>,
    document.body
  );
}
