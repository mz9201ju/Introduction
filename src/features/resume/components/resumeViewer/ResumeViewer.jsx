// src/components/ResumeViewer.jsx
import "./ResumeViewer.css";
import resume from "/resume.pdf";

export default function ResumeViewer() {
    return (
        <div className="resume-viewer-container">
            <a
                href={resume}
                download="Omer_Zahid_Resume.pdf"
                className="download-resume-btn"
                onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                    "0 0 20px #8ab4ffcc, 0 0 40px #627bffaa")
                }
                onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                    "0 0 10px #8ab4ff88, 0 0 30px #627bff44")
                }
            >
                📄 Download Resume
            </a>
        </div>
    );
}
