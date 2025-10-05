import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import SpaceshipCursor from "./components/SpaceshipCursor";
import Starfield from "./components/Starfield";

export default function App() {
  return (
    <BrowserRouter basename="/Introduction/">{/* https://mz9201ju.github.io/Introduction/# */}
      {/* global effects: render on ALL pages */}
      <SpaceshipCursor />
      <Starfield />
      
      <nav style={{ padding: "12px", textAlign: "center", position: "sticky", top: 0, zIndex: 1000 }}>
        <Link to="/" style={{ margin: "0 12px" }}>Home</Link>
        <Link to="/about" style={{ margin: "0 12px" }}>About</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
