import { GoalRadar } from "./GoalRadar";
import { formatBRL } from "../utils/formatBRL";
import { useGoalReport } from "../hooks/useGoalReport";
import { isGoalSet } from "../utils/goalStatus";
import { useMonthEntryCount } from "../hooks/useMonthEntryCount";
import { MIN_ENTRIES_FOR_SAVINGS } from "./MonthOverview";

interface PeriodProps {
  period: string;
  met: boolean;
  achieved: number;
  goal: number;
  percent: number;
  note?: React.ReactNode;
}

function GoalPeriod({ period, met, achieved, goal, percent, note }: PeriodProps) {
  const hasGoal = isGoalSet(goal) && goal > 0;

  return (
    <div className="goal-period">
      <GoalRadar label={`Meta ${period.toLowerCase()}`} percent={percent} goal={goal} />
      <div className="goal-period__info">
        <h3 className="goal-period__title">{period}</h3>
        {hasGoal ? (
          <>
            <p className="goal-period__line">
              <span className={`goal-period__result goal-period__result--${met ? "met" : "below"}`}>
                {met ? "Meta atingida" : "Abaixo da meta"}
              </span>
            </p>
            <p className="goal-period__amount">
              Economizou <strong>{formatBRL(achieved)}</strong> de {formatBRL(goal)}
            </p>
            {note}
          </>
        ) : (
          <p className="goal-period__amount">
            Defina sua meta {period.toLowerCase()} para acompanhar o progresso.
          </p>
        )}
      </div>
    </div>
  );
}

export function GoalReport() {
  const report = useGoalReport();
  const entries = useMonthEntryCount();

  if (!report) return null;

  const monthlyNote =
    entries !== null && isGoalSet(report.monthlySavingsGoal) && report.monthlySavingsGoal > 0 ? (
      <p className="goal-report__basis">
        Baseado em {entries} {entries === 1 ? "lançamento" : "lançamentos"} neste mês.
        {entries < MIN_ENTRIES_FOR_SAVINGS &&
          " Poucos lançamentos: o valor economizado pode estar acima do real. Lance todos os gastos para um resultado confiável."}
      </p>
    ) : null;

  return (
    <section className="report-card">
      <h2 className="report-card__title">Relatório de metas</h2>
      <div className="goal-report__grid">
        <GoalPeriod
          period="Mensal"
          met={report.monthlyGoalMet}
          achieved={report.monthlySavingsAchieved}
          goal={report.monthlySavingsGoal}
          percent={report.monthlyProgressPercent}
          note={monthlyNote}
        />
        <GoalPeriod
          period="Anual"
          met={report.annualGoalMet}
          achieved={report.annualSavingsAchieved}
          goal={report.annualSavingsGoal}
          percent={report.annualProgressPercent}
        />
      </div>
    </section>
  );
}
