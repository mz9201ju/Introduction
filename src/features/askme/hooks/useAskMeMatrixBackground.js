import { useEffect } from "react";

export function useAskMeMatrixBackground({ isMatrixActive, matrixColor, containerRef }) {
  useEffect(() => {
    if (!isMatrixActive) return;

    const mountNode = containerRef?.current;
    if (!mountNode) return;

    const canvas = document.createElement("canvas");
    canvas.className = "matrix-bg";
    mountNode.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const fontSize = 14;
    let columns = Math.floor(width / fontSize);
    let drops = Array(columns).fill(1);

    let frame;

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = matrixColor;
      ctx.font = `${fontSize}px monospace`;

      for (let index = 0; index < drops.length; index += 1) {
        const text = Math.random() > 0.5 ? "1" : "0";
        ctx.fillText(text, index * fontSize, drops[index] * fontSize);

        if (drops[index] * fontSize > height && Math.random() > 0.975) {
          drops[index] = 0;
        }

        drops[index] += 1;
      }

      frame = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.floor(width / fontSize);
      drops = Array(columns).fill(1);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
      canvas.style.transition = "opacity 1s ease-out";
      canvas.style.opacity = "0";
      setTimeout(() => {
        canvas.remove();
      }, 1000);
    };
  }, [containerRef, isMatrixActive, matrixColor]);
}
