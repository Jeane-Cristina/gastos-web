import { GoalRadar } from "./GoalRadar";
import { StatusBadge } from "./StatusBadge";
import { formatBRL } from "../utils/formatBRL";
import { useGoalReport } from "../hooks/useGoalReport";
import { isGoalSet } from "../utils/goalStatus";
import { useMonthEntryCount } from "../hooks/useMonthEntryCount";
import { MIN_ENTRIES_FOR_SAVINGS } from "./MonthOverview";

interface LineProps {
  period: string;
  met: boolean;
  achieved: number;
  goal: number;
}

function GoalLine({ period, met, achieved, goal }: LineProps) {
  if (!isGoalSet(goal) || goal <= 0) {
    return (
      <p>
        {period}: Defina sua meta {period.toLowerCase()} para acompanhar o progresso.
      </p>
    );
  }

  return (
    <p>
      {period}: {met ? "✅ Meta atingida" : "⚠️ Abaixo da meta"} — economizou {formatBRL(achieved)} de {formatBRL(goal)}
    </p>
  );
}

export function GoalReport() {
  const report = useGoalReport();
  const entries = useMonthEntryCount();

  if (!report) return null;

  return (
    <div>
      <h2>Relatório de metas</h2>
      <GoalLine
        period="Mensal"
        met={report.monthlyGoalMet}
        achieved={report.monthlySavingsAchieved}
        goal={report.monthlySavingsGoal}
      />
      {entries !== null && isGoalSet(report.monthlySavingsGoal) && report.monthlySavingsGoal > 0 && (
        <p className="goal-report__basis">
          Baseado em {entries} {entries === 1 ? "lançamento" : "lançamentos"} neste mês.
          {entries < MIN_ENTRIES_FOR_SAVINGS &&
            " ⚠️ Poucos lançamentos: o valor economizado pode estar acima do real. Lance todos os gastos para um resultado confiável."}
        </p>
      )}
      <GoalLine
        period="Anual"
        met={report.annualGoalMet}
        achieved={report.annualSavingsAchieved}
        goal={report.annualSavingsGoal}
      />

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <GoalRadar label="Meta mensal" percent={report.monthlyProgressPercent} goal={report.monthlySavingsGoal} />
        <GoalRadar label="Meta anual" percent={report.annualProgressPercent} goal={report.annualSavingsGoal} />
      </div>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
        <StatusBadge label="Economia mensal" percent={report.monthlyProgressPercent} goal={report.monthlySavingsGoal} />
        <StatusBadge label="Economia anual" percent={report.annualProgressPercent} goal={report.annualSavingsGoal} />
      </div>
    </div>
  );
}
