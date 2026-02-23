// src/components/ResumeViewer.jsx
import { memo } from "react";
import "./ResumeViewer.css";
import resume from "/resume.pdf";

const setDownloadHover = (event, entering) => {
    event.currentTarget.style.boxShadow = entering
        ? "0 0 20px #8ab4ffcc, 0 0 40px #627bffaa"
        : "0 0 10px #8ab4ff88, 0 0 30px #627bff44";
};

function ResumeViewer() {
    return (
        <div className="resume-viewer-container">
            <a
                href={resume}
                download="Omer_Zahid_Resume.pdf"
                className="download-resume-btn"
                onMouseEnter={(event) => setDownloadHover(event, true)}
                onMouseLeave={(event) => setDownloadHover(event, false)}
            >
                📄 Download Resume
            </a>
        </div>
    );
}

export default memo(ResumeViewer);
