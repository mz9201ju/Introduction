import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { lazy, Suspense } from "react";

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
  return (
    <>
      <BrowserRouter basename="/Introduction/">
        {/* global effects: render on ALL pages */}
        <SpaceshipCursor />

        <nav
          style={{
            padding: "12px",
            textAlign: "center",
            position: "sticky",
            top: 0,
            zIndex: 1000,
            background: "transparent",
            backdropFilter: "none",
          }}
        >
          {[
            { to: "/", label: "Home" },
            { to: "/about", label: "About" },
            { to: "/darthVader", label: "PlayGame!" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              style={{
                display: "inline-block",
                margin: "0 10px",
                padding: "10px 22px",
                borderRadius: "10px",
                background: "radial-gradient(circle at 30% 30%, #1a1f45, #090b1e)",
                color: "#e0e6ff",
                textDecoration: "none",
                fontWeight: 700,
                letterSpacing: "0.5px",
                border: "1px solid rgba(90,140,255,0.7)",
                cursor: "pointer",
                boxShadow:
                  "0 0 15px rgba(80,150,255,0.7), 0 0 30px rgba(60,120,255,0.4)",
                transition: "all 0.25s ease",
                textShadow: "0 0 8px rgba(150,180,255,0.8)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 25px rgba(100,180,255,1), 0 0 50px rgba(80,150,255,0.8)";
                e.currentTarget.style.textShadow =
                  "0 0 12px rgba(200,220,255,1), 0 0 25px rgba(120,160,255,0.8)";
                e.currentTarget.style.background =
                  "radial-gradient(circle at 30% 30%, #274bff, #0b0f40)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 15px rgba(80,150,255,0.7), 0 0 30px rgba(60,120,255,0.4)";
                e.currentTarget.style.textShadow =
                  "0 0 8px rgba(150,180,255,0.8)";
                e.currentTarget.style.background =
                  "radial-gradient(circle at 30% 30%, #1a1f45, #090b1e)";
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/darthVader" element={<PlayGame />} />
        </Routes>

        <Suspense fallback={null}>
          <SpaceChatWebLLM />
        </Suspense>
      </BrowserRouter>
    </>
  );
}