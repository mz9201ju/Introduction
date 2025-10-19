import { useState, useEffect, useCallback } from "react";
import Starfield from "@game/components/Starfield";
import Scoreboard from "@game/components/Scoreboard";
import SpaceshipCursor from "@game/pages/SpaceshipCursor";

export default function PlayGame() {
  const [showInstructions, setShowInstructions] = useState(true);
  const [kills, setKills] = useState(0);

  // ✅ Memoized so Engine doesn’t reinitialize
  const handleKill = useCallback((payload = {}) => {
    const { reset, kills: k, absolute } = payload;
    if (reset) {
      setKills(0);
      return;
    }
    if (absolute && typeof k === "number") {
      setKills(k);
      return;
    }
    setKills((prev) => prev + 1);
  }, []);

  /* ==========================================================
     ⏱️ Show instructions for 10 seconds, then fade out
     ========================================================== */
  useEffect(() => {
    const timer = setTimeout(() => setShowInstructions(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Global effects across all pages */}
      <SpaceshipCursor />
      
      <Starfield onKill={handleKill} />
      <Scoreboard kills={kills} />

      {showInstructions && (
        <div
          style={{
            position: "fixed",
            bottom: "30px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
            padding: "14px 18px",
            background: "rgba(0,0,0,0.55)",
            color: "#e8f0ff",
            borderRadius: 12,
            backdropFilter: "blur(5px)",
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
            lineHeight: 1.45,
            textAlign: "center",
            maxWidth: "90%",
            boxShadow: "0 0 12px rgba(0,0,0,0.4)",
            animation: "fadeOut 0.6s ease-in-out 9.4s forwards",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 16 }}>
            🚀 How to Play
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: 0,
              listStyle: "none",
              fontSize: 20,
            }}
          >
            <li>👉 Move your mouse or finger to aim the ship.</li>
            <li>💥 Right click or second finger = fire laser.</li>
            <li>⚡ Dodge enemy bullets and survive as long as you can.</li>
          </ul>
        </div>
      )}

      {/* ✨ Fade-out animation for smooth disappearance */}
      <style>{`
        @keyframes fadeOut {
          to {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
        }
      `}</style>
    </div>
  );
}
