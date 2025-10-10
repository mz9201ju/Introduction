// App.jsx
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { lazy, Suspense, useMemo, useRef, createRef } from "react"; // ← useRef, createRef added

// 🔹 NEW: transition + location imports
import { useLocation } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";

// resume
import Home from "@resume/pages/Home";
import About from "@resume/pages/About";

// global UI
import SpaceshipCursor from "@shared/components/SpaceshipCursor";
// import BackgroundStars from "@shared/components/BackgroundStars"; // enable this when you want stars coming on resume as well

// game
import PlayGame from "@game/pages/PlayGame";

// AI Chat Bot
const SpaceChatWebLLM = lazy(() => import("@shared/components/SpaceChatWebLLM"));

export default function App() {
  // 🔹 centralize button styling so it’s easy to tweak
  const baseBtnStyle = useMemo(
    () => ({
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
      // default (inactive) — subtle glow
      background: "radial-gradient(circle at 30% 30%, #1a1f45, #090b1e)",
      boxShadow: "0 0 15px rgba(80,150,255,0.7), 0 0 30px rgba(60,120,255,0.4)",
      textShadow: "0 0 8px rgba(150,180,255,0.8)",
    }),
    []
  );

  // 🔹 active style variant for NavLink
  const activeBtnStyle = {
    // brighter / more neon when active
    background: "radial-gradient(circle at 30% 30%, #274bff, #0b0f40)",
    boxShadow: "0 0 25px rgba(100,180,255,1), 0 0 50px rgba(80,150,255,0.8)",
    textShadow: "0 0 12px rgba(200,220,255,1), 0 0 25px rgba(120,160,255,0.8)",
  };

  return (
    <>
      <BrowserRouter basename="/Introduction/">
        {/* 🔹 slide CSS here to keep files minimal */}
        <style>{`
          .route-viewport { position: relative; overflow: hidden; width: 100vw; min-height: 100vh; }
          .slide-enter { transform: translateX(100%); opacity: 0.85; }
          .slide-enter-active { transform: translateX(0%); opacity: 1; transition: transform 600ms ease-in-out, opacity 400ms ease; }
          .slide-exit { transform: translateX(0%); opacity: 1; }
          .slide-exit-active { transform: translateX(-100%); opacity: 0.85; transition: transform 600ms ease-in-out, opacity 400ms ease; }
          .route-slot { position: absolute; inset: 0; width: 100%; height: 100%; }
        `}</style>

        {/* global effects: render on ALL pages */}
        <SpaceshipCursor />

        {/* NAV — transparent, glowing buttons */}
        <nav
          style={{
            padding: "12px",
            textAlign: "center",
            position: "sticky",
            top: 0,
            zIndex: 1000,
            background: "transparent", // no black background
            backdropFilter: "none", // remove blur overlay
          }}
        >
          {[
            { to: "/", label: "Home" },
            { to: "/about", label: "About" },
            { to: "/darthVader", label: "PlayGame!" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              // NavLink lets us style based on active route
              style={({ isActive }) => ({
                ...baseBtnStyle,
                ...(isActive ? activeBtnStyle : null),
              })}
              onMouseEnter={(e) => {
                // gentle hover pop (keeps active brighter)
                e.currentTarget.style.transform = "translateY(-2px)";
                if (!e.currentTarget.classList.contains("active")) {
                  e.currentTarget.style.boxShadow =
                    "0 0 20px rgba(90,160,255,0.9), 0 0 40px rgba(70,130,255,0.6)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                // reset to either active or base glow
                const isActive =
                  e.currentTarget.getAttribute("aria-current") === "page";
                Object.assign(
                  e.currentTarget.style,
                  isActive ? activeBtnStyle : baseBtnStyle
                );
              }}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* 🔹 keep transitions inside Router via child */}
        <AnimatedRoutes />

        {/* Chat must be inside Suspense to avoid blank app during lazy load */}
        <Suspense fallback={null}>
          <SpaceChatWebLLM />
        </Suspense>
      </BrowserRouter>
    </>
  );
}

/* 🔹 Handles slide transitions with stable nodeRefs per route */
function AnimatedRoutes() {
  const location = useLocation();

  // ✅ Each pathname gets its own ref so CSSTransition never loses the DOM node
  const nodeRefs = useRef(new Map());
  const getNodeRef = (key) => {
    if (!nodeRefs.current.has(key)) nodeRefs.current.set(key, createRef());
    return nodeRefs.current.get(key);
  };

  const key = location.pathname;
  const nodeRef = getNodeRef(key);

  return (
    <div className="route-viewport">
      <TransitionGroup component={null}>
        <CSSTransition
          key={key}
          nodeRef={nodeRef}     // ✅ critical fix
          classNames="slide"
          timeout={600}
          unmountOnExit
        >
          <div ref={nodeRef} className="route-slot">
            {/* ROUTES — keep your pages as-is */}
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/darthVader" element={<PlayGame />} />
              {/* Optional: catch-all → home (nice on GH Pages) */}
              <Route path="*" element={<Home />} />
            </Routes>
          </div>
        </CSSTransition>
      </TransitionGroup>
    </div>
  );
}
