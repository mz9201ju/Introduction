// src/components/SpaceChatWebLLM.jsx
import { useEffect, useRef, useState } from "react";
import { initLLM, webllmChat } from "../../lib/ai-webllm";
import darth from "../../features/game/assets/helmet.png";

export default function SpaceChatWebLLM() {
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [ready, setReady] = useState(false);
    const [welcomed, setWelcomed] = useState(false);
    const [progress, setProgress] = useState("Initializing…");
    const [input, setInput] = useState("");
    const [msgs, setMsgs] = useState([
        { role: "system", content: "You are SpaceNerd Copilot. Be concise, helpful, and fun." },
        { role: "assistant", content: "🚀 Welcome, Darth Vader! Ready to explore the galaxy together?" },
    ]);


    const listRef = useRef(null);
    const engineRef = useRef(null);

    // init once when panel opens (so cold visitors don’t pay model cost)
    useEffect(() => {
        if (!open || engineRef.current) return;
        let mounted = true;
        (async () => {
            try {
                const engine = await initLLM((t) => mounted && setProgress(t));
                if (!mounted) return;
                engineRef.current = engine;
                setReady(true);
                setProgress("Ready");
            } catch (e) {
                console.error(e);
                setProgress("Failed to initialize model.");
            }
        })();
        return () => { mounted = false; };
    }, [open]);

    // 👋 New welcome effect (put this right after the one above)
    useEffect(() => {
        if (open && !welcomed && ready) {
            setMsgs(m => [...m, { role: "assistant", content: "👋 Hi Darth Vader, good to see you back in orbit." }]);
            setWelcomed(true);
        }
    }, [open, ready]);

    // autoscroll
    useEffect(() => {
        if (!open) return;
        const el = listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [open, msgs]);

    const send = async () => {
        const q = input.trim();
        if (!q || busy || !engineRef.current) return;
        if (!welcomed) setMsgs(m => m.filter(x => x.role !== "assistant")); // remove the intro

        setInput("");
        setMsgs(m => [...m, { role: "user", content: q }, { role: "assistant", content: "" }]);
        setBusy(true);

        // Build the conversation for WebLLM
        const convo = [
            msgs[0], // system
            ...msgs.filter(m => m.role !== "system"),
            { role: "user", content: q }
        ];

        let acc = "";
        try {
            for await (const delta of webllmChat(engineRef.current, convo)) {
                acc += delta;
                setMsgs(m => {
                    const copy = [...m];
                    copy[copy.length - 1] = { role: "assistant", content: acc };
                    return copy;
                });
            }
        } catch (err) {
            console.error(err);
            setMsgs(m => [...m, { role: "assistant", content: "⚠️ Inference error." }]);
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

    const unsupported = !("gpu" in navigator) && !("gpu" in (navigator || {}));
    // Note: WebLLM can still run with WASM fallback; just slower.

    return (
        <>
            {/* Toggle FAB */}
            <button onClick={() => setOpen(o => !o)} style={styles.fab} aria-label="Open AI chat">
                {open ? "✖" : <img src={darth} alt="🛰️" width="60" height="50" style={{
                    backgroundColor: "white",
                    borderRadius: "50%",   // optional: makes it round like the emoji
                    padding: "0px",         // optional: adds some breathing room
                    marginLeft: "-9px"   // 👈 moves image ~6px left
                }} />}
            </button>

            {/* Panel */}
            {open && (
                <div style={styles.panel}>
                    <div style={styles.header}>
                        <span>Space Copilot (On-device)</span>
                        <span style={styles.pulse} aria-hidden>●</span>
                    </div>

                    {!ready && (
                        <div style={styles.loader}>
                            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>{progress}</div>
                            <div style={styles.barWrap}><div style={styles.bar} /></div>
                            <div style={{ fontSize: 11, opacity: 0.7 }}>
                                {unsupported ? "WebGPU not detected — falling back to WASM (slower)." : "Using WebGPU if available."}
                            </div>
                        </div>
                    )}

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
                            placeholder={!ready ? "Loading model…" : (busy ? "Thinking…" : "Ask me anything…")}
                            disabled={busy || !ready}
                            rows={2}
                            style={styles.textarea}
                        />
                        <button onClick={send} disabled={busy || !input.trim() || !ready} style={styles.sendBtn}>
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
    loader: { padding: 12, display: "flex", flexDirection: "column", gap: 6 },
    barWrap: { height: 6, background: "rgba(120,200,255,0.15)", borderRadius: 8, overflow: "hidden" },
    bar: { height: "100%", width: "40%", background: "rgba(120,200,255,0.6)", animation: "load 1.2s infinite alternate" },
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

// tiny keyframe, inline to avoid CSS file
const styleEl = document.createElement("style");
styleEl.innerHTML = `@keyframes load { from { width: 18%; } to { width: 78%; } }`;
document.head.appendChild(styleEl);
