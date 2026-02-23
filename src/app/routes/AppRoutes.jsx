import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "@resume/pages/Home";

const About = lazy(() => import("@resume/pages/About"));
const PlayGame = lazy(() => import("@game/pages/PlayGame"));
const AskMe = lazy(() => import("../../features/askme/AskMe"));
const ResumeGenerator = lazy(() =>
    import("../../features/resumeGenerator/ResumeGenerator"),
);

export default function AppRoutes() {
    return (
        <Suspense fallback={null}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/darthVader" element={<PlayGame />} />
                <Route path="/ask-me" element={<AskMe />} />
                <Route path="/resume-generator" element={<ResumeGenerator />} />
                <Route path="*" element={<Home />} />
            </Routes>
        </Suspense>
    );
}
