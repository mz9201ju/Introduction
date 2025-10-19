import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import spaceship from "/spaceship.png";

/**
 * 🚀 SpaceshipCursor
 * - Follows mouse/touch (mobile-friendly)
 * - Fires on movement
 * - Turns red after 4s of continuous firing
 * - Prevents zoom/pinch gestures on mobile
 */
export default function SpaceshipCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const firingStartRef = useRef(0);
  const lastFireRef = useRef(0);
  const [color, setColor] = useState("blue");

  const FIRE_INTERVAL = 200;       // ms between lasers
  const RED_AFTER = 4000;          // 4s threshold

  /* ==========================================================
     ⚙️ Utility: update position + broadcast move
     ========================================================== */
  const updatePosition = (x, y) => {
    const newPos = { x, y };
    setPos(newPos);
    posRef.current = newPos;

    // Broadcast movement to Engine
    window.dispatchEvent(new CustomEvent("player-move", { detail: { x, y } }));
  };

  /* ==========================================================
     🔫 Fire logic tied to movement
     ========================================================== */
  const handleFire = (x, y) => {
    const now = performance.now();

    // Initialize or reset continuous-firing timer
    if (!firingStartRef.current) firingStartRef.current = now;
    const elapsed = now - firingStartRef.current;

    // Switch to red after threshold
    if (elapsed > RED_AFTER && color !== "red") setColor("red");

    // Throttle fire rate
    if (now - lastFireRef.current < FIRE_INTERVAL) return;
    lastFireRef.current = now;

    // Dispatch laser event to Engine
    window.dispatchEvent(
      new CustomEvent("player-fire", { detail: { x, y, color } })
    );
  };

  /* ==========================================================
     🧭 Mouse + touch movement tracking
     ========================================================== */
  useEffect(() => {
    const handleMove = (e) => {
      let x, y;
      if (e.touches && e.touches.length > 0) {
        const t = e.touches[0];
        x = t.clientX;
        y = t.clientY;
      } else {
        x = e.clientX;
        y = e.clientY;
      }

      updatePosition(x, y);
      handleFire(x, y);
    };

    const handleEnd = () => {
      // Stop continuous-fire timer after movement ends
      firingStartRef.current = 0;
      setColor("blue");
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("touchmove", handleMove, { passive: true });
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchend", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [color]);

  /* ==========================================================
     📱 Prevent zoom/pinch/double-tap
     ========================================================== */
  useEffect(() => {
    const meta = document.querySelector("meta[name=viewport]");
    const content =
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
    if (meta) meta.setAttribute("content", content);
    else {
      const newMeta = document.createElement("meta");
      newMeta.name = "viewport";
      newMeta.content = content;
      document.head.appendChild(newMeta);
    }

    const blockPinch = (e) => {
      if (e.touches && e.touches.length > 1) e.preventDefault();
    };
    let lastTouchEnd = 0;
    const preventDoubleTapZoom = (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) e.preventDefault();
      lastTouchEnd = now;
    };

    document.addEventListener("touchstart", blockPinch, { passive: false });
    document.addEventListener("touchend", preventDoubleTapZoom, { passive: false });
    return () => {
      document.removeEventListener("touchstart", blockPinch);
      document.removeEventListener("touchend", preventDoubleTapZoom);
    };
  }, []);

  /* ==========================================================
     🔒 Resize handling (recenters cursor)
     ========================================================== */
  useEffect(() => {
    const handleResize = () => {
      const x = window.innerWidth / 2;
      const y = window.innerHeight / 2;
      updatePosition(x, y);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ==========================================================
     🧩 Render spaceship cursor
     ========================================================== */
  return createPortal(
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
        transition: "transform 0.05s linear",
        filter:
          color === "red"
            ? "drop-shadow(0 0 10px rgba(255,0,0,0.9)) saturate(150%)"
            : "drop-shadow(0 0 6px rgba(0,150,255,0.8))",
      }}
    />,
    document.body
  );
}
