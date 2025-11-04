import MeetingInvite from "./MeetingInvite";
import ResumeViewer from "./resumeViewer/ResumeViewer";


// 🔹 Shared style (applies to all buttons/links)
const linkStyle = {
    background: "#4285f4 radial-gradient(circle at 50% 50%, #00bfff, #0077ff 70%)",
    fontWeight: 700,
    color: "#fff",
    padding: "10px 2px",
    borderRadius: "10px",
    boxShadow: "0 0 10px #00bfff88, 0 0 30px #0077ff44",
    transition: "all 0.3s ease",
    cursor: "none",
    textDecoration: "none",
};

// 🔹 Hover logic (used by all links)
const handleHover = (e, isEnter) => {
    e.currentTarget.style.boxShadow = isEnter
        ? "0 0 20px #00bfffcc, 0 0 40px #0077ffaa"
        : "0 0 10px #00bfff88, 0 0 30px #0077ff44";
};

// 🔹 Reusable styled link
const StyledLink = ({ href, label, isEmail = false }) => (
    <a
        href={isEmail ? `mailto:${href}` : href}
        target={isEmail ? "_self" : "_blank"}
        rel="noreferrer"
        style={linkStyle}
        onMouseEnter={(e) => handleHover(e, true)}
        onMouseLeave={(e) => handleHover(e, false)}
    >
        {label}
    </a>
);




export default function Hero({ profile }) {
    return (
        <header className="card">
            <div
                style={{
                    display: "flex",
                    gap: 20,
                    alignItems: "center",
                    flexWrap: "wrap",
                }}
            >
                {/* Avatar wrapper with fixed size */}
                <div
                    style={{
                        width: 140,             // <- adjust this number to resize (e.g., 120 / 100)
                        height: 140,
                        borderRadius: 16,       // use "50%" if you want a circle
                        overflow: "hidden",
                        border: "2px solid var(--accent)",
                        boxShadow: "0 8px 24px rgba(0,0,0,.35)",
                        flexShrink: 0,
                        background:
                            "linear-gradient(145deg, rgba(138,180,255,.2), rgba(18,25,54,.6))",
                    }}
                >
                    <div
                        style={{
                            width: 140, height: 140, borderRadius: 16, overflow: "hidden",
                            border: "2px solid var(--accent)", flexShrink: 0,
                            transition: "box-shadow .25s, transform .25s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 30px rgba(138,180,255,.45)")}
                        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.35)")}
                    >
                        {profile.image ? (
                            <img
                                src={profile.image}
                                alt={profile.name}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    objectPosition: "center top",
                                    display: "block",
                                }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    display: "grid",
                                    placeItems: "center",
                                    fontSize: 28,
                                }}
                            >
                                🧑‍🚀
                            </div>
                        )}
                    </div>

                </div>

                {/* Text block */}
                <div>
                    <h1 className="h h1">{profile.name}</h1>
                    <div className="h h2">{profile.title}</div>
                </div>
            </div>

            <div style={{ marginTop: 14, color: "var(--ink)" }}>
                {profile.blurb
                    ?.split(/\n+/) // split on one or more newlines
                    .filter(line => line.trim() !== "") // ignore empty lines
                    .map((line, i) => (
                        <p key={i} style={{ marginBottom: 10, color: "var(--ink)" }}>
                            {line.trim()}
                        </p>
                    ))}
            </div>


            <div
                style={{
                    marginTop: 14,
                    display: "flex",
                    gap: 16,
                    flexWrap: "wrap",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <MeetingInvite />
                <ResumeViewer />
            </div>
        </header>
    );
}