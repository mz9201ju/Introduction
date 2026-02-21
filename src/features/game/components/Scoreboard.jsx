export default function Scoreboard({ stats }) {
    const { kills, playerHP, victory, loss, level = 1, killsThisLevel = 0 } = stats;
    const maxLevels = 5;
    const killsPerLevel = 10;
    const isBossLevel = level === maxLevels;

    const hpPct = Math.max(0, Math.min(100, playerHP));
    const hpColor = hpPct > 60 ? "#4ade80" : hpPct > 30 ? "#facc15" : "#f87171";

    return (
        <div
            style={{
                position: "fixed",
                top: 18,
                right: 100,
                zIndex: 20,
                padding: "10px 14px",
                color: "#e8f0ff",
                fontWeight: 700,
                fontSize: 14,
                textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                background: "rgba(0,0,0,0.45)",
                backdropFilter: "blur(6px)",
                borderRadius: 10,
                minWidth: 160,
                lineHeight: 1.7,
            }}
        >
            <div>⚔️ Kills: {kills}</div>
            <div style={{ marginBottom: 2 }}>
                {isBossLevel ? "⚡ BOSS PHASE" : `📶 Level ${level} / ${maxLevels} (${killsThisLevel}/${killsPerLevel})`}
            </div>
            <div style={{ marginBottom: 4 }}>
                ❤️ HP:
                <span style={{ marginLeft: 6, color: hpColor }}>{hpPct}</span>
                <div
                    style={{
                        marginTop: 3,
                        height: 6,
                        borderRadius: 4,
                        background: "rgba(255,255,255,0.15)",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            height: "100%",
                            width: `${hpPct}%`,
                            background: hpColor,
                            borderRadius: 4,
                            transition: "width 0.2s ease, background 0.3s ease",
                        }}
                    />
                </div>
            </div>
            <div>
                {victory && "🏆 Victory!"}
                {loss && "💀 Game Over"}
            </div>
        </div>
    );
}
