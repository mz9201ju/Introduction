import { useEffect, useRef, useState } from "react";
import spaceship from "/spaceship.png";

const OFFSET_Y = -12; // adjust if the nose isn't aligned with the pointer

export default function SimpleSpaceshipCursor() {
  // Start in the center of the screen, not top-left
  const [pos, setPos] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const [hidden, setHidden] = useState(false);
  const cursorRef = useRef(null);

  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;

    // Hide on touch devices (mobile/tablet)
    const isTouch = matchMedia("(pointer: coarse)").matches;
    if (isTouch) {
      el.style.display = "none";
      return;
    }

    // Track mouse
    const onMove = (e) => {
      requestAnimationFrame(() => {
        setPos({ x: e.clientX, y: e.clientY });
      });
    };

    // Hide logic for text fields
    const HIDE_SELECTORS =
      "textarea, input, [contenteditable='true'], .ql-editor, .cm-editor, .CodeMirror";

    const isInTextField = (target) => {
      if (!(target instanceof Element)) return false;
      if (target.matches(HIDE_SELECTORS)) return true;
      return !!target.closest(HIDE_SELECTORS);
    };

    const onPointerMove = (e) => setHidden(isInTextField(e.target));
    const onFocusIn = (e) => isInTextField(e.target) && setHidden(true);
    const onFocusOut = (e) => setHidden(false);

    // Hover listeners for text fields
    const hide = () => setHidden(true);
    const showIfNotFocused = () => {
      const active = document.activeElement;
      if (!active || !isInTextField(active)) setHidden(false);
    };
    const addHoverListeners = () => {
      document.querySelectorAll(HIDE_SELECTORS).forEach((node) => {
        node.addEventListener("mouseenter", hide);
        node.addEventListener("mouseleave", showIfNotFocused);
      });
    };
    const removeHoverListeners = () => {
      document.querySelectorAll(HIDE_SELECTORS).forEach((node) => {
        node.removeEventListener("mouseenter", hide);
        node.removeEventListener("mouseleave", showIfNotFocused);
      });
    };

    // Attach listeners
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    addHoverListeners();

    // Watch for dynamic fields being added
    const mo = new MutationObserver(() => {
      removeHoverListeners();
      addHoverListeners();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // Handle window resize — keep centered reference correct
    const onResize = () => {
      setPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      window.removeEventListener("resize", onResize);
      removeHoverListeners();
      mo.disconnect();
    };
  }, []);

  // Disable spaceship on certain routes
  const isPlayGame =
    window.location.pathname.toLowerCase().includes("/playgame") ||
    window.location.pathname.toLowerCase().includes("/darthvader");
  if (isPlayGame) return null;

  return (
    <div
      ref={cursorRef}
      className="spaceship-cursor"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        transform: `translate(${pos.x}px, ${pos.y + OFFSET_Y}px) translate(-50%, -50%)`,
        transition: "transform 0.05s linear, opacity 0.15s ease",
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 10000,
        opacity: hidden ? 0 : 1,
      }}
    >
      <img
        src={spaceship}
        alt="Spaceship Cursor"
        width={48}
        height={48}
        style={{
          display: "block",
          pointerEvents: "none",
          userSelect: "none",
          filter: "drop-shadow(0 0 6px rgba(150,200,255,0.6))",
        }}
      />
    </div>
  );
}