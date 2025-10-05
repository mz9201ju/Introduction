import { useEffect, useRef } from "react";


export default function Starfield() {
    const ref = useRef(null);
    useEffect(() => {
        const canvas = ref.current;
        const ctx = canvas.getContext("2d");
        let raf = 0;
        let stars = [];


        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            stars = Array.from({ length: Math.min(300, Math.floor(canvas.width * 0.3)) }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                z: Math.random() * 1 + 0.2,
                r: Math.random() * 1.2 + 0.2
            }));
        }
        function frame() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const s of stars) {
                s.y += s.z * 0.6; // drift
                if (s.y > canvas.height) s.y = 0;
                ctx.globalAlpha = 0.6 + Math.random() * 0.4;
                ctx.fillStyle = "#cfe0ff";
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
            }
            raf = requestAnimationFrame(frame);
        }
        resize();
        frame();
        window.addEventListener("resize", resize);
        return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    }, []);


    return (
        <canvas
            ref={ref}
            style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" }}
        />
    );
}