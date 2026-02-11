import React, { useState } from "react";
import { profile } from "@features/resume/data/profile.js"
import Footer from "@app/nav/Footer";
import SimpleSpaceshipCursor from "@features/SimpleSpaceshipCursor";
import { generateResumeAndCoverLetter } from "../../services/aiApi";
import "./ResumeGenerator.css";

export default function ResumeGenerator() {
    const [resume, setResume] = useState("");
    const [jobDesc, setJobDesc] = useState("");
    const [loading, setLoading] = useState(false);
    const [customResume, setCustomResume] = useState("");
    const [coverLetter, setCoverLetter] = useState("");

    const handleGenerate = async () => {
        if (!resume.trim() || !jobDesc.trim()) {
            alert("Please provide both your resume and the job description.");
            return;
        }

        setLoading(true);
        setCustomResume("");
        setCoverLetter("");

        try {
            const result = await generateResumeAndCoverLetter(resume, jobDesc);
            setCustomResume(result.customResume || "⚠️ No resume returned.");
            setCoverLetter(result.coverLetter || "⚠️ No cover letter returned.");
        } catch (err) {
            console.error("Error:", err);
            alert("Something went wrong. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <SimpleSpaceshipCursor />
            <div className="resume-generator">
                <h1 className="page-title">🧩 AI Resume & Cover Letter Generator</h1>

                <div className="input-section">
                    <div className="input-block">
                        <h3>Your Resume</h3>
                        <textarea
                            value={resume}
                            onChange={(e) => setResume(e.target.value)}
                            placeholder="Paste your resume text here..."
                        />
                    </div>

                    <div className="input-block">
                        <h3>Job Description</h3>
                        <textarea
                            value={jobDesc}
                            onChange={(e) => setJobDesc(e.target.value)}
                            placeholder="Paste the job description here..."
                        />
                    </div>
                </div>

                <button
                    className="generate-btn"
                    onClick={handleGenerate}
                    disabled={loading}
                >
                    {loading ? "⏳ Generating..." : "Generate Custom Resume & Cover Letter"}
                </button>

                {(customResume || coverLetter) && (
                    <div className="output-section">
                        {customResume && (
                            <div className="output-card">
                                <h2>🎯 Tailored Resume</h2>
                                <pre>{customResume}</pre>
                            </div>
                        )}

                        {coverLetter && (
                            <div className="output-card">
                                <h2>💌 Cover Letter</h2>
                                <pre>{coverLetter}</pre>
                            </div>
                        )}
                    </div>
                )}
                <Footer profile={profile} />
            </div>
        </>
    );
}
