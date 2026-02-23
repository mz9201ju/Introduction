import { memo } from "react";

const ROLE_CARD_STYLE = { marginBottom: 12 };
const ROLE_HEADER_STYLE = {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
};
const ROLE_NAME_STYLE = { color: "var(--muted)" };

const Role = memo(function Role({ item }) {
    return (
        <div className="card" style={ROLE_CARD_STYLE}>
            <div className="h h3">{item.time}</div>
            <div style={ROLE_HEADER_STYLE}>
                <strong>{item.company}</strong>
                <span style={ROLE_NAME_STYLE}>{item.role}</span>
            </div>
            <ul className="clean">
                {item.bullets.map((bullet) => (
                    <li key={bullet}>• {bullet}</li>
                ))}
            </ul>
        </div>
    );
});


function Experience({ profile }) {
    return (
        <section>
            <h2 className="h h2">Experience</h2>
            {profile.experience.map((role) => (
                <Role key={`${role.company}-${role.time}`} item={role} />
            ))}
        </section>
    );
}

export default memo(Experience);