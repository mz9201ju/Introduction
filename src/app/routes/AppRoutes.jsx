import { Routes, Route } from "react-router-dom";
import Home from "@resume/pages/Home";
import About from "@resume/pages/About";
import PlayGame from "@game/pages/PlayGame";
import AskMe from "../../features/askme/AskMe"
import ResumeGenerator from "../../features/resumeGenerator/ResumeGenerator"

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/darthVader" element={<PlayGame />} />
            <Route path="/ask-me" element={<AskMe />} />
            <Route path="/resume-generator" element={<ResumeGenerator />} />
            <Route path="*" element={<Home />} />
        </Routes>
    );
}
