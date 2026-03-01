import { useState } from "react";
import SimpleSpaceshipCursor from "@features/SimpleSpaceshipCursor";
import { profile } from "@resume/data/profile";
import { PROJECTS } from "@resume/data/projects";
import Footer from "@app/nav/Footer";
import CardHoverBackground from "@resume/components/CardHoverBackground";
import { useCardHover } from "@resume/hooks/useCardHover";
import { usePageSeo } from "@app/hooks/usePageSeo";
import "./About.css";

const PAGE_STYLE = { textAlign: "center", padding: "4rem" };
const SECTION_STYLE = { marginTop: "3rem" };
const CARD_STYLE = {
    position: "relative",
    overflow: "clip",
    marginTop: "1rem",
    padding: "1rem",
    background: "rgba(0,0,0,0.6)",
    borderRadius: "10px",
    boxShadow: "0 0 20px #00bfff55",
};
const PREVIEW_IMAGE_STYLE = { width: "200px", height: "100px" };
const PREVIEW_CTA_STYLE = {
    backgroundColor: "#00bfff",
    color: "#fff",
    padding: "10px 20px",
    fontWeight: 600,
    textDecoration: "none",
};

function ProjectCard({ title, description, href, imgSrc, imgAlt, tech, animKey }) {
    const [hasError, setHasError] = useState(false);
    const { isHovered, handleMouseEnter, handleMouseLeave, handleFocus, handleBlur } = useCardHover();

    return (
        <div
            style={CARD_STYLE}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
        >
            <CardHoverBackground animKey={animKey} isActive={isHovered} />
            <h3>{title}</h3>
            <p>{description}</p>
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="about-preview-link"
            >
                {hasError ? (
                    <div className="about-preview-fallback">Preview unavailable</div>
                ) : (
                    <img
                        src={imgSrc}
                        alt={imgAlt}
                        className="about-preview-image"
                        style={PREVIEW_IMAGE_STYLE}
                        loading="lazy"
                        decoding="async"
                        onError={() => setHasError(true)}
                    />
                )}
                <div style={PREVIEW_CTA_STYLE}>🔗 Visit Site</div>
            </a>
            <h3>🧠 Tech Stack</h3>
            <p>{tech}</p>
        </div>
    );
}

export default function About() {
    usePageSeo({
        title: "About | Omer Zahid",
        description:
            "Discover Omer Zahid’s background, engineering mindset, and featured projects for local businesses, including practical solutions built with modern web technologies.",
    });

    return (
        <div style={PAGE_STYLE}>
            <SimpleSpaceshipCursor />
            <section style={SECTION_STYLE}>
                <h2>About Me</h2>
                <div style={CARD_STYLE}>
                    <p>
                        I credit Allah for the knowledge, creativity, and progress in my journey 🌌.
                        With His guidance and mercy, I build digital solutions that make everyday work simpler, faster, and more cost-effective.
                        My work is an expression of gratitude to Allah, who continues to inspire and guide me. 🤍
                    </p>
                </div>
                <h2>🚀 Featured Project For Local Businesses</h2>
                {PROJECTS.map((project) => (
                    <ProjectCard key={project.title} {...project} />
                ))}
            </section>
            <Footer profile={profile} />
        </div>
    );
}
