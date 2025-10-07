import { useEffect, useRef, useState } from "react";
import spaceship from "../assets/spaceship.png";

export default function SpaceshipCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [lasers, setLasers] = useState([]);
  const lastClickRef = useRef(0);

  const FAST_CLICK_MS = 220; // threshold for "fast" clicks

  // Track mouse movement
  useEffect(() => {
    const handleMove = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // Fire on RIGHT-CLICK
  useEffect(() => {
    const handleFire = (e) => {
      e.preventDefault(); // stop context menu
      const now = performance.now();
      const delta = now - (lastClickRef.current || 0);
      lastClickRef.current = now;

      // Color logic
      const isFast = delta > 0 && delta < FAST_CLICK_MS;
      const color = isFast ? "red" : "blue";

      const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      const length = 18 + Math.floor(Math.random() * 14); // variable beam length
      const width = 3 + Math.floor(Math.random() * 2);    // small variation
      const driftX = (Math.random() - 0.5) * 6;           // slight sideways drift

      setLasers((prev) => [
        ...prev,
        { id, x: pos.x, y: pos.y, color, length, width, driftX },
      ]);

      setTimeout(() => {
        setLasers((prev) => prev.filter((l) => l.id !== id));
      }, 850);
    };

    window.addEventListener("contextmenu", handleFire);
    return () => window.removeEventListener("contextmenu", handleFire);
  }, [pos]);

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

  return (
    <>
      {/* Spaceship cursor */}
      <img
        src={spaceship}
        alt="Spaceship Cursor"
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          width: "40px",
          height: "40px",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          transition: "transform 0.05s ease-out",
          zIndex: 1000,
        }}
      />

      {/* Lasers */}
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
              zIndex: 999,
              boxShadow: c.glow,
              borderRadius: "2px",
              "--driftX": `${l.driftX}px`,
            }}
          />
        );
      })}

      {/* Animations */}
      <style>{`
        @keyframes laserUp {
          from { transform: translate(-50%, -50%) translate(0, 0); }
          to   { transform: translate(-50%, -50%) translate(var(--driftX, 0), -220px); }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
      `}</style>
    </>
  );
}
