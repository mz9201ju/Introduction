import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import spaceship from "/spaceship.png";

/**
 * 🚀 SpaceshipCursor
 * - Follows mouse or touch (mobile-friendly)
 * - Fires on right-click (desktop) or long-press (mobile)
 * - Prevents zoom/pinch gestures on mobile
 * - Turns red if pressed >3s continuously
 */
export default function SpaceshipCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const [lasers, setLasers] = useState([]);
  const lastClickRef = useRef(0);

  const FAST_CLICK_MS = 220;
  const LONG_PRESS_THRESHOLD = 3000; // 🔥 3s for red laser

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

    window.dispatchEvent(
      new CustomEvent("player-fire", { detail: { x, y, color } })
    );

    setLasers((prev) => [...prev, { id, x, y, color, length, width, driftX }]);
    setTimeout(
      () => setLasers((prev) => prev.filter((l) => l.id !== id)),
      850
    );
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

      updatePosition(x, y);
      window.dispatchEvent(new CustomEvent("player-move", { detail: { x, y } }));
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

    // 🖱️ Desktop: right-click firing
    const onCtx = (e) => {
      e.preventDefault();
      const now = performance.now();
      const delta = now - (lastClickRef.current || 0);
      lastClickRef.current = now;
      const color = delta > 0 && delta < FAST_CLICK_MS ? "red" : "blue";
      addLaser(color);
    };
    window.addEventListener("contextmenu", onCtx);

    // 📱 Mobile: single press fires; hold >3s turns red
    let holdTimer, fireInterval, colorState = "blue", pressedTime = 0;

    const isInteractiveElement = (el) => {
      if (!el) return false;
      const tag = el.tagName?.toLowerCase();
      return (
        ["button", "a", "input", "textarea", "select", "label"].includes(tag) ||
        el.closest?.("button, a, input, textarea, select, label, [role='button']")
      );
    };

    // 🎮 Only attach touch events inside game container
    const gameRoot =
      document.querySelector("#game-root") ||
      document.querySelector("canvas") ||
      document.body;

    const startFiring = (e) => {
      // 🚫 Skip if started on UI element
      if (isInteractiveElement(e.target)) return;

      // ✅ Only block default if inside game area
      if (gameRoot.contains(e.target)) e.preventDefault();
      else return; // let page scroll freely

      const startTime = Date.now();
      colorState = "blue";
      addLaser("blue");

      fireInterval = setInterval(() => addLaser(colorState), 300);

      holdTimer = setInterval(() => {
        pressedTime = Date.now() - startTime;
        if (pressedTime >= LONG_PRESS_THRESHOLD && colorState !== "red") {
          colorState = "red";
        }
      }, 200);
    };

    const stopFiring = () => {
      clearInterval(fireInterval);
      clearInterval(holdTimer);
      pressedTime = 0;
      colorState = "blue";
    };

    // 👇 Scoped to game area
    gameRoot.addEventListener("touchstart", startFiring, { passive: false });
    gameRoot.addEventListener("touchend", stopFiring, { passive: true });

    return () => {
      document.removeEventListener("contextmenu", blockCtx, { capture: true });
      window.removeEventListener("contextmenu", onCtx);
      gameRoot.removeEventListener("touchstart", startFiring);
      gameRoot.removeEventListener("touchend", stopFiring);
    };
  }, []);



  /* ==========================================================
     🧱 Prevent mobile screen resizing / zooming
     ========================================================== */
  useEffect(() => {
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

    const blockZoom = (e) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("touchstart", blockZoom, { passive: false });
    document.addEventListener("touchmove", blockZoom, { passive: false });
    document.addEventListener("gesturestart", (e) => e.preventDefault());
    document.addEventListener("gesturechange", (e) => e.preventDefault());
    document.addEventListener("gestureend", (e) => e.preventDefault());

    let lastTouchEnd = 0;
    const preventDoubleTapZoom = (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) e.preventDefault();
      lastTouchEnd = now;
    };
    document.addEventListener("touchend", preventDoubleTapZoom, { passive: false });

    return () => {
      document.removeEventListener("touchstart", blockZoom);
      document.removeEventListener("touchmove", blockZoom);
      document.removeEventListener("gesturestart", (e) => e.preventDefault());
      document.removeEventListener("gesturechange", (e) => e.preventDefault());
      document.removeEventListener("gestureend", (e) => e.preventDefault());
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
              animation:
                "laserUp 0.85s linear forwards, fadeOut 0.85s linear forwards",
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
