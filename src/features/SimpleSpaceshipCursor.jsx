import { useEffect, useRef, useState } from "react";
import spaceship from "/spaceship.png";

const OFFSET_Y = -12; // adjust if the nose isn't aligned with the pointer

export default function SimpleSpaceshipCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hidden, setHidden] = useState(false);
  const cursorRef = useRef(null);

  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;

    // Hide on touch devices
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

    // ---- Force-hide logic ----
    // Which elements should hide the spaceship while hovering/typing
    const HIDE_SELECTORS = "textarea, input, [contenteditable='true'], .ql-editor, .cm-editor, .CodeMirror";

    // Helper: is the event target inside a field we care about?
    const isInTextField = (target) => {
      if (!(target instanceof Element)) return false;
      if (target.matches(HIDE_SELECTORS)) return true;
      return !!target.closest(HIDE_SELECTORS);
    };

    // Mouse enter/leave handling
    const onPointerMove = (e) => {
      setHidden(isInTextField(e.target));
    };

    // Focus handling (keyboard/tab)
    const onFocusIn = (e) => {
      if (isInTextField(e.target)) setHidden(true);
    };
    const onFocusOut = (e) => {
      if (isInTextField(e.target)) setHidden(false);
    };

    // If mouse enters/leaves a textarea specifically
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
    const hide = () => setHidden(true);
    const showIfNotFocused = () => {
      const active = document.activeElement;
      if (!active || !isInTextField(active)) setHidden(false);
    };

    // Global listeners
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);

    // Attach direct hover on current text fields
    addHoverListeners();

    // Also watch for dynamic fields being added
    const mo = new MutationObserver(() => {
      removeHoverListeners();
      addHoverListeners();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      removeHoverListeners();
      mo.disconnect();
    };
  }, []);

  // Disable spaceship on these routes
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
        opacity: hidden ? 0 : 1, // ← hard toggle visibility
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
