import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatMonthShort } from "../utils/formatMonthShort";
import { formatBRL } from "../utils/formatBRL";

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

  const chartData = history.map((h) => ({
    label: formatMonthShort(h.month, h.year),
    "Economizado": h.savingsAchieved,
    "Meta": h.savingsGoal,
  }));

  return (
    <div>
      <h2>Histórico de metas</h2>
      <p className="goal-history__note">
        O histórico é registrado automaticamente nos dias em que você usa o app. Meses sem acesso ficam sem ponto no gráfico.
      </p>
      {chartData.length === 0 && <p className="goal-history__note">Ainda não há histórico. Ele começa a aparecer após o primeiro dia de uso com o perfil financeiro preenchido.</p>}

      {chartData.length > 0 && (
        <ul className="goal-history__legend" aria-label="Legenda do gráfico">
          <li>
            <svg width="28" height="8" aria-hidden="true"><line x1="0" y1="4" x2="28" y2="4" stroke="#5B7F5E" strokeWidth="2" /></svg>
            Economizado no mês
          </li>
          <li>
            <svg width="28" height="8" aria-hidden="true"><line x1="0" y1="4" x2="28" y2="4" stroke="#3B4B6B" strokeWidth="2" strokeDasharray="4 4" /></svg>
            Meta de economia
          </li>
        </ul>
      )}

      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(43,38,32,0.1)" />
            <XAxis dataKey="label" />
            <YAxis width={70} tickFormatter={(v: number) => formatBRL(v)} />
            <Tooltip formatter={(value) => formatBRL(typeof value === "number" ? value : 0)} />
            <Line type="monotone" dataKey="Economizado" stroke="#5B7F5E" strokeWidth={2} />
            <Line type="monotone" dataKey="Meta" stroke="#3B4B6B" strokeWidth={2} strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}