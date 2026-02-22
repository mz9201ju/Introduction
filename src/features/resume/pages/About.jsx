import { useState } from "react";
import SimpleSpaceshipCursor from "@features/SimpleSpaceshipCursor";
import { profile } from "@resume/data/profile";   // if you moved profile.js under resume/data
import Footer from "@app/nav/Footer"
import "./About.css";

const PAGE_STYLE = { textAlign: "center", padding: "4rem" };
const SECTION_STYLE = { marginTop: "3rem" };
const CARD_STYLE = {
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

const PROJECTS = [
    {
        title: "🚘 NYC LUX (Premium Ride Service)",
        description:
            "Experience New York in Motion — Redefined.” White-glove chauffeurs. An immaculate fleet. Tailored hospitality. From Wall Street to Fifth Avenue, your journey begins the moment we open the door — and continues with every mile of effortless luxury.",
        href: "https://mz9201ju.github.io/khuram-limo-service/",
        imgSrc:
            "https://api.microlink.io/?url=https://mz9201ju.github.io/khuram-limo-service/&screenshot=true&type=png&meta=false&embed=screenshot.url",
        imgAlt: "NYC LUX preview",
        tech: "React • Vite • Tailwind • Cloudflare",
    },
    {
        title: "Tikka Masala (Bellevue, WA)",
        description: "Authentic Halal Indian & Pakistani cuisine Conveniently located in Bellevue WA",
        href: "https://mz9201ju.github.io/tikka-masala-v2/",
        imgSrc:
            "https://api.microlink.io/?url=https://mz9201ju.github.io/tikka-masala-v2/&screenshot=true&type=png&meta=false&embed=screenshot.url",
        imgAlt: "Tikka Masala preview",
        tech: "React • Vite • Cloudflare",
    },
    {
        title: "OZ Studios (Premium and Enterprise Websites with full SEO)",
        description:
            "From greenfield builds to complex refactors — architected, implemented, and shipped end-to-end.",
        href: "https://mz9201ju.github.io/oz-it-studios/",
        imgSrc:
            "https://api.microlink.io/?url=https://mz9201ju.github.io/oz-it-studios/&screenshot=true&type=png&meta=false&embed=screenshot.url",
        imgAlt: "OZ Studios preview",
        tech: "React • Vite • Cloudflare",
    },
    {
        title: "⚡ SkyLight | KSA",
        description:
            "Founded in 2016 in Jeddah, Skylight began as a visionary enterprise with a simple goal: to revolutionize the industry through cutting-edge solutions and customer-centric services.",
        href: "https://mz9201ju.github.io/skylight-ksa/",
        imgSrc:
            "https://api.microlink.io/?url=https://mz9201ju.github.io/skylight-ksa/&screenshot=true&type=png&meta=false&embed=screenshot.url",
        imgAlt: "SkyLight KSA preview",
        tech: "React • Vite • Cloudflare",
    },
    {
        title: "💈 ELIA Barber Shop",
        description:
            "A local Bellevue barber shop website I built to help the business grow its online visibility. Designed with React + Vite + Tailwind and deployed on GitHub Pages. Features online booking and a modern responsive design.",
        href: "https://mz9201ju.github.io/ELIA_BarberShop_WebSite",
        imgSrc:
            "https://api.microlink.io/?url=https://mz9201ju.github.io/ELIA_BarberShop_WebSite/&screenshot=true&type=png&meta=false&embed=screenshot.url",
        imgAlt: "ELIA Barber Shop preview",
        tech: "React • Vite • Tailwind",
    },
    {
        title: "✈️ Bell Aviation / ROMISOFT LLC",
        description:
            "Bell Aviation Services has a rich history in Aircraft Maintenance, Repair, Operations, Worldwide Recovery, Avionics, Fleet Maintenance & Logistics. Building on foundational services, the software arm of this business is ROMISOFT supporting both commercial and military aircraft mixed fleet operations. We also offer individualized FAA part 61 training for High Performance, Complex, and Tail Wheel endorsements using our own classic airplanes. We are a small business and veteran owned.",
        href: "https://mz9201ju.github.io/bell-aviation-romisoft/",
        imgSrc:
            "https://api.microlink.io/?url=https://mz9201ju.github.io/bell-aviation-romisoft/&screenshot=true&type=png&meta=false&embed=screenshot.url",
        imgAlt: "Bell Aviation / ROMISOFT LLC preview",
        tech: "React • Vite • Tailwind",
    },
    {
        title: "👶 Deeba's Day Care",
        description:
            "At our childcare center, we believe in creating a nurturing and enriching environment where every child is valued, respected, and supported in their journey of growth and development. Our philosophy is rooted in the understanding that each child is unique, with their own set of strengths, interests, and learning styles.",
        href: "https://mz9201ju.github.io/deebasDayCare/",
        imgSrc:
            "https://api.microlink.io/?url=https://mz9201ju.github.io/deebasDayCare/&screenshot=true&type=png&meta=false&embed=screenshot.url",
        imgAlt: "Deeba's Day Care preview",
        tech: "React • Vite • Tailwind • Cloudflare",
    },
    {
        title: "👶 Rashida Little Champs DayCare",
        description:
            "Little Champs DayCare is a Day Care Center & Head Start Center located in Bellevue, WA that services all of Bellevue & the surrounding areas. We offer Child Care, Toddler Care, Home Day Care, Day Care Services, Child Care Services, Child Education, Child Care Development, Well Mannered Services, Family Day Care, Home Child Care, 24/7 Day Care Service & more. Our staff are highly trained to care for and help develop your kids' creative, physical, and analytical skills. If you are looking for a Fun Play Day Care, Preschool or After School Program, then Little Champs DayCare is the smart choice. We will treat your children as if they are our own. Call us today to inquire about our programs and to schedule a tour of our facility.",
        href: "https://mz9201ju.github.io/RashidaLittleChampsDayCare/",
        imgSrc:
            "https://api.microlink.io/?url=https://mz9201ju.github.io/RashidaLittleChampsDayCare/&screenshot=true&type=png&meta=false&embed=screenshot.url",
        imgAlt: "Deeba's Day Care preview",
        tech: "React • Vite • Tailwind • Cloudflare",
    },
];

function ProjectCard({ title, description, href, imgSrc, imgAlt, tech }) {
    const [hasError, setHasError] = useState(false);

    return (
        <div style={CARD_STYLE}>
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
    return (
        <div style={PAGE_STYLE}>
            <SimpleSpaceshipCursor />
            <section style={SECTION_STYLE}>
                <h2>About Me</h2>
                <div style={CARD_STYLE}>
                    <p>
                        I attribute all my knowledge, creativity, and success to God! (Allah) — the Creator of this vast universe 🌌.
                        Through His guidance and mercy, I’ve been able to innovate and build digital solutions that simplify lives, optimize time, and reduce costs — all while maintaining clarity, efficiency, and purpose.
                        Every line of code I write is a reflection of gratitude to Allah, my greatest teacher and source of inspiration. 🤍
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
