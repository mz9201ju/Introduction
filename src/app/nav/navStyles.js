// Centralized button styles. Stable references = fewer rerenders.
export const baseBtnStyle = {
    display: "inline-block",
    margin: "0 10px",
    padding: "10px 22px",
    borderRadius: "10px",
    color: "#e0e6ff",
    textDecoration: "none",
    fontWeight: 700,
    letterSpacing: "0.5px",
    border: "1px solid rgba(90,140,255,0.7)",
    cursor: "pointer",
    transition: "all 0.25s ease",
    background: "radial-gradient(circle at 30% 30%, #1a1f45, #090b1e)",
    boxShadow: "0 0 15px rgba(80,150,255,0.7), 0 0 30px rgba(60,120,255,0.4)",
    textShadow: "0 0 8px rgba(150,180,255,0.8)",
};

export const activeBtnStyle = {
    background: "radial-gradient(circle at 30% 30%, #274bff, #0b0f40)",
    boxShadow: "0 0 25px rgba(100,180,255,1), 0 0 50px rgba(80,150,255,0.8)",
    textShadow: "0 0 12px rgba(200,220,255,1), 0 0 25px rgba(120,160,255,0.8)",
};
