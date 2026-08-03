import { useState, useEffect } from "react";
import "./StreakBadge.css";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

export function StreakBadge() {
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/expenses/streak`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => setStreak(data.streak));
  }, []);

  if (streak === null || streak === 0) return null;

  return (
    <div className="streak-badge">
      🔥 <strong>{streak}</strong> {streak === 1 ? "dia seguido" : "dias seguidos"}
    </div>
  );
}