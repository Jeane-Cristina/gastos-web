import { useState, useEffect } from "react";
import { getScore } from "../services/profileApi";
import { StatusBadge } from "./StatusBadge";

export function GoalScore() {
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    getScore().then((data) => setScore(data.score));
  }, []);

  if (score === null) return null;

  return <StatusBadge label="Pontuação de metas" percent={score} />;
}