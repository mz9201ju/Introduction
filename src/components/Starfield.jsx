import { useEffect, useRef } from "react";
import Engine from "../game/Engine";

// Thin React wrapper that mounts the canvas + engine and cleans up.
export default function Starfield() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const engine = new Engine(canvas);
    return () => engine.destroy();
  }, []);

  return (
    <canvas
      ref={ref}
      role="presentation"
      style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" }}
    />
  );
}
