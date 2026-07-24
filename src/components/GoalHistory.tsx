import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Snapshot {
  month: number;
  year: number;
  spent: number;
  savingsAchieved: number;
  savingsGoal: number;
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

export function GoalHistory() {
  const [history, setHistory] = useState<Snapshot[]>([]);

  function load() {
    fetch(`${import.meta.env.VITE_API_URL}/goal/history`, { headers: authHeaders() })
      .then((r) => r.json())
      .then(setHistory);
  }

  useEffect(load, []);

  async function saveSnapshot() {
    await fetch(`${import.meta.env.VITE_API_URL}/goal/snapshot`, { method: "POST", headers: authHeaders() });
    load();
  }

  const chartData = history.map((h) => ({
    label: `${h.month}/${h.year}`,
    "Economizado": h.savingsAchieved,
    "Meta": h.savingsGoal,
  }));

  return (
    <div>
      <h2>Histórico de metas</h2>
      <button className="button-layout" onClick={saveSnapshot}>Salvar snapshot deste mês</button>

      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(43,38,32,0.1)" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="Economizado" stroke="#5B7F5E" strokeWidth={2} />
            <Line type="monotone" dataKey="Meta" stroke="#3B4B6B" strokeWidth={2} strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}