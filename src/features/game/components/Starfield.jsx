import { useEffect, useRef } from "react";
import Engine from "@game/gameScripts/Engine";

// Thin React wrapper that mounts the canvas + engine and cleans up.
export default function Starfield({ onKill, onVictory, onLoss, startPaused = false, onEngineReady, hidden = false }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const engine = new Engine(canvas, { onKill, onVictory, onLoss, startPaused });
    onEngineReady?.(engine);
    return () => {
      onEngineReady?.(null);
      engine.destroy();
    };
  }, [onKill, onVictory, onLoss, onEngineReady, startPaused]);

  return (
    <canvas
      ref={ref}
      role="presentation"
      style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none", opacity: hidden ? 0 : 1 }}
    />
  );
}
