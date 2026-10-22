import "./MonthOverview.css";
import { StatusBadge } from "./StatusBadge";
import { CategorySummary } from "./CategorySummary";
import { useGoalReport } from "../hooks/useGoalReport";
import { useMonthEntryCount } from "../hooks/useMonthEntryCount";
import { calculateTotal } from "../utils/calculateTotal";
import { formatBRL } from "../utils/formatBRL";
import { isGoalSet } from "../utils/goalStatus";

export const MIN_ENTRIES_FOR_SAVINGS = 5;

interface Props {
  summary: { category: string; total: number }[];
  refreshKey: number;
}

/** Panorama do mês: gasto, meta, status e resumo por categoria. Fica no topo, antes da lista. */
export function MonthOverview({ summary, refreshKey }: Props) {
  const report = useGoalReport(refreshKey);
  const entries = useMonthEntryCount(refreshKey);
  const total = calculateTotal(summary);
  const goalSet = report ? isGoalSet(report.monthlySavingsGoal) && report.monthlySavingsGoal > 0 : false;
  const fewEntries = entries !== null && entries < MIN_ENTRIES_FOR_SAVINGS;

  return (
    <section className="month-overview" aria-label="Panorama do mês">
      <div className="month-overview__cards">
        <div className="month-overview__card">
          <span className="month-overview__label">Gasto no período</span>
          <strong className="month-overview__value">{formatBRL(total)}</strong>
        </div>

        {report && (
          <div className="month-overview__card">
            <span className="month-overview__label">Meta de economia do mês</span>
            <strong className="month-overview__value">
              {goalSet ? `${formatBRL(report.monthlySavingsAchieved)} de ${formatBRL(report.monthlySavingsGoal)}` : "Defina sua meta"}
            </strong>
            {goalSet && entries !== null && (
              <span className="month-overview__note">
                Baseado em {entries} {entries === 1 ? "lançamento" : "lançamentos"} neste mês
                {fewEntries && " — poucos dados, o valor pode estar acima do real"}
              </span>
            )}
          </div>
        )}

        {report && (
          <StatusBadge label="Economia mensal" percent={report.monthlyProgressPercent} goal={report.monthlySavingsGoal} />
        )}
      </div>

      <CategorySummary data={summary} />
    </section>
  );
}
