export default function Scoreboard({ kills }) {
    return (
        <>
            <div
                style={{
                    position: "fixed",
                    top: 12,
                    right: 12,
                    zIndex: 20,
                    padding: "8px 12px",
                    background: "rgba(0,0,0,0.55)",
                    color: "#e8f0ff",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 8,
                    fontWeight: 700,
                }}
            >
                Kills: {kills}
            </div>
        </>
    );
}
