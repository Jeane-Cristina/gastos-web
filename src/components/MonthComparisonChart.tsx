import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

interface CategoryTotal {
  category: string;
  total: number;
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

export function MonthComparisonChart() {
  const [data, setData] = useState<{ category: string; "Mês atual": number; "Mês anterior": number }[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/expenses/compare-months`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((res: { current: CategoryTotal[]; previous: CategoryTotal[] }) => {
        const categories = new Set([...res.current.map((c) => c.category), ...res.previous.map((c) => c.category)]);
        const merged = Array.from(categories).map((cat) => ({
          category: cat,
          "Mês atual": res.current.find((c) => c.category === cat)?.total ?? 0,
          "Mês anterior": res.previous.find((c) => c.category === cat)?.total ?? 0,
        }));
        setData(merged);
      });
  }, []);

  if (data.length === 0) return null;

  return (
    <div>
      <h3>Comparação com o mês anterior</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(43,38,32,0.1)" />
          <XAxis dataKey="category" tick={{ fontSize: 11 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Mês anterior" fill="#A39B8F" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Mês atual" fill="#3B4B6B" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}