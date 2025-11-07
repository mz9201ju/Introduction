import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import spaceship from "/spaceship.png";
import { Joystick } from "react-joystick-component";

/**
 * 🚀 SpaceshipCursor
 * - Desktop: follows mouse exactly like before
 * - Mobile: shows a joystick on bottom-right to move the ship
 * - Auto-fire on movement
 */
export default function SpaceshipCursor() {
  const [pos, setPos] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const posRef = useRef(pos);
  const firingStartRef = useRef(0);
  const lastFireRef = useRef(0);
  const [color, setColor] = useState("blue");
  const [isMobile, setIsMobile] = useState(false);

  const FIRE_INTERVAL = 200;
  const RED_AFTER = 4000;
  const SPEED = 8;

  /* ==========================================================
     📱 Detect mobile once
     ========================================================== */
  useEffect(() => {
    const mobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsMobile(mobile);
  }, []);

  /* ==========================================================
     ⚙️ Common position + event broadcast
     ========================================================== */
  const updatePosition = (x, y) => {
    const newPos = { x, y };
    posRef.current = newPos;
    setPos(newPos);
    window.dispatchEvent(new CustomEvent("player-move", { detail: newPos }));
  };

  const handleFire = (x, y) => {
    const now = performance.now();
    if (!firingStartRef.current) firingStartRef.current = now;
    const elapsed = now - firingStartRef.current;

    if (elapsed > RED_AFTER && color !== "red") setColor("red");
    if (now - lastFireRef.current < FIRE_INTERVAL) return;
    lastFireRef.current = now;

    window.dispatchEvent(
      new CustomEvent("player-fire", { detail: { x, y, color } })
    );
  };

  /* ==========================================================
     🖱️ Desktop: mouse movement (unchanged)
     ========================================================== */
  useEffect(() => {
    if (isMobile) return; // skip on mobile

    const handleMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      updatePosition(x, y);
      handleFire(x, y);
    };

    const handleEnd = () => {
      firingStartRef.current = 0;
      setColor("blue");
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mouseup", handleEnd);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
    };
  }, [isMobile, color]);

  /* ==========================================================
     🕹️ Mobile: joystick movement
     ========================================================== */
  const handleMove = (e) => {
    const dx = e.x * SPEED;
    const dy = -e.y * SPEED; // invert Y to match natural joystick feel
    const { x, y } = posRef.current;
    const newX = Math.max(20, Math.min(window.innerWidth - 20, x + dx));
    const newY = Math.max(20, Math.min(window.innerHeight - 20, y + dy));

    updatePosition(newX, newY);
    handleFire(newX, newY);
  };

  const handleStop = () => {
    firingStartRef.current = 0;
    setColor("blue");
  };

  /* ==========================================================
     🔒 Resize: recenter spaceship
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
     🧩 Render
     ========================================================== */
  return createPortal(
    <>
      {/* 🚀 Spaceship cursor */}
      <img
        src={spaceship}
        alt="Spaceship Cursor"
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          width: 42,
          height: 42,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 9999,
          userSelect: "none",
          willChange: "transform",
          filter:
            color === "red"
              ? "drop-shadow(0 0 10px rgba(255,0,0,0.9)) saturate(150%)"
              : "drop-shadow(0 0 6px rgba(0,150,255,0.8))",
          transition: "filter 0.3s ease",
        }}
      />

      {/* 🕹️ Mobile joystick */}
      {isMobile && (
        <div
          style={{
            position: "fixed",
            bottom: "40px",
            right: "40px",
            zIndex: 10000,
          }}
        >
          <Joystick
            size={90}
            baseColor="rgba(255,255,255,0.2)"
            stickColor="#00bfff"
            move={handleMove}
            stop={handleStop}
          />
        </div>
      )}
    </>,
    document.body
  );
}
