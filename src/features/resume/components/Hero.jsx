import { memo, useMemo } from "react";
import MeetingInvite from "./MeetingInvite";
import ResumeViewer from "./resumeViewer/ResumeViewer";

const HEADER_ROW_STYLE = {
    display: "flex",
    gap: 20,
    alignItems: "center",
    flexWrap: "wrap",
};

const AVATAR_WRAP_STYLE = {
    width: 140,
    height: 140,
    borderRadius: 16,
    overflow: "hidden",
    border: "2px solid var(--accent)",
    boxShadow: "0 8px 24px rgba(0,0,0,.35)",
    flexShrink: 0,
    background: "linear-gradient(145deg, rgba(138,180,255,.2), rgba(18,25,54,.6))",
};

const BLURB_WRAP_STYLE = { marginTop: 14, color: "var(--ink)" };
const BLURB_LINE_STYLE = { marginBottom: 10, color: "var(--ink)" };
const CTA_ROW_STYLE = {
    marginTop: 14,
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
};

function Hero({ profile }) {
    const blurbLines = useMemo(
        () =>
            profile.blurb
                ?.split(/\n+/)
                .filter((line) => line.trim() !== "")
                .map((line) => line.trim()) ?? [],
        [profile.blurb],
    );

    return (
        <header className="card">
            <div style={HEADER_ROW_STYLE}>
                <div style={AVATAR_WRAP_STYLE}>
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
                <div>
                    <h1 className="h h1">{profile.name}</h1>
                    <div className="h h2">{profile.title}</div>
                </div>
            </div>

            <div style={BLURB_WRAP_STYLE}>
                {blurbLines.map((line) => (
                    <p key={line} style={BLURB_LINE_STYLE}>
                        {line}
                    </p>
                ))}
            </div>

            <div style={CTA_ROW_STYLE}>
                <MeetingInvite />
                <ResumeViewer />
            </div>
        </header>
    );
}

export default memo(Hero);