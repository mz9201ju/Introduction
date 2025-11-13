import SimpleSpaceshipCursor from "@features/SimpleSpaceshipCursor";
import { profile } from "@resume/data/profile";   // if you moved profile.js under resume/data
import Footer from "@app/nav/Footer"

export default function About() {
    return (
        <div style={{ textAlign: "center", padding: "4rem" }}>
            {/* Simple Space Cursor */}
            <SimpleSpaceshipCursor />
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
                <h2>🚀 Featured Project For Local Business</h2>
                <div
                    style={{
                        marginTop: "1rem",
                        padding: "1rem",
                        background: "rgba(0,0,0,0.6)",
                        borderRadius: "10px",
                        boxShadow: "0 0 20px #00bfff55",
                    }}
                >
                    <h3>🚘 NYC LUX (Premium Ride Service)</h3>
                    <p>
                        “Experience New York in Motion — Redefined.” White-glove chauffeurs. An immaculate fleet. Tailored hospitality.
                        From Wall Street to Fifth Avenue, your journey begins the moment we open the door — and continues with every mile of effortless luxury.
                    </p>

                    {/* Static website preview */}
                    <a
                        href="https://mz9201ju.github.io/khuram-limo-service/"
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
                            src="https://api.microlink.io/?url=https://mz9201ju.github.io/khuram-limo-service/&screenshot=true&type=png&meta=false&embed=screenshot.url"
                            alt="Deeba's Day Care"
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
                    <p>React • Vite • Tailwind • Cloudflare</p>
                </div>
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
                            src="https://api.microlink.io/?url=https://mz9201ju.github.io/ELIA_BarberShop_WebSite/&screenshot=true&type=png&meta=false&embed=screenshot.url"
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
                <div
                    style={{
                        marginTop: "1rem",
                        padding: "1rem",
                        background: "rgba(0,0,0,0.6)",
                        borderRadius: "10px",
                        boxShadow: "0 0 20px #00bfff55",
                    }}
                >
                    <h3>✈️ Bell Aviation / ROMISOFT LLC</h3>
                    <p>
                        Bell Aviation Services has a rich history in Aircraft Maintenance, Repair, Operations, Worldwide Recovery, Avionics,
                        Fleet Maintenance & Logistics. Building on foundational services, the software arm of this business
                        is ROMISOFT supporting both commercial and military aircraft mixed fleet operations.
                        We also offer individualized FAA part 61 training for High Performance,
                        Complex, and Tail Wheel endorsements using our own classic airplanes.
                        We are a small business and veteran owned.
                    </p>

                    {/* Static website preview */}
                    <a
                        href="https://mz9201ju.github.io/bell-aviation-romisoft/"
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
                            src="https://api.microlink.io/?url=https://mz9201ju.github.io/bell-aviation-romisoft/&screenshot=true&type=png&meta=false&embed=screenshot.url"
                            alt="Bell Aviation / ROMISOFT LLC"
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
                <div
                    style={{
                        marginTop: "1rem",
                        padding: "1rem",
                        background: "rgba(0,0,0,0.6)",
                        borderRadius: "10px",
                        boxShadow: "0 0 20px #00bfff55",
                    }}
                >
                    <h3>👶 Deeba's Day Care</h3>
                    <p>
                        It can be not easy adjusting your work schedule around the school hours
                        of your children.At Deeba's Daycare, we offer exceptional home day care services,
                        so the little ones are properly taken care of during your busy day.Our extended hours
                        accommodate any situation, allowing parents with early morning shifts to commute faster
                        or those with long nights to finish paperwork related to work.
                    </p>

                    {/* Static website preview */}
                    <a
                        href="https://mz9201ju.github.io/deebasDayCare/"
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
                            src="https://api.microlink.io/?url=https://mz9201ju.github.io/deebasDayCare/&screenshot=true&type=png&meta=false&embed=screenshot.url"
                            alt="Deeba's Day Care"
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
                    <p>React • Vite • Tailwind • Cloudflare</p>
                </div>
            </section>
            <Footer profile={profile} />
        </div>
    );
}
