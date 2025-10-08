import { useState, useEffect } from "react";
import Starfield from "../components/Starfield";
import Scoreboard from "../components/Scoreboard";

export default function PlayGame() {
  const [showInstructions, setShowInstructions] = useState(true);
  const [kills, setKills] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setShowInstructions(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ minHeight: "100vh" }}>
      <Starfield onKill={() => setKills(k => k + 1)} />
      <Scoreboard kills={kills} />

      {/* How to Play (bottom-left, auto hides after 5s) */}
      {showInstructions && (
        <div
          style={{
            position: "fixed",
            bottom: 12,
            left: 12,
            zIndex: 10,
            padding: "10px 12px",
            background: "rgba(0,0,0,0.45)",
            color: "#e8f0ff",
            borderRadius: 10,
            backdropFilter: "blur(4px)",
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
            lineHeight: 1.35,
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>How to Play</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Move your mouse to aim the ship.</li>
            <li>Left click to fire (green laser). Right click to fire (red/blue)</li>
            <li>
              Enemies fire red/blue lasers at an interval (<code>fireEvery</code>).
            </li>
          </ul>
        </div>
      )}

      {/* Tip (bottom-right) */}
      {showInstructions && (<div
        style={{
          position: "fixed",
          right: 12,
          bottom: 12,
          zIndex: 10,
          padding: "8px 10px",
          background: "rgba(0,0,0,0.35)",
          color: "#cfe3ff",
          borderRadius: 8,
          fontSize: 12,
        }}
      >
        Tip: Keep moving — wobbling enemies miss more often.
      </div>)}
    </div>
  );
}
