// navStyles.js (animated)

// 👉 One-time keyframes injection (safe to import anywhere)
(() => {
  if (typeof document === "undefined") return;
  if (document.querySelector('style[data-nav-anim="true"]')) return;
  const css = `
    @keyframes navBtnPulse {
      0%   { transform: translateZ(0) scale(1);   box-shadow: 0 0 14px rgba(90,150,255,.55), 0 0 28px rgba(60,120,255,.35); filter: saturate(1); }
      100% { transform: translateZ(0) scale(1.035); box-shadow: 0 0 22px rgba(120,190,255,.95), 0 0 48px rgba(80,150,255,.6); filter: saturate(1.12); }
    }
    @keyframes navAuroraShift {
      0%   { background-position: 0% 50%, 100% 50%, 50% 50%; }
      50%  { background-position: 100% 50%, 0% 50%, 50% 50%; }
      100% { background-position: 0% 50%, 100% 50%, 50% 50%; }
    }
    @media (prefers-reduced-motion: reduce) {
      .__reduce-motion { animation: none !important; }
    }
  `;
  const tag = document.createElement("style");
  tag.setAttribute("data-nav-anim", "true");
  tag.textContent = css;
  document.head.appendChild(tag);
})();

// Centralized button styles. Stable references = fewer rerenders.
export const baseBtnStyle = {
  position: "relative",
  display: "inline-block",
  margin: "0 10px",
  padding: "10px 22px",
  borderRadius: "12px",
  color: "#e0e6ff",
  textDecoration: "none",
  fontWeight: 800,
  letterSpacing: "0.6px",
  border: "1px solid rgba(90,140,255,0.65)",
  cursor: "pointer",

  // Smooth feel
  transition: "transform 180ms ease, filter 180ms ease, box-shadow 220ms ease",

  // 🎨 Replace shorthand 'background' with explicit longhands:
  backgroundColor: "rgba(10,16,60,0.95)", // fallback base color
  backgroundImage: [
    // moving aurora layer (top)
    "linear-gradient(135deg, rgba(30,50,130,0.95) 0%, rgba(10,16,60,0.95) 100%)",
    // color wash that drifts
    "radial-gradient(120% 120% at 25% 25%, rgba(80,140,255,0.22) 0%, rgba(0,0,0,0) 60%)",
    // subtle inner glow ring
    "radial-gradient(80% 60% at 50% 120%, rgba(100,180,255,0.18) 0%, rgba(0,0,0,0) 70%)",
  ].join(", "),
  backgroundBlendMode: "screen, lighten, normal",
  backgroundSize: "200% 200%, 180% 180%, 100% 100%",
  animation: "navBtnPulse 2600ms ease-in-out infinite alternate, navAuroraShift 16s linear infinite",

  // Glow + clarity
  boxShadow: "0 0 14px rgba(90,150,255,.55), 0 0 28px rgba(60,120,255,.35)",
  textShadow: "0 0 8px rgba(150,180,255,0.75)",
  willChange: "transform, box-shadow, filter, background-position",
  backfaceVisibility: "hidden",

  // Better click/focus affordance
  outline: "none",
};

// Active: brighter neon, slight scale-up, crisper halo
export const activeBtnStyle = {
  // use longhand backgroundImage here too (no shorthand)
  backgroundColor: "rgba(18,26,110,0.96)",
  backgroundImage: [
    "linear-gradient(135deg, rgba(55,95,255,0.96) 0%, rgba(18,26,110,0.96) 100%)",
    "radial-gradient(120% 120% at 30% 30%, rgba(120,190,255,0.30) 0%, rgba(0,0,0,0) 60%)",
    "radial-gradient(80% 60% at 50% 120%, rgba(140,210,255,0.22) 0%, rgba(0,0,0,0) 70%)",
  ].join(", "),
  backgroundBlendMode: "screen, lighten, normal",
  backgroundSize: "200% 200%, 180% 180%, 100% 100%",

  boxShadow: "0 0 26px rgba(120,190,255,1), 0 0 56px rgba(90,160,255,.85)",
  textShadow: "0 0 14px rgba(210,230,255,1), 0 0 26px rgba(140,170,255,.9)",
  transform: "scale(1.035)",
  filter: "brightness(1.05) saturate(1.1)",
};
