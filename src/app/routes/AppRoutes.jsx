import { Routes, Route } from "react-router-dom";
import Home from "@resume/pages/Home";
import About from "@resume/pages/About";
import PlayGame from "@game/pages/PlayGame";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/darthVader" element={<PlayGame />} />
            <Route path="*" element={<Home />} />
        </Routes>
    );
}
