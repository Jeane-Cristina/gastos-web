import "./StatusBadge.css";

interface Props {
  label: string;
  percent: number;
}

function getStatus(percent: number): { emoji: string; text: string; className: string } {
  if (percent >= 80) return { emoji: "🟢", text: "Indo bem", className: "status-badge--good" };
  if (percent >= 40) return { emoji: "🟡", text: "Mais ou menos", className: "status-badge--warn" };
  return { emoji: "🔴", text: "Precisa de atenção", className: "status-badge--bad" };
}

export function StatusBadge({ label, percent }: Props) {
  const status = getStatus(percent);

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