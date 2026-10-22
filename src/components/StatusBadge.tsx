import "./StatusBadge.css";
import { getGoalLevel, type GoalLevel } from "../utils/goalStatus";

interface Props {
  label: string;
  percent: number;
  /** Valor da meta. Se for 0, o selo mostra "Defina sua meta" em vez de um status. */
  goal?: number;
}

const STATUS: Record<GoalLevel, { emoji: string; text: string; className: string }> = {
  good: { emoji: "🟢", text: "Indo bem", className: "status-badge--good" },
  warn: { emoji: "🟡", text: "Mais ou menos", className: "status-badge--warn" },
  bad: { emoji: "🔴", text: "Precisa de atenção", className: "status-badge--bad" },
  unset: { emoji: "⚪", text: "Defina sua meta", className: "status-badge--unset" },
};

export function StatusBadge({ label, percent, goal }: Props) {
  const status = STATUS[getGoalLevel(percent, goal)];

  return (
    <div className={`status-badge ${status.className}`}>
      <span className="status-badge__emoji">{status.emoji}</span>
      <div>
        <div className="status-badge__label">{label}</div>
        <div className="status-badge__text">{status.text}</div>
      </div>
    </div>
  );
}
