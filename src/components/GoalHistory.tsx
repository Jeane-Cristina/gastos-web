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
    <section className="report-card">
      <h2 className="report-card__title">Histórico de metas</h2>
      <p className="goal-history__note">
        O histórico é registrado automaticamente nos dias em que você usa o app. Meses sem acesso ficam sem ponto no gráfico. Valores em reais.
      </p>
      {chartData.length === 0 && <p className="goal-history__note">Ainda não há histórico. Ele começa a aparecer após o primeiro dia de uso com o perfil financeiro preenchido.</p>}

      {chartData.length > 0 && (
        <ul className="goal-history__legend" aria-label="Legenda do gráfico">
          <li>
            <svg width="28" height="8" aria-hidden="true"><line x1="0" y1="4" x2="28" y2="4" stroke="#1F9D6B" strokeWidth="2.5" /></svg>
            Economizado no mês
          </li>
          <li>
            <svg width="28" height="8" aria-hidden="true"><line x1="0" y1="4" x2="28" y2="4" stroke="#8A94A6" strokeWidth="2" strokeDasharray="4 4" /></svg>
            Meta de economia
          </li>
        </ul>
      )}

      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" padding={{ left: 24, right: 24 }} tickLine={false} />
            <YAxis width={56} tickLine={false} axisLine={false} tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toLocaleString("pt-BR")} mil` : `${v}`)} />
            <Tooltip formatter={(value) => formatBRL(typeof value === "number" ? value : 0)} />
            <Line type="monotone" dataKey="Economizado" stroke="#1F9D6B" strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Meta" stroke="#8A94A6" strokeWidth={2} strokeDasharray="4 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}