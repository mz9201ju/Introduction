export default function Scoreboard({ stats }) {
    const { kills, playerHP, victory, loss } = stats;

    return (
        <div
            style={{
                top: 18,
                right: 100,
                zIndex: 20,
                padding: "90px 14px",
                color: "#e8f0ff",
                fontWeight: 700,
                textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                transition: "background 0.3s ease",
                minWidth: 140,
            }}
        >
            <div>Kills: {kills}</div>
            <div>HP: {playerHP}</div>
            <div>
                {victory && "🏆 Victory!"}
                {loss && "💀 Game Over"}
            </div>
        </div>
    );
}
