import { memo } from "react";

const BADGES_STYLE = { marginTop: 10 };

function Skills({ skills }) {
    return (
        <section className="card">
            <h2 className="h h2">Core Skills</h2>
            <div className="badges" style={BADGES_STYLE}>
                {skills.map((s) => (
                    <span className="badge" key={s}>{s}</span>
                ))}
            </div>
        </section>
    );
}

export default memo(Skills);