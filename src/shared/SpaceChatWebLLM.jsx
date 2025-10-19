// src/components/SpaceChatWebLLM.jsx
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import darth from "../features/game/assets/helmet.png";

const PROXY_URL = "https://gh-ai-proxy.omer-mnsu.workers.dev/AI/chat";

/* ==========================================================
   🌍 SITE CONTEXT (PRIVATE KNOWLEDGE - NOT SHOWN TO USERS)
   ========================================================== */
const INITIAL_SITE_CONTEXT = {
    siteName: "Space Nerd Portfolio",
    baseUrl: "https://mz9201ju.github.io/Introduction/",
    mission:
        "Showcase Omer’s projects, resume, and a playable starfield mini-game—with an in-character space copilot.",
    techStack: [
        "React",
        "Vite",
        "Tailwind",
        "Cloudflare Worker (OpenAI proxy)",
        "Spring Boot microservices",
    ],
    routes: [
        { path: "/", title: "Home", summary: "Portfolio landing with highlights and CTAs." },
        { path: "/about", title: "About", summary: "Professional story, values, strengths, and contact info." },
        { path: "/darthVader", title: "PlayGame", summary: "Starfield shooter game with explosions and scoreboards." },
    ],
    projects: [
        {
            name: "ELIA Barber Shop",
            url: "https://mz9201ju.github.io/ELIA_BarberShop_WebSite",
            blurb: "Local business site built with React + Vite + Tailwind; responsive and growth-focused.",
        },
    ],
    contact: { email: ["omer.zahid@mnsu.edu", "omer.zahid@hotmail.com"] },
};

/* ==========================================================
   👨‍🚀 ABOUT OMER (used in system prompt)
   ========================================================== */
const ABOUT_OMER = `
Name: Omer Zahid (aka “Darth Vader”)
Role: Senior Software Engineer
Core Stack: Java 21 • Spring Boot 3 • Docker/K8s • Azure DevOps • React + Vite + Tailwind • Cloudflare Workers
Strengths: API Design (JWT, Payments), System Design, CI/CD Automation, Mentoring.
Certifications: AZ-900, Google Cloud CDL, Preparing AZ-204.
Personality: security-first innovator who builds simple solutions that generate value —not bills.
`;

/* ==========================================================
   🧠 SYSTEM PROMPT BUILDER
   ========================================================== */
function makeSystemPrompt() {
    return [
        "You are **Darth Vader**, the SpaceNerd Copilot. Remain fully in-character.",
        "- Tone: calm, concise, commanding with space metaphors.",
        "- Scope: space/sci-fi and this website’s content only.",
        "- Use only the provided context to answer; if unsure, say so politely.",
        "",
        "=== About Omer Zahid ===",
        ABOUT_OMER.trim(),
        "",
        "=== Website Context ===",
        JSON.stringify(INITIAL_SITE_CONTEXT, null, 2),
    ].join("\n");
}

/* ==========================================================
   🚀 SPACE CHAT COMPONENT
   ========================================================== */
