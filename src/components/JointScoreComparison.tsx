import type { MemberScore } from "../services/jointAccountApi";
import "./JointScoreComparison.css";

interface Props {
  scores: MemberScore[];
}

function statusColor(balance: number): string {
  if (balance >= 80) return "var(--sage)";
  if (balance >= 50) return "#C99A3E";
  return "var(--rust)";
}

export function JointScoreComparison({ scores }: Props) {
  if (scores.length === 0) return null;

  return (
    <div className="joint-score">
      <h4>Equilíbrio da conta</h4>
      {scores.map((s) => (
        <div key={s.username} className="joint-score__row">
          <span className="joint-score__name">{s.username}</span>
          <div className="joint-score__bar-track">
            <div
              className="joint-score__bar-fill"
              style={{ width: `${Math.max(0, s.balance)}%`, backgroundColor: statusColor(s.balance) }}
            />
          </div>
          <span className="joint-score__value">{Math.max(0, Math.round(s.balance))}</span>
        </div>
      ))}
    </div>
  );
}