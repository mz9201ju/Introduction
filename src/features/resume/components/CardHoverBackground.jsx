import { useRef, useEffect, useCallback } from "react";
import { getAnimationProfile } from "@resume/utils/animationProfiles";

function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

function createParticle(profile, width, height, scatter) {
    const symbol = profile.symbols[Math.floor(Math.random() * profile.symbols.length)];
    return {
        symbol,
        x: scatter ? Math.random() * width : -50,
        y: Math.random() * height,
        vx: randomBetween(...profile.vxRange),
        vy: randomBetween(...profile.vyRange),
        size: randomBetween(...profile.sizeRange),
        opacity: randomBetween(...profile.opacityRange),
    };
}

/**
 * Canvas-based animated background for a ProjectCard.
 * Renders themed emoji particles that move across the card on hover.
 * Respects prefers-reduced-motion — stays static when enabled.
 * pointer-events: none ensures it never blocks card links/buttons.
 */
export default function CardHoverBackground({ animKey, isActive }) {
    const canvasRef = useRef(null);
    const animRef = useRef(null);
    const particlesRef = useRef(null);

    const stopAnimation = useCallback(() => {
        if (animRef.current) {
            cancelAnimationFrame(animRef.current);
            animRef.current = null;
        }
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (!isActive || prefersReduced) {
            stopAnimation();
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particlesRef.current = null;
            return;
        }

        // Size canvas to match the card container
        const container = canvas.parentElement;
        const width = container.clientWidth || 320;
        const height = container.clientHeight || 180;
        canvas.width = width;
        canvas.height = height;

        const profile = getAnimationProfile(animKey);

        // Create fresh particles for this activation (also picks up any animKey change)
        particlesRef.current = Array.from({ length: profile.count }, () =>
            createParticle(profile, width, height, true)
        );

        const ctx = canvas.getContext('2d');

        function tick() {
            ctx.clearRect(0, 0, width, height);
            particlesRef.current.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;

                // Wrap particles around card edges
                if (p.vx > 0 && p.x > width + 50) {
                    p.x = -50;
                    p.y = Math.random() * height;
                } else if (p.vx < 0 && p.x < -50) {
                    p.x = width + 50;
                    p.y = Math.random() * height;
                }
                if (p.vy < 0 && p.y < -50) {
                    p.y = height + 50;
                    p.x = Math.random() * width;
                } else if (p.vy > 0 && p.y > height + 50) {
                    p.y = -50;
                    p.x = Math.random() * width;
                }

                ctx.globalAlpha = p.opacity;
                ctx.font = `${Math.round(p.size)}px serif`;
                ctx.fillText(p.symbol, p.x, p.y);
            });
            ctx.globalAlpha = 1;
            animRef.current = requestAnimationFrame(tick);
        }

        animRef.current = requestAnimationFrame(tick);
        return stopAnimation;
    }, [isActive, animKey, stopAnimation]);

    return (
        <canvas
            ref={canvasRef}
            className="card-hover-bg-canvas"
            aria-hidden="true"
        />
    );
}
