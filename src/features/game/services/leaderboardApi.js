const LEADERBOARD_ENDPOINT = "https://www.omerzahid.com/_game/leaderboard";

function normalizeEntries(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.winners)) return payload.winners;
  if (Array.isArray(payload?.entries)) return payload.entries;
  if (Array.isArray(payload?.leaderboard)) return payload.leaderboard;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export async function fetchLeaderboard({ signal } = {}) {
  const response = await fetch(LEADERBOARD_ENDPOINT, {
    method: "GET",
    signal,
  });

  if (!response.ok) {
    throw new Error(`Leaderboard fetch failed (${response.status})`);
  }

  const data = await response.json();
  return normalizeEntries(data).map((entry, index) => ({
    id: entry?.id ?? `${entry?.firstName || entry?.firstname || entry?.name || "player"}-${index}`,
    firstName: String(entry?.firstName || entry?.firstname || entry?.name || "Unknown"),
    picture: entry?.picture || entry?.image || entry?.avatar || "",
  }));
}

export async function addWinnerToLeaderboard({ firstName, picture, signal } = {}) {
  const trimmedName = String(firstName || "").trim();
  if (!trimmedName) throw new Error("First name is required");
  if (!picture) throw new Error("Profile picture is required");

  const response = await fetch(LEADERBOARD_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      firstName: trimmedName,
      picture,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Leaderboard submit failed (${response.status})`);
  }

  return response.json().catch(() => ({ ok: true }));
}
