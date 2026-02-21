import { useState, useRef, useEffect } from "react";
import SimpleSpaceshipCursor from "@features/SimpleSpaceshipCursor";
import { profile } from "@resume/data/profile";
import Footer from "@app/nav/Footer";
import { marked } from "marked";
import { COLORS } from "../../theme";
import { sendChatMessage } from "../../services/aiApi";

export default function AskMe() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);
  const chatAreaRef = useRef(null);
  const autoScrollPausedRef = useRef(false);
  const autoScrollTimeoutRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const [isMatrixActive, setIsMatrixActive] = useState(false);

  useEffect(() => {
    const chatArea = chatAreaRef.current;
    if (!chatArea) return;

    const handleUserScroll = () => {
      const distanceFromBottom = chatArea.scrollHeight - chatArea.clientHeight - chatArea.scrollTop;
      autoScrollPausedRef.current = distanceFromBottom > 80;

      clearTimeout(autoScrollTimeoutRef.current);
      autoScrollTimeoutRef.current = setTimeout(() => {
        autoScrollPausedRef.current = false;
      }, 1800);
    };

    chatArea.addEventListener("scroll", handleUserScroll, { passive: true });

    return () => {
      chatArea.removeEventListener("scroll", handleUserScroll);
      clearTimeout(autoScrollTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const chatArea = chatAreaRef.current;
    if (!chatArea || autoScrollPausedRef.current) return;

    chatArea.scrollTo({
      top: chatArea.scrollHeight,
      behavior: "smooth",
    });
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

  useEffect(() => {
    const updateViewportVars = () => {
      document.documentElement.style.setProperty("--askme-vh", `${window.innerHeight * 0.01}px`);
      document.documentElement.style.setProperty("--askme-vw", `${window.innerWidth * 0.01}px`);
    };

    updateViewportVars();
    window.addEventListener("resize", updateViewportVars, { passive: true });
    window.addEventListener("orientationchange", updateViewportVars, { passive: true });

    return () => {
      window.removeEventListener("resize", updateViewportVars);
      window.removeEventListener("orientationchange", updateViewportVars);
      document.documentElement.style.removeProperty("--askme-vh");
      document.documentElement.style.removeProperty("--askme-vw");
    };
  }, []);

  useEffect(() => {
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    let createdViewport = false;

    if (!viewportMeta) {
      viewportMeta = document.createElement("meta");
      viewportMeta.name = "viewport";
      document.head.appendChild(viewportMeta);
      createdViewport = true;
    }

    const previousViewportContent = viewportMeta.getAttribute("content");
    viewportMeta.setAttribute(
      "content",
      "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
    );

    return () => {
      if (previousViewportContent) {
        viewportMeta.setAttribute("content", previousViewportContent);
      } else if (createdViewport) {
        viewportMeta.remove();
      }
    };
  }, []);


  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
  .askme-wrapper {
    position: relative;
    z-index: 0;
    background: transparent !important;
    font-family: monospace !important;
    color: ${COLORS.matrix};
    cursor: none !important;
    height: calc(var(--askme-vh, 1vh) * 100);
    width: calc(var(--askme-vw, 1vw) * 100);
    max-width: 100%;
    overflow-x: hidden;
    overflow-y: hidden;
    box-sizing: border-box;
  }

  .askme-wrapper,
  .askme-wrapper * {
    cursor: none !important;
    box-sizing: border-box;
  }

  .askme-wrapper canvas,
  .askme-wrapper .spaceship-cursor,
  .askme-wrapper #spaceship-cursor {
    position: fixed !important;
    inset: 0;
    pointer-events: none !important;
    z-index: 99999 !important;
    cursor: none !important;
  }

  .askme-wrapper nav,
  .askme-wrapper button,
  .askme-wrapper .navbar,
  .askme-wrapper .nav-item,
  .askme-wrapper .send-button {
    position: relative !important;
    z-index: 2 !important;
    cursor: none !important;
  }

  .ask-omer-page {
    height: calc(var(--askme-vh, 1vh) * 100);
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 0.75rem;
    padding: 5rem 1rem 0.75rem;
    animation: matrixGlow 6s infinite ease-in-out;
    position: relative;
    z-index: 10;
    overflow: hidden;
  }

  @keyframes matrixGlow {
    0% { background-color: ${COLORS.matrixRgbaFaint}; }
    50% { background-color: ${COLORS.matrixRgbaMid}; }
    100% { background-color: ${COLORS.matrixRgbaFaint}; }
  }

  .terminal-card {
    border: 1px solid ${COLORS.matrixRgba};
    border-radius: 16px;
    background: rgba(0, 0, 0, 0.85);
    box-shadow: 0 0 25px ${COLORS.matrixRgba};
    width: min(100%, 720px);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    max-height: calc(var(--askme-vh, 1vh) * 100 - 8.5rem);
  }

  .matrix-title {
    text-align: center;
    color: ${COLORS.matrix};
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 0.75rem;
    text-shadow: 0 0 12px ${COLORS.matrix};
  }

  .chat-area {
    flex: 1 1 auto;
    overflow-y: auto;
    min-height: 0;
    background: rgba(0,0,0,0.6);
    border: 1px solid ${COLORS.matrixRgba};
    border-radius: 10px;
    padding: 1rem;
    margin-bottom: 1rem;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    touch-action: pan-y;
  }

  .input-section {
    display: flex;
    gap: 0.5rem;
    align-items: flex-end;
  }

  .message-row {
    margin-bottom: 0.6rem;
    line-height: 1.45;
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  textarea {
    flex: 1;
    background: rgba(0,0,0,0.9);
    color: ${COLORS.matrix};
    border: 1px solid ${COLORS.matrixRgba};
    border-radius: 10px;
    padding: 0.75rem;
    font-size: 16px;
    line-height: 1.35;
    resize: vertical;
    min-height: 52px;
    max-height: 160px;
  }

  textarea:focus {
    outline: none;
    border-color: ${COLORS.matrix};
    box-shadow: 0 0 10px ${COLORS.matrixRgbaLight};
  }

  button {
    background: ${COLORS.matrixRgbaFaint};
    border: 1px solid ${COLORS.matrix};
    color: ${COLORS.matrix};
    font-weight: bold;
    border-radius: 10px;
    padding: 0.75rem 1.25rem;
    min-width: 90px;
    height: 52px;
    font-size: 16px;
    transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
  }

  button:hover {
    background: ${COLORS.matrixRgbaMid};
    box-shadow: 0 0 10px ${COLORS.matrixRgbaLight};
    transform: scale(1.02);
  }

  button:active {
    background: ${COLORS.matrixRgbaLight};
    transform: scale(0.97);
  }

  @media (max-width: 640px) {
    .ask-omer-page {
      padding: 4.5rem 0.6rem 0.6rem;
      gap: 0.5rem;
    }

    .terminal-card {
      width: 100%;
      padding: 0.85rem;
      max-height: calc(var(--askme-vh, 1vh) * 100 - 7.4rem);
    }

    .chat-area {
      min-height: 0;
    }

    .input-section {
      flex-direction: column;
      align-items: stretch;
    }

    button {
      width: 100%;
      min-width: 0;
    }

    textarea {
      width: 100%;
    }
  }

  .askme-wrapper .footer {
    width: min(100%, 720px);
  }

    .matrix-bg {
      position: fixed;
      top: 0;
      left: 0;
      z-index: -1 !important;
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
    if (!isMatrixActive) return;

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
      ctx.fillStyle = COLORS.matrix;
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

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
      canvas.style.transition = "opacity 1s ease-out";
      canvas.style.opacity = "0";
      setTimeout(() => {
        canvas.remove();
      }, 1000);
    };
  }, [isMatrixActive]);

  useEffect(() => {
    return () => {
      clearTimeout(autoScrollTimeoutRef.current);
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  const askAI = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isTyping) return;

    const userMsg = { role: "user", content: trimmedInput };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsTyping(true);
    setIsMatrixActive(true);

    try {
      const text = await sendChatMessage(trimmedInput);
      typeEffect(text);
    } catch (err) {
      console.error(err);
      typeEffect("⚠️ Unable to reach AI server.");
    }
  };

  /**
   * Typewriter effect with markdown support
   * @param {string} text - Raw text response from AI
   */
  const typeEffect = (text) => {
    const html = marked.parse(text);

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    let i = 0;
    const aiMsg = { role: "assistant", content: "" };
    setMessages((m) => [...m, aiMsg]);

    typingIntervalRef.current = setInterval(() => {
      i = Math.min(i + 3, html.length);
      const displayed = html.slice(0, i);

      setMessages((m) => {
        const updated = [...m];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          role: "assistant",
          content: displayed,
          isHTML: true,
        };
        return updated;
      });

      if (i >= html.length) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
        setIsTyping(false);
        setIsMatrixActive(false);
      }
    }, 16);
  };

  return (
    <>
      <SimpleSpaceshipCursor />
      <div className="askme-wrapper">
        <div className="ask-omer-page">
          <div className="terminal-card">
            <div className="matrix-title">OMER-AI TERMINAL v2.0</div>

            <div className="chat-area" ref={chatAreaRef}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`message-row ${msg.role === "user" ? "text-blue-400" : "text-green-400"}`}
                >
                  <span className="opacity-70">
                    {msg.role === "user" ? "🧑 YOU" : "🤖 OMER-AI"}:
                  </span>{" "}
                  {msg.isHTML ? (
                    <span
                      className="whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: msg.content }}
                    />
                  ) : (
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                  )}
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
          <Footer profile={profile} />
        </div>
      </div>
    </>
  );
}
