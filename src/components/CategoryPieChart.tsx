import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import "./CategoryPieChart.css";

interface CategoryTotal {
  category: string;
  total: number;
}

interface Props {
  data: CategoryTotal[];
}

const COLORS = ["#3B4B6B", "#5B7F5E", "#A6402F", "#C99A3E", "#6B655C", "#8B6BA6", "#4B8B8B", "#B65B7A"];

export function CategoryPieChart({ data }: Props) {
  if (data.length === 0) return null;

  const chartData = data.map((d) => ({ name: d.category, value: d.total }));
  const total = data.reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="category-chart">
      <h3 className="category-chart__title">Distribuição de gastos por categoria</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
            <Tooltip
            formatter={(value) => {
                const num = typeof value === "number" ? value : 0;
                return [`R$ ${num.toFixed(2)} (${((num / total) * 100).toFixed(1)}%)`, ""];
            }}
            />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}