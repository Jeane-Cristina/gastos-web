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

/** Ritmo do mês: quanto dá para gastar até o fim do mês sem comprometer a meta de economia. */
function getPace(income: number, goal: number, spent: number, now = new Date()) {
  const budget = Math.max(income - goal, 0);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const day = now.getDate();
  return {
    budget,
    remaining: budget - spent,
    daysLeft: daysInMonth - day,
    spentPercent: budget > 0 ? Math.min((spent / budget) * 100, 100) : 100,
    expectedPercent: (day / daysInMonth) * 100,
    over: spent > budget,
  };
}

/** Panorama do mês: ritmo de gasto, meta, status e resumo por categoria. Fica no topo, antes da lista. */
export function MonthOverview({ summary, refreshKey }: Props) {
  const report = useGoalReport(refreshKey);
  const entries = useMonthEntryCount(refreshKey);
  const total = calculateTotal(summary);
  const goalSet = report ? isGoalSet(report.monthlySavingsGoal) && report.monthlySavingsGoal > 0 : false;
  const fewEntries = entries !== null && entries < MIN_ENTRIES_FOR_SAVINGS;

  // A renda do mês sai do próprio relatório: economizado = renda - gasto.
  const pace =
    report && goalSet
      ? getPace(
          report.monthlySavingsAchieved + report.monthlySpent,
          report.monthlySavingsGoal,
          report.monthlySpent,
        )
      : null;
  const paceTone = !pace ? "" : pace.over ? "bad" : pace.spentPercent > pace.expectedPercent + 8 ? "warn" : "ok";

  return (
    <section className="month-overview" aria-label="Panorama do mês" data-testid="month-overview">
      {pace && (
        <div className={`month-hero month-hero--${paceTone}`}>
          <p className="month-hero__label">{pace.over ? "Acima do limite do mês" : "Ainda pode gastar neste mês"}</p>
          <strong className="month-hero__value">{formatBRL(Math.abs(pace.remaining))}</strong>
          <div className="month-hero__track" aria-hidden="true">
            <div className="month-hero__fill" style={{ width: `${pace.spentPercent}%` }} />
            <div className="month-hero__marker" style={{ left: `${pace.expectedPercent}%` }} />
          </div>
          <p className="month-hero__legend" aria-hidden="true">
            <span style={{ left: `${pace.expectedPercent}%` }}>hoje</span>
          </p>
          <p className="month-hero__note">
            {formatBRL(report!.monthlySpent)} gastos de {formatBRL(pace.budget)} possíveis
            {pace.daysLeft > 0 ? `, faltam ${pace.daysLeft} ${pace.daysLeft === 1 ? "dia" : "dias"}` : ", último dia do mês"}
          </p>
        </div>
      )}

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
