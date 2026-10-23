import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "./CategoryPieChart.css";
import { formatBRL } from "../utils/formatBRL";

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

      <div className="category-chart__donut">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={65}
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
                return [`${formatBRL(num)} (${((num / total) * 100).toFixed(1)}%)`, ""];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="category-chart__center">
          <span>Total</span>
          <strong>{formatBRL(total)}</strong>
        </div>
      </div>

      <ul className="category-chart__legend">
        {chartData.map((item, index) => (
          <li key={item.name}>
            <span className="category-chart__swatch" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <span className="category-chart__name">{item.name}</span>
            <span className="category-chart__percent">{total > 0 ? ((item.value / total) * 100).toFixed(0) : "0"}%</span>
            <span className="category-chart__value">{formatBRL(item.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
