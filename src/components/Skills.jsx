export default function Skills({ skills }) {
    return (
        <section className="card">
            <h2 className="h h2">Core Skills</h2>
            <div className="badges" style={{ marginTop: 10 }}>
                {skills.map((s) => (
                    <span className="badge" key={s}>{s}</span>
                ))}
            </div>
        </section>
    );
}