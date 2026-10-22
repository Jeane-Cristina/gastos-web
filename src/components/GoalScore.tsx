import { StatusBadge } from "./StatusBadge";
import { useGoalReport } from "../hooks/useGoalReport";
import { combinedScore } from "../utils/goalStatus";

/** Pontuação geral: média do progresso das metas definidas, com a mesma regra do Relatório de metas. */
export function GoalScore() {
  const report = useGoalReport();

  if (!report) return null;

  const score = combinedScore(report);

  return <StatusBadge label="Pontuação de metas" percent={score ?? 0} goal={score === null ? 0 : undefined} />;
}
