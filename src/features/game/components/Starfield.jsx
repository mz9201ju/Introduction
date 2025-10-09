import { useEffect, useRef } from "react";
import Engine from "@game/gameScripts/Engine";

// Thin React wrapper that mounts the canvas + engine and cleans up.
export default function Starfield({ onKill }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const engine = new Engine(canvas, { onKill });
    return () => engine.destroy();
  }, [onKill]); // now safe because PlayGame memoizes onKill

  return (
    <canvas
      ref={ref}
      role="presentation"
      style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" }}
    />
  );
}
