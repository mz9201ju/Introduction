import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

/**
 * WarpDriveFX
 * Zero-coupling page transition:
 * - On each route change, show a fixed overlay that flashes + streaks (warp).
 * - Doesn’t re-render or re-mount your pages, so no blank screens.
 * - Pointer-events: none; vertical scroll unaffected; backdrop stays pitch black.
 * - Honors reduced motion.
 */
export default function WarpDriveFX() {
    const { pathname } = useLocation();
    const [active, setActive] = useState(false);
    const timer = useRef(null);
    const didMount = useRef(false);

    // 🔧 Tweakables
    const DURATION_MS = 650; // total effect time

    useEffect(() => {
        // Skip the initial load; only run on actual navigations
        if (!didMount.current) {
            didMount.current = true;
            return;
        }
        setActive(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setActive(false), DURATION_MS);
        return () => clearTimeout(timer.current);
    }, [pathname]);

    return (
        <>
            <style>{`
        /* Respect OS reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .warpfx, .warpfx * { animation: none !important; transition: none !important; }
        }

        .warpfx {
          position: fixed;
          inset: 0;
          z-index: 2147483647;
          pointer-events: none;
          opacity: 0;
        }
        .warpfx--on { opacity: 1; }

        /* Big flash to white that quickly fades */
        .warpfx__flash {
          position: absolute;
          inset: 0;
          background: radial-gradient(60% 60% at 50% 50%, rgba(255,255,255,0.55), rgba(255,255,255,0.0) 70%),
                      radial-gradient(80% 80% at 50% 50%, rgba(255,255,255,0.18), rgba(255,255,255,0.0) 75%);
          mix-blend-mode: screen;
          opacity: 0;
        }

        /* Star streaks sweeping left→right (gives sense of forward motion) */
        .warpfx__streaks {
          position: absolute;
          inset: 0;
          background:
            repeating-linear-gradient(
              90deg,
              rgba(255,255,255,0.12) 0 1px,
              rgba(255,255,255,0.00) 1px 8px
            );
          background-size: 200% 100%;
          filter: blur(0.6px) brightness(1.25);
          opacity: 0;
        }

        /* Subtle vignette so it feels grounded on black sites */
        .warpfx__vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(120% 120% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%);
          opacity: 0;
        }

        /* Keyframes */
        @keyframes warp-flash {
          0%   { opacity: 0; }
          12%  { opacity: 0.9; }
          35%  { opacity: 0.35; }
          100% { opacity: 0; }
        }

        @keyframes warp-streak {
          0%   { opacity: 0; background-position: 0% 0%; transform: scale(1.02); }
          10%  { opacity: 0.8; }
          100% { opacity: 0;  background-position: -180% 0%; transform: scale(1.00); }
        }

        @keyframes warp-vignette {
          0%   { opacity: 0.0; }
          25%  { opacity: 0.35; }
          100% { opacity: 0.0; }
        }

        /* Activate animations only when .warpfx--on is set */
        .warpfx.warpfx--on .warpfx__flash {
          animation: warp-flash ${DURATION_MS}ms ease both;
        }
        .warpfx.warpfx--on .warpfx__streaks {
          animation: warp-streak ${DURATION_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1) both;
        }
        .warpfx.warpfx--on .warpfx__vignette {
          animation: warp-vignette ${DURATION_MS}ms ease-out both;
        }
      `}</style>

            <div className={`warpfx ${active ? "warpfx--on" : ""}`} aria-hidden="true">
                <div className="warpfx__flash" />
                <div className="warpfx__streaks" />
                <div className="warpfx__vignette" />
            </div>
        </>
    );
}