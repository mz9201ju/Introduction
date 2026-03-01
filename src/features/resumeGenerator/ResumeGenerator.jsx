import React, { useState } from "react";
import { profile } from "@features/resume/data/profile.js";
import Footer from "@app/nav/Footer";
import SimpleSpaceshipCursor from "@features/SimpleSpaceshipCursor";
import mammoth from "mammoth/mammoth.browser";
import { jsPDF } from "jspdf";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { generateResumeAndCoverLetter } from "../../services/aiApi";
import { usePageSeo } from "@app/hooks/usePageSeo";
import "./ResumeGenerator.css";

GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

const DOWNLOAD_FORMATS = {
    PDF: "pdf",
    DOC: "doc",
};

function triggerDownload(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
}

function toSafeFilename(baseName) {
    return baseName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function extractTextFromPdf(file) {
    const bytes = await file.arrayBuffer();
    const pdf = await getDocument({ data: bytes }).promise;
    const pageTexts = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(" ");
        pageTexts.push(pageText);
    }

    return pageTexts.join("\n\n").trim();
}

async function extractTextFromWord(file) {
    const bytes = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: bytes });
    return result.value.trim();
}

async function extractTextFromFile(file) {
    const extension = file.name.toLowerCase().split(".").pop();

    if (file.type.startsWith("text/") || extension === "txt") {
        return file.text();
    }

    if (file.type === "application/pdf" || extension === "pdf") {
        return extractTextFromPdf(file);
    }

    if (
        extension === "docx"
        || extension === "doc"
        || file.type === "application/msword"
        || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
        return extractTextFromWord(file);
    }

    throw new Error("Unsupported format");
}

function downloadAsDoc(content, title) {
    const docBody = `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body><h1>${title}</h1><pre>${content.replace(/</g, "&lt;")}</pre></body></html>`;
    const blob = new Blob([docBody], { type: "application/msword" });
    triggerDownload(blob, `${toSafeFilename(title)}.doc`);
}

function downloadAsPdf(content, title) {
    const documentPdf = new jsPDF({ unit: "pt", format: "a4" });
    const marginX = 40;
    const marginTop = 50;
    const maxWidth = 515;
    const lines = documentPdf.splitTextToSize(content, maxWidth);

    documentPdf.setFontSize(16);
    documentPdf.text(title, marginX, 30);
    documentPdf.setFontSize(11);
    documentPdf.text(lines, marginX, marginTop);
    documentPdf.save(`${toSafeFilename(title)}.pdf`);
}

export default function ResumeGenerator() {
    usePageSeo({
        title: "Resume Generator | Omer Zahid",
        description:
            "Use the AI Resume Generator to tailor your resume and cover letter to a job description, then download polished results in PDF or DOC format in minutes.",
    });

    const [resume, setResume] = useState("");
    const [jobDesc, setJobDesc] = useState("");
    const [loading, setLoading] = useState(false);
    const [customResume, setCustomResume] = useState("");
    const [coverLetter, setCoverLetter] = useState("");
    const [fileStatus, setFileStatus] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [downloadFormat, setDownloadFormat] = useState(DOWNLOAD_FORMATS.PDF);

    const clearMessages = () => {
        setFileStatus("");
        setErrorMessage("");
    };

    const handleResumeUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        clearMessages();

        try {
            const extractedText = await extractTextFromFile(file);

            if (!extractedText.trim()) {
                throw new Error("No text extracted");
            }

            setResume(extractedText);
            setFileStatus(`Loaded ${file.name}. You can review or edit before generating.`);
        } catch (error) {
            console.error("Resume upload error:", error);
            setErrorMessage("Could not read this file. Supported uploads: PDF, DOC, DOCX, TXT.");
        } finally {
            event.target.value = "";
        }
    };

    const handleDownload = (content, title) => {
        if (!content.trim()) {
            return;
        }

        if (downloadFormat === DOWNLOAD_FORMATS.DOC) {
            downloadAsDoc(content, title);
            return;
        }

        downloadAsPdf(content, title);
    };

    const handleGenerate = async () => {
        clearMessages();

        if (!resume.trim() || !jobDesc.trim()) {
            setErrorMessage("Please provide both your resume and the job description.");
            return;
        }

        setLoading(true);
        setCustomResume("");
        setCoverLetter("");

        try {
            const result = await generateResumeAndCoverLetter(resume, jobDesc);
            setCustomResume(result.customResume || "⚠️ No resume returned.");
            setCoverLetter(result.coverLetter || "⚠️ No cover letter returned.");
            setFileStatus("Generated updated resume and cover letter.");
        } catch (err) {
            console.error("Error:", err);
            setErrorMessage("Something went wrong. Please try again.");
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
                        <input
                            type="file"
                            className="file-input"
                            accept=".pdf,.doc,.docx,.txt,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleResumeUpload}
                        />
                        <p className="helper-text">Upload PDF, DOC, DOCX, or TXT. Then review/edit the extracted text below.</p>
                        <textarea
                            value={resume}
                            onChange={(event) => setResume(event.target.value)}
                            placeholder="Paste your resume text here..."
                        />
                    </div>

                    <div className="input-block">
                        <h3>Job Description</h3>
                        <textarea
                            value={jobDesc}
                            onChange={(event) => setJobDesc(event.target.value)}
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

                <div className="download-controls">
                    <label htmlFor="download-format">Download format</label>
                    <select
                        id="download-format"
                        value={downloadFormat}
                        onChange={(event) => setDownloadFormat(event.target.value)}
                    >
                        <option value={DOWNLOAD_FORMATS.PDF}>PDF</option>
                        <option value={DOWNLOAD_FORMATS.DOC}>DOC</option>
                    </select>
                </div>

                {fileStatus && <p className="status-message">{fileStatus}</p>}
                {errorMessage && <p className="error-message">{errorMessage}</p>}

                {(customResume || coverLetter) && (
                    <div className="output-section">
                        {customResume && (
                            <div className="output-card">
                                <h2>🎯 Tailored Resume</h2>
                                <pre>{customResume}</pre>
                                <button
                                    type="button"
                                    className="download-btn"
                                    onClick={() => handleDownload(customResume, "Tailored Resume")}
                                >
                                    Download Resume ({downloadFormat.toUpperCase()})
                                </button>
                            </div>
                        )}

                        {coverLetter && (
                            <div className="output-card">
                                <h2>💌 Cover Letter</h2>
                                <pre>{coverLetter}</pre>
                                <button
                                    type="button"
                                    className="download-btn"
                                    onClick={() => handleDownload(coverLetter, "Cover Letter")}
                                >
                                    Download Cover Letter ({downloadFormat.toUpperCase()})
                                </button>
                            </div>
                        )}
                    </div>
                )}
                <Footer profile={profile} />
            </div>
        </>
    );
}
