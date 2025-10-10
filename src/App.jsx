import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Suspense, lazy, useState } from "react";

// resume
import Home from "@resume/pages/Home";
import About from "@resume/pages/About";

// global UI
import SpaceshipCursor from "@shared/components/SpaceshipCursor";
//import BackgroundStars from "@shared/components/BackgroundStars"; // enable this when you want stars coming on resume as well

// game
import PlayGame from "@game/pages/PlayGame";

// AI Chat Bot
const SpaceChatWebLLM = lazy(() => import("@shared/components/SpaceChatWebLLM"));

export default function App() {
  const [open, setOpen] = useState(false);
  const styles = {
    fab: {
        position: "fixed", right: 20, bottom: 60, zIndex: 9999,
        width: 56, height: 56, borderRadius: 999,
        border: "1px solid rgba(120,200,255,0.5)",
        background: "linear-gradient(145deg,#0a0f1f,#0a0a14)",
        color: "#d7eaff", fontSize: 22, cursor: "pointer",
        boxShadow: "0 0 18px rgba(80,160,255,0.35)"
    }
  }
  return (
    <>
      <BrowserRouter basename="/Introduction/">
        {/* global effects: render on ALL pages */}
        <SpaceshipCursor />

        <nav style={{ padding: "12px", textAlign: "center", position: "sticky", top: 0, zIndex: 1000 }}>
          <Link to="/" style={{ margin: "0 12px" }}>Home</Link>
          <Link to="/about" style={{ margin: "0 12px" }}>About</Link>
          <Link to="/darthVader" style={{ margin: "0 12px" }}>PlayGame!</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/darthVader" element={<PlayGame />} />
        </Routes>

        <button
          onClick={() => setOpen(v => !v)}
          style={styles.fab}
          aria-label="Open AI chat"
        >
          {open ? "✖" : "🛰️"}
        </button>

        {open && (
          <Suspense fallback={null}>
            <SpaceChatWebLLM />
          </Suspense>
        )}
      </BrowserRouter>
    </>
  );
}
