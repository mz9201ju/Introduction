import { useEffect, useRef, useState } from "react";
import spaceship from "/spaceship.png";

/**
 * 🛸 SimpleSpaceshipCursor
 * - Follows mouse or touch smoothly
 * - No firing, no scroll blocking
 * - Works on all pages except PlayGame
 */
export default function SimpleSpaceshipCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const cursorRef = useRef(null);

  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;

    // Hide if user is typing or using coarse pointer (e.g. touchscreen)
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) {
      el.style.display = "none";
      return;
    }

    const handleMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // Hide cursor when on PlayGame route
  const isPlayGame = window.location.pathname.includes("/PlayGame");
  if (isPlayGame) return null;

  return (
    <div
      ref={cursorRef}
      className="spaceship-cursor"
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`,
        transition: "transform 0.05s linear",
      }}
    >
      <img
        src={spaceship}
        alt="Spaceship Cursor"
        width={48}
        height={48}
        style={{ pointerEvents: "none", userSelect: "none" }}
      />
    </div>
  );
}
