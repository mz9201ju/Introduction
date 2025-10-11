import { useNavigate } from "react-router-dom"; // ✅ import navigate hook

export default function About() {
    const navigate = useNavigate(); // ✅ initialize navigate function
    return (
        <div style={{ textAlign: "center", padding: "4rem" }}>
            <section style={{ marginTop: "3rem" }}>
                <h2>About Me 🚀</h2>
                <div
                    style={{
                        marginTop: "1rem",
                        padding: "1rem",
                        background: "rgba(0,0,0,0.6)",
                        borderRadius: "10px",
                        boxShadow: "0 0 20px #00bfff55",
                    }}
                >
                    <p>
                        I attribute all my knowledge, creativity, and success to God! (Allah) — the Creator of this vast universe 🌌.
                        Through His guidance and mercy, I’ve been able to innovate and build digital solutions that simplify lives, optimize time, and reduce costs — all while maintaining clarity, efficiency, and purpose.
                        Every line of code I write is a reflection of gratitude to Allah, my greatest teacher and source of inspiration. 🤍
                    </p>
                </div>
                <h2>🚀 Featured Project</h2>
                <div
                    style={{
                        marginTop: "1rem",
                        padding: "1rem",
                        background: "rgba(0,0,0,0.6)",
                        borderRadius: "10px",
                        boxShadow: "0 0 20px #00bfff55",
                    }}
                >
                    <h3>💈 ELIA Barber Shop</h3>
                    <p>
                        A local Bellevue barber shop website I built to help the business grow its
                        online visibility. Designed with React + Vite + Tailwind and deployed on
                        GitHub Pages. Features online booking and a modern responsive design.
                    </p>

                    {/* Static website preview */}
                    <a
                        href="https://mz9201ju.github.io/ELIA_BarberShop_WebSite"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: "inline-block",
                            borderRadius: "20px 20px 20px 20px",
                            overflow: "auto",
                            boxShadow: "0 0 100px #00bfff88",
                            transition: "transform 0.3s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
                    >
                        <img
                            src="https://iad.microlink.io/8O5GGQwFxbs-x8-2WihIiQNPmb2Ew_tIdWOBxUaVt9ANITv-Mi1vZ-4-raPcOTkjQLeU68J2CV8boU05uJauUA.png"
                            alt="ELIA Barber Shop Preview"
                            style={{
                                width: "200px",
                                height: "100px",
                            }}
                        />
                        <div
                            style={{
                                backgroundColor: "#00bfff",
                                color: "#fff",
                                padding: "10px 20px",
                                fontWeight: 600,
                                textDecoration: "none",
                            }}
                        >
                            🔗 Visit Site
                        </div>
                    </a>
                    <h3>🧠 Tech Stack</h3>
                    <p>React • Vite • Tailwind</p>
                </div>
            </section>
        </div>
    );
}
