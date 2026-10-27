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
  good: "#1F9D6B", // verde: indo bem
  warn: "#E3A008", // âmbar: mais ou menos
  bad: "#D9483B", // vermelho: atenção
  unset: "#8A94A6", // neutro: sem meta
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
      <div className="goal-radar__chart">
        <ResponsiveContainer width="100%" height={132}>
          <RadialBarChart
            innerRadius="70%"
            outerRadius="100%"
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background={{ fill: "var(--line)" }} dataKey="value" cornerRadius={8} />
          </RadialBarChart>
        </ResponsiveContainer>
        <strong className="goal-radar__percent">{percent.toFixed(0)}%</strong>
      </div>
      <span className="goal-radar__caption">{label}</span>
    </div>
  );
}