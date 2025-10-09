import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

// resume
import Home from "@resume/pages/Home";
import About from "@resume/pages/About";

// global UI
import SpaceshipCursor from "@shared/components/SpaceshipCursor";
//import BackgroundStars from "@shared/components/BackgroundStars"; // enable this when you want stars coming on resume as well

// game
import PlayGame from "@game/pages/PlayGame";

export default function App() {
  return (
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
    </BrowserRouter>
  );
}
