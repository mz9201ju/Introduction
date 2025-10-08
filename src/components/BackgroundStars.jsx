import { useEffect, useRef } from "react";
import StarfieldBackground from "../game/StarfieldBackground";

export default function BackgroundStars() {
    const ref = useRef(null);

    useEffect(() => {
        const canvas = ref.current;
        const ctx = canvas.getContext("2d");
        const bg = new StarfieldBackground();

        let raf = 0;
        function resize() {
            canvas.width = bg.W = window.innerWidth;
            canvas.height = bg.H = window.innerHeight;
            bg.resize(canvas.width, canvas.height);
        }
        function frame() {
            ctx.clearRect(0, 0, bg.W, bg.H);
            bg.updateAndDraw(ctx);
            raf = requestAnimationFrame(frame);
        }

        resize();
        window.addEventListener("resize", resize);
        raf = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={ref}
            role="presentation"
            style={{ position: "fixed", inset: 0, zIndex: -2, pointerEvents: "none" }}
        />
    );
}
