import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";
import "./GoalRadar.css";

interface Props {
  label: string;
  percent: number;
}

function statusColor(percent: number): string {
  if (percent >= 80) return "#5B7F5E"; // sálvia — indo bem
  if (percent >= 40) return "#C99A3E"; // âmbar — mais ou menos
  return "#A6402F"; // ferrugem — atenção
}

export function GoalRadar({ label, percent }: Props) {
  const data = [{ value: percent, fill: statusColor(percent) }];

  return (
    <div className="goal-radar">
      <ResponsiveContainer width="100%" height={160}>
        <RadialBarChart
          innerRadius="70%"
          outerRadius="100%"
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar background dataKey="value" cornerRadius={8} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="goal-radar__label">
        <strong>{percent.toFixed(0)}%</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}