// Regra única de status das metas. Usada por GoalReport, GoalRadar, StatusBadge e GoalScore.

export type GoalLevel = "unset" | "good" | "warn" | "bad";

export const GOOD_FROM = 80;
export const WARN_FROM = 40;

export interface GoalProgress {
  monthlySavingsGoal: number;
  monthlyProgressPercent: number;
  annualSavingsGoal: number;
  annualProgressPercent: number;
}

/** Meta zerada (ou ausente) não é "atingida" nem "em atenção": é uma meta ainda não definida. */
export function isGoalSet(goal?: number): boolean {
  return goal === undefined || goal > 0;
}

export function getGoalLevel(percent: number, goal?: number): GoalLevel {
  if (!isGoalSet(goal)) return "unset";
  if (percent >= GOOD_FROM) return "good";
  if (percent >= WARN_FROM) return "warn";
  return "bad";
}

/**
 * Pontuação geral: média do progresso das metas que foram definidas (0 a 100).
 * Retorna null quando nenhuma meta foi definida.
 */
export function combinedScore(report: GoalProgress): number | null {
  const percents: number[] = [];
  if (isGoalSet(report.monthlySavingsGoal) && report.monthlySavingsGoal > 0) {
    percents.push(report.monthlyProgressPercent);
  }
  if (isGoalSet(report.annualSavingsGoal) && report.annualSavingsGoal > 0) {
    percents.push(report.annualProgressPercent);
  }
  if (percents.length === 0) return null;
  const clamped = percents.map((p) => Math.min(100, Math.max(0, p)));
  return Math.round(clamped.reduce((a, b) => a + b, 0) / clamped.length);
}
