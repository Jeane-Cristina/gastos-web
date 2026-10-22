import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";
import "./GoalRadar.css";
import { getGoalLevel, type GoalLevel } from "../utils/goalStatus";

interface Props {
  label: string;
  percent: number;
  /** Valor da meta. Se for 0, mostra o convite para definir a meta em vez do gráfico. */
  goal?: number;
}

const LEVEL_COLOR: Record<GoalLevel, string> = {
  good: "#5B7F5E", // sálvia — indo bem
  warn: "#C99A3E", // âmbar — mais ou menos
  bad: "#A6402F", // ferrugem — atenção
  unset: "#9A9288", // neutro — sem meta
};

export function GoalRadar({ label, percent, goal }: Props) {
  const level = getGoalLevel(percent, goal);

  if (level === "unset") {
    return (
      <div className="goal-radar goal-radar--unset">
        <strong>—</strong>
        <span>Defina sua {label.toLowerCase()}</span>
      </div>
    );
  }

  const data = [{ value: percent, fill: LEVEL_COLOR[level] }];

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