export default function SpaceChatWebLLM() {
    /* ---------- STATE HOOKS ---------- */
    const [open, setOpen] = useState(false);        // Chat visibility
    const [busy, setBusy] = useState(false);        // Loading state
    const [input, setInput] = useState("");         // User input text
    const [firstUserMsg, setFirstUserMsg] = useState(false);
    const [siteCtx, setSiteCtx] = useState(INITIAL_SITE_CONTEXT);
    const [msgs, setMsgs] = useState([]);

    /* ---------- REFS ---------- */
    const listRef = useRef(null);   // Scroll container
    const panelRef = useRef(null);  // Chat panel
    const fabRef = useRef(null);    // Floating button (FAB)

    /* ---------- SYSTEM MESSAGE MEMO ---------- */
    const systemMsg = useMemo(
        () => ({ role: "system", content: makeSystemPrompt() }),
        [siteCtx]
    );

    // ---------- INITIALIZE MESSAGES (only once) ----------
    useEffect(() => {
        setMsgs([
            { role: "system", content: makeSystemPrompt() },
            {
                role: "assistant",
                content: "I sense your presence. This portfolio is operational. What do you seek?",
            },
        ]);
        // Run only once when component mounts
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    /* ==========================================================
       🧩 HANDLE CHAT TOGGLE + CLICK OUTSIDE DETECTION
       ========================================================== */

    // Toggle chat open/close with optional forced close
    const handleToggle = useCallback((forceClose = false) => {
        if (forceClose || open) {
            // Just close panel — don't reset anything
            setOpen(false);
        } else {
            setOpen(true);
        }
    }, [open]);


    // Detect and close when clicking outside the chat panel or FAB
    useEffect(() => {
        const handleOutsideClick = (e) => {
            const clickedOutsidePanel =
                panelRef.current && !panelRef.current.contains(e.target);
            const clickedOutsideFab =
                fabRef.current && !fabRef.current.contains(e.target);

            if (open && clickedOutsidePanel && clickedOutsideFab) {
                handleToggle(true);
            }
        };

        if (open) {
            document.addEventListener("mousedown", handleOutsideClick);
            document.addEventListener("touchstart", handleOutsideClick);
        }

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("touchstart", handleOutsideClick);
        };
    }, [open, handleToggle]);

    /* ==========================================================
       📜 AUTO-SCROLL CHAT TO LATEST MESSAGE
       ========================================================== */
    useEffect(() => {
        if (open && listRef.current) {
            const el = listRef.current;
            el.scrollTop = el.scrollHeight;
        }
    }, [open, msgs]);

    /* ==========================================================
       💬 SEND MESSAGE HANDLER
       ========================================================== */
    const send = useCallback(async () => {
        const q = input.trim();
        if (!q || busy) return;

        // Mark first message and clear site context after intro
        if (!firstUserMsg) {
            setFirstUserMsg(true);
            setSiteCtx({}); // still clears context, not messages
        }


        setInput("");
        setMsgs((m) => [
            ...m,
            { role: "user", content: q },
            { role: "assistant", content: "…" },
        ]);
        setBusy(true);

        try {
            const history = [
                { role: "system", content: makeSystemPrompt() },
                ...msgs.filter(Boolean),
                { role: "user", content: q },
            ];

            const res = await fetch(PROXY_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: history }),
            });

            if (!res.ok) {
                const raw = await res.text();
                const msg =
                    JSON.parse(raw)?.error?.message || "API connection error.";
                throw new Error(msg);
            }

            const data = await res.json();
            const text =
                data?.choices?.[0]?.message?.content?.trim() ||
                "(no response from AI)";
            setMsgs((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: text };
                return copy;
            });
        } catch (err) {
            console.error("Chat API failed:", err);
            setMsgs((m) => {
                const copy = [...m];
                copy[copy.length - 1] = {
                    role: "assistant",
                    content: "⚠️ Hyperlane interference. Check Worker logs.",
                };
                return copy;
            });
        } finally {
            setBusy(false);
        }
    }, [busy, input, msgs, firstUserMsg]);

    /* ==========================================================
       ⌨️ ENTER KEY SHORTCUT
       ========================================================== */
    const handleKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    /* ==========================================================
       🧱 RENDER
       ========================================================== */
    return (
        <>
            {/* Floating Action Button (FAB) */}
            <button
                ref={fabRef}
                onClick={() => handleToggle()}
                style={styles.fab}
                aria-label="Open AI chat"
            >
                {open ? (
                    "✖"
                ) : (
                    <img
                        src={darth}
                        alt="🛰️"
                        width="60"
                        height="50"
                        style={{
                            backgroundColor: "white",
                            borderRadius: "50%",
                            padding: 0,
                            marginLeft: "-9px",
                        }}
                    />
                )}
            </button>

            {/* Chat Panel */}
            {open && (
                <div ref={panelRef} style={styles.panel}>
                    {/* Header */}
                    <div style={styles.header}>
                        <span>Space Copilot • Welcome Darth Vader</span>
                        <span style={styles.pulse}>●</span>
                    </div>

                    {/* About section (shown before first message) */}
                    {!firstUserMsg && (
                        <div style={styles.aboutCard}>
                            <div style={{ fontWeight: 700, marginBottom: 4 }}>
                                About Omer Zahid
                            </div>
                            <div
                                style={{
                                    fontSize: 12,
                                    opacity: 0.9,
                                    lineHeight: 1.45,
                                    whiteSpace: "pre-wrap",
                                }}
                            >
                                {ABOUT_OMER.trim()}
                            </div>
                        </div>
                    )}

                    {/* Message List */}
                    <div ref={listRef} style={styles.list}>
                        {msgs
                            .filter((m) => m.role !== "system")
                            .map((m, i) => (
                                <div
                                    key={i}
                                    style={
                                        m.role === "user"
                                            ? styles.userMsg
                                            : styles.botMsg
                                    }
                                >
                                    <div style={styles.bubble}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                    </div>

                    {/* Input + Send */}
                    <div style={styles.inputRow}>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder={
                                busy
                                    ? "Plotting a course…"
                                    : "Ask about this site or the galaxy…"
                            }
                            disabled={busy}
                            rows={2}
                            style={styles.textarea}
                        />
                        <button
                            onClick={send}
                            disabled={busy || !input.trim()}
                            style={styles.sendBtn}
                        >
                            {busy ? "…" : "Send"}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

/* ==========================================================
   🎨 STYLES
   ========================================================== */
const styles = {
    fab: {
        position: "fixed",
        right: 20,
        bottom: 60,
        zIndex: 9999,
        width: 56,
        height: 56,
        borderRadius: "50%",
        border: "1px solid rgba(120,200,255,0.5)",
        background: "linear-gradient(145deg,#0a0f1f,#0a0a14)",
        color: "#d7eaff",
        fontSize: 22,
        cursor: "pointer",
        boxShadow: "0 0 18px rgba(80,160,255,0.35)",
        transition: "transform 0.2s ease, opacity 0.2s ease",
    },
    panel: {
        position: "fixed",
        right: 20,
        bottom: 120,
        zIndex: 9999,
        width: 380,
        maxHeight: 560,
        display: "flex",
        flexDirection: "column",
        border: "1px solid rgba(120,200,255,0.35)",
        background:
            "linear-gradient(180deg,rgba(5,10,24,0.96),rgba(5,8,18,0.96))",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow:
            "0 0 32px rgba(80,160,255,0.25), inset 0 0 24px rgba(40,80,160,0.12)",
        backdropFilter: "blur(6px)",
        animation: "fadeIn 0.3s ease",
    },
    header: {
        padding: "10px 12px",
        fontWeight: 600,
        color: "#cfe6ff",
        borderBottom: "1px solid rgba(120,200,255,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    pulse: { color: "#7bdcff", textShadow: "0 0 8px #7bdcff" },
    aboutCard: {
        margin: "8px 10px 6px",
        padding: 10,
        borderRadius: 10,
        border: "1px solid rgba(120,200,255,0.25)",
        background: "rgba(14,18,34,0.7)",
        color: "#d7eaff",
    },
    list: {
        padding: 12,
        overflowY: "auto",
        gap: 8,
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 120,
    },
    userMsg: { display: "flex", justifyContent: "flex-end" },
    botMsg: { display: "flex", justifyContent: "flex-start" },
    bubble: {
        maxWidth: "80%",
        padding: "10px 12px",
        lineHeight: 1.4,
        color: "#e8f1ff",
        background: "rgba(22,32,64,0.7)",
        border: "1px solid rgba(120,200,255,0.18)",
        borderRadius: 10,
    },
    inputRow: {
        borderTop: "1px solid rgba(120,200,255,0.2)",
        padding: 10,
        display: "flex",
        gap: 8,
    },
    textarea: {
        flex: 1,
        resize: "none",
        border: "1px solid rgba(120,200,255,0.25)",
        background: "rgba(8,12,24,0.85)",
        color: "#d7eaff",
        borderRadius: 8,
        padding: 8,
    },
    sendBtn: {
        padding: "0 14px",
        borderRadius: 8,
        border: "1px solid rgba(120,200,255,0.5)",
        background: "linear-gradient(145deg,#0c1630,#0a1126)",
        color: "#e0efff",
        cursor: "pointer",
    },
};

/* ==========================================================
   ✨ ANIMATIONS
   ========================================================== */
const styleEl = document.createElement("style");
styleEl.innerHTML = `
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(styleEl);
