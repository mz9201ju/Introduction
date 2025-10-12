// src/components/SpaceChatWebLLM.jsx  (now backed by OpenAI via your Cloudflare Worker)
import { useEffect, useRef, useState } from "react";
import darth from "../features/game/assets/helmet.png";

// ✅ POINT THIS TO YOUR WORKER
const PROXY_URL = "https://gh-ai-proxy.omer-mnsu.workers.dev/api";

export default function SpaceChatWebLLM() {
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [input, setInput] = useState("");
    const [welcomed, setWelcomed] = useState(false);

    // No on-device model needed anymore — remove "ready/progress" concept
    const [msgs, setMsgs] = useState([
        { role: "system", content: "You are SpaceNerd Copilot. Be concise, helpful, and fun." },
        { role: "assistant", content: "🚀 Welcome, Darth Vader! Ready to explore the galaxy together?" },
    ]);

    const listRef = useRef(null);

    // simple welcome ping once opened
    useEffect(() => {
        if (open && !welcomed) {
            setMsgs((m) => [...m, { role: "assistant", content: "👋 Hi Darth Vader, now powered by OpenAI." }]);
            setWelcomed(true);
        }
    }, [open, welcomed]);

    // autoscroll
    useEffect(() => {
        if (!open) return;
        const el = listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [open, msgs]);

    const send = async () => {
        const q = input.trim();
        if (!q || busy) return;

        setInput("");
        setMsgs((m) => [...m, { role: "user", content: q }, { role: "assistant", content: "…" }]);
        setBusy(true);

        try {
            const res = await fetch(PROXY_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [{ role: "user", content: q }],
                }),
            });

            if (!res.ok) {
                const raw = await res.text();
                let msg = "API error.";
                try {
                    msg = JSON.parse(raw)?.error?.message || msg;
                } catch { }
                setMsgs((m) => {
                    const copy = [...m];
                    copy[copy.length - 1] = { role: "assistant", content: `⚠️ ${msg}` };
                    return copy;
                });
                setBusy(false);
                return;
            }

            const data = await res.json();
            console.log("✅ AI Response:", data);

            const text =
                data?.choices?.[0]?.message?.content?.trim() ||
                "(no output)";

            setMsgs((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: text };
                return copy;
            });
        } catch (err) {
            console.error("⚠️ Chat API failed:", err);
            setMsgs((m) => [...m, { role: "assistant", content: "⚠️ API error. Check Worker logs." }]);
        } finally {
            setBusy(false);
        }
    };


    const handleKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    return (
        <>
            {/* Toggle FAB */}
            <button onClick={() => setOpen(o => o ? false : true)} style={styles.fab} aria-label="Open AI chat">
                {open ? "✖" : (
                    <img
                        src={darth}
                        alt="🛰️"
                        width="60"
                        height="50"
                        style={{ backgroundColor: "white", borderRadius: "50%", padding: "0px", marginLeft: "-9px" }}
                    />
                )}
            </button>

            {/* Panel */}
            {open && (
                <div style={styles.panel}>
                    <div style={styles.header}>
                        <span>Space Copilot (OpenAI)</span>
                        <span style={styles.pulse} aria-hidden>●</span>
                    </div>

                    <div ref={listRef} style={styles.list}>
                        {msgs.filter(m => m.role !== "system").map((m, i) => (
                            <div key={i} style={m.role === "user" ? styles.userMsg : styles.botMsg}>
                                <div style={styles.bubble}>{m.content}</div>
                            </div>
                        ))}
                    </div>

                    <div style={styles.inputRow}>
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder={busy ? "Thinking…" : "Ask me anything…"}
                            disabled={busy}
                            rows={2}
                            style={styles.textarea}
                        />
                        <button onClick={send} disabled={busy || !input.trim()} style={styles.sendBtn}>
                            {busy ? "…" : "Send"}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

const styles = {
    fab: {
        position: "fixed", right: 20, bottom: 60, zIndex: 9999,
        width: 56, height: 56, borderRadius: 999,
        border: "1px solid rgba(120,200,255,0.5)",
        background: "linear-gradient(145deg,#0a0f1f,#0a0a14)",
        color: "#d7eaff", fontSize: 22, cursor: "pointer",
        boxShadow: "0 0 18px rgba(80,160,255,0.35)"
    },
    panel: {
        position: "fixed", right: 20, bottom: 120, zIndex: 9999,
        width: 360, maxHeight: 520, display: "flex", flexDirection: "column",
        border: "1px solid rgba(120,200,255,0.35)",
        background: "linear-gradient(180deg,rgba(5,10,24,0.96),rgba(5,8,18,0.96))",
        borderRadius: 14, overflow: "hidden",
        boxShadow: "0 0 32px rgba(80,160,255,0.25), inset 0 0 24px rgba(40,80,160,0.12)",
        backdropFilter: "blur(6px)"
    },
    header: {
        padding: "10px 12px", fontWeight: 600, color: "#cfe6ff",
        borderBottom: "1px solid rgba(120,200,255,0.2)",
        display: "flex", alignItems: "center", justifyContent: "space-between"
    },
    pulse: { color: "#7bdcff", textShadow: "0 0 8px #7bdcff" },
    list: { padding: 12, overflowY: "auto", gap: 8, display: "flex", flexDirection: "column", flex: 1, minHeight: 160 },
    userMsg: { display: "flex", justifyContent: "flex-end" },
    botMsg: { display: "flex", justifyContent: "flex-start" },
    bubble: {
        maxWidth: "80%", padding: "10px 12px", lineHeight: 1.4,
        color: "#e8f1ff", background: "rgba(22,32,64,0.7)",
        border: "1px solid rgba(120,200,255,0.18)", borderRadius: 10
    },
    inputRow: { borderTop: "1px solid rgba(120,200,255,0.2)", padding: 10, display: "flex", gap: 8 },
    textarea: {
        flex: 1, resize: "none", border: "1px solid rgba(120,200,255,0.25)",
        background: "rgba(8,12,24,0.85)", color: "#d7eaff", borderRadius: 8, padding: 8
    },
    sendBtn: {
        padding: "0 14px", borderRadius: 8, border: "1px solid rgba(120,200,255,0.5)",
        background: "linear-gradient(145deg,#0c1630,#0a1126)", color: "#e0efff", cursor: "pointer"
    }
};

// keep your inline keyframes (purely cosmetic)
const styleEl = document.createElement("style");
styleEl.innerHTML = `@keyframes load { from { width: 18%; } to { width: 78%; } }`;
document.head.appendChild(styleEl);
