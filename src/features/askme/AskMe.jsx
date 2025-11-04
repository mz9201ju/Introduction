import { useState, useRef, useEffect } from "react";
import SimpleSpaceshipCursor from "@features/SimpleSpaceshipCursor";
import { profile } from "@resume/data/profile";   // if you moved profile.js under resume/data
import Footer from "@app/nav/Footer"

export default function AskMe() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);
  const [isMatrixActive, setIsMatrixActive] = useState(false);

  useEffect(() => {
    const chatArea = endRef.current?.parentElement;
    if (!chatArea) return;

    let isUserScrolling = false;
    let frame;

    const handleUserScroll = () => {
      isUserScrolling = true;
      // after a few seconds of no activity, re-enable auto scroll
      clearTimeout(chatArea._scrollTimeout);
      chatArea._scrollTimeout = setTimeout(() => {
        isUserScrolling = false;
      }, 2500);
    };

    const smoothFollow = () => {
      if (!isUserScrolling) {
        const target = chatArea.scrollHeight - chatArea.clientHeight;
        const delta = target - chatArea.scrollTop;
        chatArea.scrollTop += delta * 0.2; // smooth ease
      }
      frame = requestAnimationFrame(smoothFollow);
    };

    chatArea.addEventListener("scroll", handleUserScroll);
    frame = requestAnimationFrame(smoothFollow);

    return () => {
      cancelAnimationFrame(frame);
      chatArea.removeEventListener("scroll", handleUserScroll);
      clearTimeout(chatArea._scrollTimeout);
    };
  }, [messages, isTyping]);

  useEffect(() => {
    document.title = "Ask Me | Omer Zahid";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Chat directly with Omer AI — learn about Omer Zahid, his projects, and website.");
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = "Chat directly with Omer AI — learn about Omer Zahid, his projects, and website.";
      document.head.appendChild(meta);
    }
  }, []);


  // Inject full page CSS (kills overlays + makes interactive)
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
  /* ====== AskMe Page Scoped Styles ====== */
  .askme-wrapper {
    position: relative;
    z-index: 0;
    height: 100vh;
    overflow: hidden;
    background: transparent !important;
    font-family: monospace !important;
    color: #00ff99;
    cursor: none !important; /* 👈 restore default */
  }

  html,
  body,
  :root,
  #root,
  * {
    cursor: none !important; /* 👈 restore normal cursor globally */
  }

  a,
  a:hover,
  a:focus,
  button,
  button:hover,
  button:focus,
  [role="button"] {
    cursor: none !important; /* 👈 clickable elements show pointer hand */
  }

  canvas {
    cursor: auto !important;
    touch-action: none;
    display: block;
    position: relative;
    z-index: 9999 !important;
    pointer-events: auto;
  }

  .askme-wrapper canvas,
  .askme-wrapper .spaceship-cursor,
  .askme-wrapper #spaceship-cursor {
    position: fixed !important;
    inset: 0;
    pointer-events: none !important;
    z-index: 99999 !important;
    cursor: none !important; /* 👈 keep normal cursor */
  }

  .askme-wrapper nav,
  .askme-wrapper button,
  .askme-wrapper .navbar,
  .askme-wrapper .nav-item,
  .askme-wrapper .send-button {
    position: relative !important;
    z-index: 2 !important;
    cursor: none !important; /* 👈 normal button cursor */
  }

  /* === Terminal === */
  .ask-omer-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    animation: matrixGlow 6s infinite ease-in-out;
    position: relative;
    z-index: 10;
  }

  @keyframes matrixGlow {
    0% { background-color: rgba(0,255,100,0.05); }
    50% { background-color: rgba(0,255,100,0.15); }
    100% { background-color: rgba(0,255,100,0.05); }
  }

  .terminal-card {
    border: 1px solid rgba(0, 255, 150, 0.3);
    border-radius: 16px;
    background: rgba(0, 0, 0, 0.85);
    box-shadow: 0 0 25px rgba(0, 255, 150, 0.3);
    width: 90%;
    max-width: 700px;
    padding: 1.25rem;
  }

  .matrix-title {
    text-align: center;
    color: #00ff99;
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 0.75rem;
    text-shadow: 0 0 12px #00ff99;
  }

  .chat-area {
    flex: 1;
    overflow-y: auto;
    max-height: 55vh;
    background: rgba(0,0,0,0.6);
    border: 1px solid rgba(0,255,150,0.3);
    border-radius: 10px;
    padding: 1rem;
    margin-bottom: 1rem;
    -webkit-overflow-scrolling: touch;
  }

  .input-section {
    display: flex;
    gap: 0.5rem;
  }

  textarea {
    flex: 1;
    background: black;
    color: #00ff99;
    border: 1px solid rgba(0,255,150,0.3);
    border-radius: 10px;
    padding: 0.75rem;
    font-size: 1rem;
    resize: none;
  }

  textarea:focus {
    outline: none;
    border-color: #00ff99;
    box-shadow: 0 0 10px rgba(0,255,150,0.4);
  }

  button {
    background: #00ff99;
    border: none;
    color: #000;
    font-weight: bold;
    border-radius: 10px;
    padding: 0.75rem 1.25rem;
    min-width: 90px;
    font-size: 1rem;
    transition: background 0.2s, transform 0.2s;
  }

  button:hover {
    background: #00ffaa;
    transform: scale(1.02);
  }

  button:active {
    background: #00cc77;
    transform: scale(0.97);
  }

  @media (max-width: 640px) {
    .terminal-card {
      padding: 1rem;
      max-width: 95%;
    }
    .chat-area {
      max-height: 45vh;
    }
    textarea {
      font-size: 0.9rem;
    }
    button {
      font-size: 0.9rem;
    }
  }
      /* === Matrix Falling Code Background === */
    .matrix-bg {
    position: fixed;
    top: 0;
    left: 0;
    z-index: -1 !important;  /* 👈 Move it behind everything */
    width: 100%;
    height: 100%;
    background: black;
    pointer-events: none !important;
  }
  `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  // === 💻 Matrix Falling Code Background (controlled, smooth fade) ===
  useEffect(() => {
    if (!isMatrixActive) return; // Only run when active

    const canvas = document.createElement("canvas");
    canvas.className = "matrix-bg";
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops = Array(columns).fill(1);

    let frame;
    function draw() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#00ff99";
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const text = Math.random() > 0.5 ? "1" : "0";
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      frame = requestAnimationFrame(draw);
    }

    draw();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // 🪄 Fade-out animation on cleanup
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);

      // smooth fade instead of instant removal
      canvas.style.transition = "opacity 1s ease-out";
      canvas.style.opacity = "0";

      setTimeout(() => {
        canvas.remove();
      }, 1000); // wait for fade to finish before removing
    };
  }, [isMatrixActive]);

  const askAI = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsTyping(true);
    setIsMatrixActive(true); // 🔥 Start matrix when asking

    try {
      const res = await fetch("https://gh-ai-proxy.omer-mnsu.workers.dev/AI/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || "⚠️ No response from AI.";
      typeEffect(text);
    } catch (err) {
      console.error(err);
      typeEffect("⚠️ Unable to reach AI server.");
    }
  };

  const typeEffect = (text) => {
    let i = 0;
    let displayed = "";
    const aiMsg = { role: "assistant", content: "" };
    setMessages((m) => [...m, aiMsg]);

    const interval = setInterval(() => {
      displayed += text[i];
      i++;
      setMessages((m) => {
        const updated = [...m];
        updated[updated.length - 1] = { role: "assistant", content: displayed };
        return updated;
      });
      if (i >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
        setIsMatrixActive(false); // 🛑 Stop matrix when AI done typing
      }
    }, 15);
  };

  return (
    <>
      <SimpleSpaceshipCursor />
      <div className="askme-wrapper">
        <div className="ask-omer-page">
          <div className="terminal-card">
            <div className="matrix-title">OMER-AI TERMINAL v1.0</div>

            <div className="chat-area">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-2 ${msg.role === "user" ? "text-blue-400" : "text-green-400"}`}
                >
                  <span className="opacity-70">
                    {msg.role === "user" ? "🧑 YOU" : "🤖 OMER-AI"}:
                  </span>{" "}
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                </div>
              ))}
              {isTyping && <div className="text-green-500 animate-pulse">▌</div>}
              <div ref={endRef} />
            </div>

            <div className="input-section">
              <textarea
                aria-label="Ask Omer AI chat input"
                placeholder="Type your question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), askAI())}
              />
              <button onClick={askAI}>Send</button>
            </div>
          </div>
          <Footer profile={profile}/>
        </div>
      </div>
    </>
  );
}
