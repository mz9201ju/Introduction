import { useNavigate } from "react-router-dom"; // ✅ import navigate hook
export default function About() {
    const navigate = useNavigate(); // ✅ initialize navigate function
    return (
        <div style={{ textAlign: "center", padding: "4rem" }}>
            <h1>About Me 🚀</h1>
            <p>
                I love my Allah — the One who created this entire universe. 🌌
                Allah is my best friend.
                Through His guidance, I’m able to do magical things in the digital world — creating solutions that save both time and money, all with simplicity and grace. It’s all from my Allah. 🤍
            </p>
            <button
                onClick={() => navigate("/")}
                style={{
                    marginTop: "2rem",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    backgroundColor: "#00bfff",
                    color: "white",
                    fontSize: "1rem",
                    cursor: "pointer",
                    border: "none",
                    boxShadow: "0 0 10px rgba(0, 191, 255, 0.7)",
                }}
            >
                ⬅️ Back to Home
            </button>
        </div>
    );
}
