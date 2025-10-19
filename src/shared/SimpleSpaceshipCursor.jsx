import { useEffect, useRef, useState } from "react";
import spaceship from "/spaceship.png";

/**
 * 🛸 SimpleSpaceshipCursor
 * - Smoothly follows mouse position
 * - Hidden on mobile/touch devices
 * - Disabled during PlayGame route
 * - Always stays above other UI (e.g., chatbot)
 */
export default function SimpleSpaceshipCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const cursorRef = useRef(null);

  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;

    // 💡 Hide on touch devices (coarse pointer = touchscreen)
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) {
      el.style.display = "none";
      return;
    }

    // 🎯 Mouse movement tracking
    const handleMove = (e) => {
      // Use requestAnimationFrame for smoother motion + lower layout thrash
      requestAnimationFrame(() => {
        setPos({ x: e.clientX, y: e.clientY });
      });
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // 🎮 Disable spaceship cursor on PlayGame route
  const isPlayGame =
    window.location.pathname.toLowerCase().includes("/playgame") ||
    window.location.pathname.toLowerCase().includes("/darthvader");
  if (isPlayGame) return null;

  return (
    <div
      ref={cursorRef}
      className="spaceship-cursor"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`,
        transition: "transform 0.05s linear",
        pointerEvents: "none", // ensures it never blocks clicks
        userSelect: "none",
        zIndex: 10000, // 🧠 sits ABOVE chatbot (chatbot is 9999)
      }}
    >
      <img
        src={spaceship}
        alt="Spaceship Cursor"
        width={48}
        height={48}
        style={{
          display: "block",
          pointerEvents: "none",
          userSelect: "none",
          filter: "drop-shadow(0 0 6px rgba(150,200,255,0.6))", // ✨ optional glow
        }}
      />
    </div>
  );
}
