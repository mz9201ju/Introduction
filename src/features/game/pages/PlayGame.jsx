import { useState, useEffect, useCallback } from "react";
import Starfield from "@game/components/Starfield";
import Scoreboard from "@game/components/Scoreboard";
import SpaceshipCursor from "@game/pages/SpaceshipCursor";
import { usePageSeo } from "@app/hooks/usePageSeo";

export default function PlayGame() {
  usePageSeo({
    title: "Play Game | Omer Zahid",
    description:
      "Play Omer Zahid’s browser-based space shooter with starfield combat, progressive enemy waves, boss battles, and live scoring tuned for smooth canvas action.",
  });

  const [showInstructions, setShowInstructions] = useState(true);
  const [stats, setStats] = useState({
    kills: 0,
    playerHP: 100,
    victory: false,
    loss: false,
    level: 1,
    killsThisLevel: 0,
    bossHP: null,
    bossMaxHp: null,
    forceField: false,
    firepowerLevel: 1,
  });

  const handleKill = useCallback((payload = {}) => {
    const { reset, kills, playerHP, victory, loss, level, killsThisLevel, bossHP, bossMaxHp } = payload;

    if (reset) {
      setStats({ kills: 0, playerHP: 100, victory: false, loss: false, level: 1, killsThisLevel: 0, bossHP: null, bossMaxHp: null, forceField: false, firepowerLevel: 1 });
      return;
    }

    setStats(prev => ({
      kills: typeof kills === "number" ? kills : prev.kills,
      playerHP: typeof playerHP === "number" ? playerHP : prev.playerHP,
      victory: victory ?? prev.victory,
      loss: loss ?? prev.loss,
      level: typeof level === "number" ? level : prev.level,
      killsThisLevel: typeof killsThisLevel === "number" ? killsThisLevel : prev.killsThisLevel,
      bossHP: typeof bossHP === "number" ? bossHP : prev.bossHP,
      bossMaxHp: typeof bossMaxHp === "number" ? bossMaxHp : prev.bossMaxHp,
      forceField: payload.forceField ?? prev.forceField,
      firepowerLevel: typeof payload.firepowerLevel === "number" ? payload.firepowerLevel : prev.firepowerLevel,
    }));
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

      <Scoreboard stats={stats} />
      <Starfield onKill={handleKill} />

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
            <li>👉 Move your mouse or joystick to aim the ship.</li>
            <li>💥 Right click or left click = fire laser.</li>
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
