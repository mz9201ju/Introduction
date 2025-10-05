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

            <p style={{ marginTop: 14, color: "var(--ink)" }}>{profile.blurb}</p>
            <div className="badges" style={{ marginTop: 12 }}>
                {profile.skills.slice(0, 8).map((s) => (
                    <span className="badge" key={s}>{s}</span>
                ))}
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 16 }}>
                <a href={`mailto:${profile.links.email}`} style={{ color: "var(--accent)" }}>Email</a>
                <a href={profile.links.linkedin} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>LinkedIn</a>
                <a href={profile.links.github} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>GitHub</a>
            </div>
        </header>
    );
}