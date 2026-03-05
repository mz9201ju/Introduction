import { useState, useEffect, useCallback, useRef } from "react";
import Starfield from "@game/components/Starfield";
import Scoreboard from "@game/components/Scoreboard";
import SpaceshipCursor from "@game/pages/SpaceshipCursor";
import { usePageSeo } from "@app/hooks/usePageSeo";
import { addWinnerToLeaderboard, fetchLeaderboard } from "@game/services/leaderboardApi";

const LEADERBOARD_DISPLAY_MS = 60000;

const FALLBACK_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='88' height='88' viewBox='0 0 88 88'%3E%3Crect width='88' height='88' fill='%2322293a'/%3E%3Ccircle cx='44' cy='32' r='16' fill='%23364259'/%3E%3Crect x='20' y='54' width='48' height='22' rx='11' fill='%23364259'/%3E%3C/svg%3E";

const modalBackdropStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 60,
  background: "rgba(0,0,0,0.9)",
  backdropFilter: "blur(8px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
};

const modalCardStyle = {
  width: "min(720px, 96vw)",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "rgba(5,8,16,1)",
  color: "#e8f0ff",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.3)",
  boxShadow: "0 18px 40px rgba(0,0,0,0.62)",
  padding: 18,
  fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
};

const buttonStyle = {
  border: "1px solid rgba(255,255,255,0.4)",
  background: "rgba(255,255,255,0.12)",
  color: "#e8f0ff",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
};

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read image file"));
    reader.readAsDataURL(file);
  });
}

