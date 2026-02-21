export default function Scoreboard({ stats }) {
    const { kills, playerHP, victory, loss, level = 1, killsThisLevel = 0, bossHP = null, bossMaxHp = null } = stats;
    const maxLevels = 5;
    const killsPerLevel = 10;
    const isBossLevel = level === maxLevels;
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

    const hpPct = Math.max(0, Math.min(100, playerHP));
    const hpColor = hpPct > 60 ? "#4ade80" : hpPct > 30 ? "#facc15" : "#f87171";

    const bossHpPct = bossMaxHp > 0 ? Math.max(0, Math.min(100, (bossHP / bossMaxHp) * 100)) : 0;
    const bossHpColor = bossHpPct > 60 ? "#f87171" : bossHpPct > 30 ? "#fb923c" : "#dc2626";

    return (
        <div
            style={{
                position: "fixed",
                top: isMobile ? "calc(env(safe-area-inset-top, 0px) + 72px)" : 18,
                right: isMobile ? 10 : 100,
                zIndex: 20,
                padding: isMobile ? "8px 10px" : "10px 14px",
                color: "#e8f0ff",
                fontWeight: 700,
                fontSize: isMobile ? 12 : 14,
                textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                background: "rgba(0,0,0,0.45)",
                backdropFilter: "blur(6px)",
                borderRadius: 10,
                minWidth: isMobile ? 145 : 160,
                maxWidth: isMobile ? "58vw" : "none",
                lineHeight: isMobile ? 1.55 : 1.7,
            }}
        >
            <div>⚔️ Kills: {kills}</div>
            <div style={{ marginBottom: 2 }}>
                {isBossLevel ? "⚡ BOSS PHASE" : `📶 Level ${level} / ${maxLevels} (${killsThisLevel}/${killsPerLevel})`}
            </div>
            {isBossLevel && bossMaxHp > 0 && (
                <div style={{ marginBottom: 4 }}>
                    👾 Boss HP:
                    <span style={{ marginLeft: 6, color: bossHpColor }}>{Math.max(0, bossHP)}</span>
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
                                width: `${bossHpPct}%`,
                                background: bossHpColor,
                                borderRadius: 4,
                                transition: "width 0.2s ease, background 0.3s ease",
                            }}
                        />
                    </div>
                </div>
            )}
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
