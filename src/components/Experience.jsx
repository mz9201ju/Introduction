function Role({ item }) {
    return (
        <div className="card" style={{ marginBottom: 12 }}>
            <div className="h h3">{item.time}</div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <strong>{item.company}</strong>
                <span style={{ color: "var(--muted)" }}>{item.role}</span>
            </div>
            <ul className="clean">
                {item.bullets.map((b, i) => (
                    <li key={i}>• {b}</li>
                ))}
            </ul>
        </div>
    );
}


export default function Experience({ profile }) {
    return (
        <section>
            <h2 className="h h2">Experience</h2>
            {profile.experience.map((e, i) => (
                <Role key={i} item={e} />
            ))}
        </section>
    );
}