export default function PlayGame() {
  usePageSeo({
    title: "Play Game | Omer Zahid",
    description:
      "Play Omer Zahid’s browser-based space shooter with starfield combat, progressive enemy waves, boss battles, and live scoring tuned for smooth canvas action.",
  });

  const [showInstructions, setShowInstructions] = useState(false);
  const [showLeaderboardGate, setShowLeaderboardGate] = useState(true);
  const [leaderboardEntries, setLeaderboardEntries] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState("");
  const [showWinnerForm, setShowWinnerForm] = useState(false);
  const [winnerName, setWinnerName] = useState("");
  const [winnerPicture, setWinnerPicture] = useState("");
  const [winnerSubmitLoading, setWinnerSubmitLoading] = useState(false);
  const [winnerSubmitError, setWinnerSubmitError] = useState("");
  const [winnerConfirmation, setWinnerConfirmation] = useState("");
  const [winnerSubmittedForVictory, setWinnerSubmittedForVictory] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [zoomedImage, setZoomedImage] = useState("");
  const [zoomedName, setZoomedName] = useState("");

  const gameEngineRef = useRef(null);
  const gameStartedRef = useRef(false);
  const leaderboardTimeoutRef = useRef(0);
  const winnerPromptShownRef = useRef(false);
  const mountedRef = useRef(true);
  const videoRef = useRef(null);
  const cameraCanvasRef = useRef(null);
  const cameraStreamRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCameraLoading(false);
  }, []);

  const startGameOnce = useCallback((reason = "manual") => {
    if (gameStartedRef.current) return;
    gameStartedRef.current = true;
    setShowLeaderboardGate(false);
    setShowInstructions(true);
    clearTimeout(leaderboardTimeoutRef.current);
    if (gameEngineRef.current) gameEngineRef.current.start();
    console.log(`▶️ Game start triggered (${reason})`);
  }, []);

  const closeLeaderboardModal = useCallback(() => {
    if (!gameStartedRef.current) {
      startGameOnce("manual");
      return;
    }
    setShowLeaderboardGate(false);
  }, [startGameOnce]);

  const loadLeaderboard = useCallback(async (signal) => {
    setLeaderboardLoading(true);
    setLeaderboardError("");

    try {
      const entries = await fetchLeaderboard({ signal });
      if (!mountedRef.current) return;
      setLeaderboardEntries(entries);
    } catch (error) {
      if (!mountedRef.current) return;
      if (error?.name === "AbortError") return;
      setLeaderboardEntries([]);
      setLeaderboardError(error?.message || "Failed to load leaderboard");
    } finally {
      if (mountedRef.current) setLeaderboardLoading(false);
    }
  }, []);

  const handleEngineReady = useCallback((engine) => {
    gameEngineRef.current = engine;
    if (!engine) return;

    if (gameStartedRef.current) {
      engine.start();
      return;
    }

    engine.pause();
  }, []);

  const openEntryImage = useCallback((entry) => {
    if (!entry?.picture) return;
    setZoomedImage(entry.picture);
    setZoomedName(entry.firstName);
  }, []);

  const handleVictoryReached = useCallback(() => {
    winnerPromptShownRef.current = true;
    setShowLeaderboardGate(false);
    setShowWinnerForm(true);
    setWinnerSubmitError("");
    setCameraError("");
    setStats(prev => ({ ...prev, victory: true, loss: false }));
  }, []);

  const handleLossReached = useCallback(() => {
    setStats(prev => ({ ...prev, loss: true }));
  }, []);
  const [stats, setStats] = useState({
    kills: 0,
    playerHP: 100,
    victory: false,
    loss: false,
    level: 1,
    killsThisLevel: 0,
    bossHP: null,
    bossMaxHp: null,
    forceField: false,
    firepowerLevel: 1,
  });

  const handleKill = useCallback((payload = {}) => {
    const { reset, kills, playerHP, victory, loss, level, killsThisLevel, bossHP, bossMaxHp } = payload;

    if (reset) {
      winnerPromptShownRef.current = false;
      setShowWinnerForm(false);
      setWinnerSubmittedForVictory(false);
      setWinnerConfirmation("");
      setWinnerSubmitError("");
      setWinnerName("");
      setWinnerPicture("");
      stopCamera();
      setStats({ kills: 0, playerHP: 100, victory: false, loss: false, level: 1, killsThisLevel: 0, bossHP: null, bossMaxHp: null, forceField: false, firepowerLevel: 1 });
      return;
    }

    setStats(prev => ({
      kills: typeof kills === "number" ? kills : prev.kills,
      playerHP: typeof playerHP === "number" ? playerHP : prev.playerHP,
      victory: victory ?? prev.victory,
      loss: loss ?? prev.loss,
      level: typeof level === "number" ? level : prev.level,
      killsThisLevel: typeof killsThisLevel === "number" ? killsThisLevel : prev.killsThisLevel,
      bossHP: typeof bossHP === "number" ? bossHP : prev.bossHP,
      bossMaxHp: typeof bossMaxHp === "number" ? bossMaxHp : prev.bossMaxHp,
      forceField: payload.forceField ?? prev.forceField,
      firepowerLevel: typeof payload.firepowerLevel === "number" ? payload.firepowerLevel : prev.firepowerLevel,
    }));
  }, [stopCamera]);

  /* ==========================================================
     ⏱️ Show instructions for 10 seconds, then fade out
     ========================================================== */
  useEffect(() => {
    if (!showInstructions) return;
    const timer = setTimeout(() => setShowInstructions(false), 10000);
    return () => clearTimeout(timer);
  }, [showInstructions]);

  useEffect(() => {
    mountedRef.current = true;
    const controller = new AbortController();
    loadLeaderboard(controller.signal);
    return () => {
      mountedRef.current = false;
      controller.abort();
      clearTimeout(leaderboardTimeoutRef.current);
      stopCamera();
    };
  }, [loadLeaderboard, stopCamera]);

  useEffect(() => {
    if (!showLeaderboardGate || gameStartedRef.current) return;

    leaderboardTimeoutRef.current = setTimeout(() => {
      startGameOnce("timeout");
    }, LEADERBOARD_DISPLAY_MS);

    return () => clearTimeout(leaderboardTimeoutRef.current);
  }, [showLeaderboardGate, startGameOnce]);

  useEffect(() => {
    if (!stats.victory || winnerPromptShownRef.current) return;
    winnerPromptShownRef.current = true;
    setShowWinnerForm(true);
    setWinnerSubmitError("");
    setCameraError("");
  }, [stats.victory]);

  useEffect(() => {
    if (showWinnerForm) return undefined;
    stopCamera();
    setCameraError("");
    return undefined;
  }, [showWinnerForm, stopCamera]);

  useEffect(() => {
    if (!winnerConfirmation) return undefined;
    const timer = setTimeout(() => setWinnerConfirmation(""), 4000);
    return () => clearTimeout(timer);
  }, [winnerConfirmation]);

  const handleStartCamera = useCallback(async () => {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera is not supported on this device/browser.");
      return;
    }

    setCameraLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      if (!mountedRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (error) {
      setCameraError(error?.message || "Could not access camera permissions.");
      stopCamera();
    } finally {
      setCameraLoading(false);
    }
  }, [stopCamera]);

  const handleCaptureCamera = useCallback(() => {
    const video = videoRef.current;
    if (!video || !cameraCanvasRef.current) return;

    const canvas = cameraCanvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    setWinnerPicture(imgData);
    setCameraError("");
    stopCamera();
  }, [stopCamera]);

  const handleFilePick = useCallback(async (event) => {
    setWinnerSubmitError("");
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setWinnerPicture(String(dataUrl));
      setCameraError("");
    } catch (error) {
      setWinnerSubmitError(error?.message || "Could not read selected image.");
    }
  }, []);

  const handleSubmitWinner = useCallback(async (event) => {
    event.preventDefault();
    setWinnerSubmitError("");
    setWinnerConfirmation("");

    const cleanedName = winnerName.trim();
    if (!cleanedName) {
      setWinnerSubmitError("Please enter your first name.");
      return;
    }

    if (!winnerPicture) {
      setWinnerSubmitError("Please provide a profile picture.");
      return;
    }

    setWinnerSubmitLoading(true);
    try {
      await addWinnerToLeaderboard({
        firstName: cleanedName,
        picture: winnerPicture,
      });

      if (!mountedRef.current) return;
      setWinnerConfirmation("Added to leaderboard successfully!");
      setShowWinnerForm(false);
      setWinnerSubmittedForVictory(true);
      setWinnerName("");
      setWinnerPicture("");
    } catch (error) {
      setWinnerSubmitError(error?.message || "Failed to submit winner.");
    } finally {
      if (mountedRef.current) setWinnerSubmitLoading(false);
    }
  }, [winnerName, winnerPicture]);

  const shouldForceWinnerForm = stats.victory && !winnerSubmittedForVictory;

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Global effects across all pages */}
      <SpaceshipCursor />

      <Scoreboard stats={stats} />
      <Starfield
        onKill={handleKill}
        onVictory={handleVictoryReached}
        onLoss={handleLossReached}
        startPaused
        onEngineReady={handleEngineReady}
      />

      {(stats.victory || stats.loss) && !showLeaderboardGate && !showWinnerForm && !shouldForceWinnerForm && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 16,
            zIndex: 50,
            display: "flex",
            gap: 8,
          }}
        >
          <button
            type="button"
            style={buttonStyle}
            onClick={() => {
              setShowLeaderboardGate(true);
              loadLeaderboard();
            }}
          >
            View Leaderboard Again
          </button>
        </div>
      )}

      {showLeaderboardGate && (
        <div style={modalBackdropStyle}>
          <div style={modalCardStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>🏁 Leaderboard</div>
                <div style={{ opacity: 0.85, fontSize: 14 }}>
                  {gameStartedRef.current ? "Current leaderboard" : "Game starts automatically in 60 seconds."}
                </div>
              </div>
              <button type="button" style={buttonStyle} onClick={closeLeaderboardModal}>
                {gameStartedRef.current ? "Close" : "Start Now"}
              </button>
            </div>

            {leaderboardLoading && <div style={{ opacity: 0.85, marginBottom: 8 }}>Loading leaderboard...</div>}

            {leaderboardError && (
              <div style={{ marginBottom: 12, color: "#fca5a5" }}>
                {leaderboardError}
                <div style={{ marginTop: 8 }}>
                  <button type="button" style={buttonStyle} onClick={() => loadLeaderboard()}>Retry</button>
                </div>
              </div>
            )}

            {!leaderboardLoading && !leaderboardError && leaderboardEntries.length === 0 && (
              <div style={{ opacity: 0.88 }}>No leaderboard entries yet. Be the first winner!</div>
            )}

            {!leaderboardLoading && leaderboardEntries.length > 0 && (
              <div style={{ display: "grid", gap: 10 }}>
                {leaderboardEntries.map((entry, index) => (
                  <div
                    key={entry.id || `${entry.firstName}-${index}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: 10,
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "rgba(8,14,30,0.92)",
                      cursor: entry.picture ? "pointer" : "default",
                    }}
                    onClick={() => openEntryImage(entry)}
                  >
                    <img
                      src={entry.picture || FALLBACK_AVATAR}
                      alt={`${entry.firstName} profile`}
                      style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", background: "rgba(255,255,255,0.1)", cursor: entry.picture ? "zoom-in" : "default", border: "1px solid rgba(255,255,255,0.18)" }}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = FALLBACK_AVATAR;
                      }}
                    />
                    <div style={{ fontWeight: 700 }}>{entry.firstName}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {(showWinnerForm || shouldForceWinnerForm) && (
        <div style={modalBackdropStyle}>
          <div style={modalCardStyle}>
            <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 10 }}>Add Winner</div>

            <form onSubmit={handleSubmitWinner}>
              <label htmlFor="winnerName" style={{ display: "block", marginBottom: 6, fontWeight: 700 }}>First name</label>
              <input
                id="winnerName"
                type="text"
                value={winnerName}
                onChange={(event) => setWinnerName(event.target.value)}
                placeholder="Your first name"
                style={{ width: "100%", marginBottom: 12, padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.08)", color: "#f8fbff" }}
              />

              <div style={{ marginBottom: 8, fontWeight: 700 }}>Profile picture</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                <label style={{ ...buttonStyle, display: "inline-flex", alignItems: "center", gap: 8 }}>
                  Upload image
                  <input type="file" accept="image/*" onChange={handleFilePick} style={{ display: "none" }} />
                </label>
                <button type="button" style={buttonStyle} onClick={handleStartCamera} disabled={cameraLoading}>
                  {cameraLoading ? "Starting camera..." : "Use live camera"}
                </button>
              </div>

              {cameraError && <div style={{ marginBottom: 10, color: "#fca5a5" }}>{cameraError}</div>}

              {cameraActive && (
                <div style={{ marginBottom: 12 }}>
                  <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)" }} />
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button type="button" style={buttonStyle} onClick={handleCaptureCamera}>Capture</button>
                    <button type="button" style={buttonStyle} onClick={stopCamera}>Close camera</button>
                  </div>
                </div>
              )}

              <canvas ref={cameraCanvasRef} style={{ display: "none" }} />

              {winnerPicture && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ marginBottom: 6, opacity: 0.9 }}>Preview</div>
                  <img src={winnerPicture} alt="Winner preview" style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(255,255,255,0.2)" }} />
                </div>
              )}

              {winnerSubmitError && <div style={{ marginBottom: 10, color: "#fca5a5" }}>{winnerSubmitError}</div>}

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={buttonStyle} disabled={winnerSubmitLoading}>
                  {winnerSubmitLoading ? "Submitting..." : "Submit to Leaderboard"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {winnerConfirmation && (
        <div
          style={{
            position: "fixed",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 80,
            background: "rgba(22,101,52,0.9)",
            color: "#dcfce7",
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(187,247,208,0.45)",
            fontWeight: 700,
          }}
        >
          {winnerConfirmation}
        </div>
      )}

      {zoomedImage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 90,
            background: "rgba(0,0,0,0.86)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setZoomedImage("")}
        >
          <div
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={zoomedImage}
              alt={`${zoomedName || "Leaderboard player"} enlarged`}
              style={{
                width: "min(68vw, 520px)",
                height: "min(68vw, 520px)",
                borderRadius: 18,
                objectFit: "cover",
                border: "1px solid rgba(255,255,255,0.22)",
                boxShadow: "0 22px 48px rgba(0,0,0,0.6)",
                animation: "imageFlyZoom 280ms ease-out",
              }}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = FALLBACK_AVATAR;
              }}
            />
            <div style={{ color: "#e8f0ff", fontWeight: 700 }}>{zoomedName}</div>
            <button type="button" style={buttonStyle} onClick={() => setZoomedImage("")}>Close</button>
          </div>
        </div>
      )}

      {showInstructions && (
        <div
          style={{
            position: "fixed",
            bottom: "30px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
            padding: "14px 18px",
            background: "rgba(0,0,0,0.55)",
            color: "#e8f0ff",
            borderRadius: 12,
            backdropFilter: "blur(5px)",
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
            lineHeight: 1.45,
            textAlign: "center",
            maxWidth: "90%",
            boxShadow: "0 0 12px rgba(0,0,0,0.4)",
            animation: "fadeOut 0.6s ease-in-out 9.4s forwards",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 16 }}>
            🚀 How to Play
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: 0,
              listStyle: "none",
              fontSize: 20,
            }}
          >
            <li>👉 Move your mouse or joystick to aim the ship.</li>
            <li>💥 Right click or left click = fire laser.</li>
            <li>⚡ Dodge enemy bullets and survive as long as you can.</li>
          </ul>
        </div>
      )}

      {/* ✨ Fade-out animation for smooth disappearance */}
      <style>{`
        @keyframes fadeOut {
          to {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
        }

        @keyframes imageFlyZoom {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.65);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
