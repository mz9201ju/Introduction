import { useRef, useState } from "react";
import SimpleSpaceshipCursor from "@features/SimpleSpaceshipCursor";
import { profile } from "@resume/data/profile";
import Footer from "@app/nav/Footer";
import { COLORS } from "../../theme";
import { sendChatMessage } from "../../services/aiApi";
import { useAskMeAutoScroll } from "./hooks/useAskMeAutoScroll";
import { useAskMeFullscreen } from "./hooks/useAskMeFullscreen";
import { useAskMeMatrixBackground } from "./hooks/useAskMeMatrixBackground";
import { useAskMePageSetup } from "./hooks/useAskMePageSetup";
import { useAskMeTypewriter } from "./hooks/useAskMeTypewriter";
import "./AskMe.desktop.css";
import "./AskMe.mobile.css";

const ASKME_THEME_VARS = {
  "--askme-matrix": COLORS.matrix,
  "--askme-matrix-rgba": COLORS.matrixRgba,
  "--askme-matrix-rgba-light": COLORS.matrixRgbaLight,
  "--askme-matrix-rgba-faint": COLORS.matrixRgbaFaint,
  "--askme-matrix-rgba-mid": COLORS.matrixRgbaMid,
};

export default function AskMe() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isMatrixActive, setIsMatrixActive] = useState(false);

  const endRef = useRef(null);
  const wrapperRef = useRef(null);
  const chatAreaRef = useRef(null);
  useAskMePageSetup();
  useAskMeAutoScroll({ chatAreaRef, messages, isTyping });
  useAskMeMatrixBackground({
    isMatrixActive,
    matrixColor: COLORS.matrix,
    containerRef: wrapperRef,
  });

  const { isFullscreen, toggleFullscreen } = useAskMeFullscreen(wrapperRef);
  const startTypewriter = useAskMeTypewriter({
    setMessages,
    setIsTyping,
    setIsMatrixActive,
  });

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
      startTypewriter(text);
    } catch (err) {
      console.error(err);
      startTypewriter("⚠️ Unable to reach AI server.");
    }
  };

  return (
    <>
      <SimpleSpaceshipCursor />
      <div
        ref={wrapperRef}
        className={`askme-wrapper ${isFullscreen ? "is-fullscreen" : ""}`}
        style={ASKME_THEME_VARS}
      >
        <div className="ask-omer-page">
          <div className="terminal-card">
            <div className="terminal-header">
              <div className="matrix-title">OMER-AI TERMINAL v2.0</div>
              <button
                className="fullscreen-toggle"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                <span className="fullscreen-icon">{isFullscreen ? "✕" : "⛶"}</span>
                <span className="fullscreen-label">{isFullscreen ? "Exit" : "Fullscreen"}</span>
              </button>
            </div>

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
                className="askme-input"
                aria-label="Ask Omer AI chat input"
                placeholder="Type your question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), askAI())}
              />
              <button className="askme-button" onClick={askAI}>Send</button>
            </div>
          </div>
          <Footer profile={profile} />
        </div>
      </div>
    </>
  );
}
