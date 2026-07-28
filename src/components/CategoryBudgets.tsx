import { useState, useEffect } from "react";
import "./CategoryBudgets.css";

interface BudgetStatus {
  category: string;
  monthlyLimit: number;
  spent: number;
  percent: number;
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

function statusColor(percent: number): string {
  if (percent >= 100) return "var(--rust)";
  if (percent >= 80) return "#C99A3E";
  return "var(--sage)";
}

export function CategoryBudgets() {
  const [statuses, setStatuses] = useState<BudgetStatus[]>([]);
  const [category, setCategory] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState("");

  const baseUrl = `${import.meta.env.VITE_API_URL}/categorybudget`;

  function load() {
    fetch(`${baseUrl}/status`, { headers: authHeaders() }).then((r) => r.json()).then(setStatuses);
  }

  useEffect(load, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await fetch(baseUrl, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ category, monthlyLimit: parseFloat(monthlyLimit) }),
    });
    setCategory("");
    setMonthlyLimit("");
    load();
  }

  return (
    <div className="category-budgets">
      <h2>Orçamento por categoria</h2>
      <form className="category-budgets__form" onSubmit={handleAdd}>
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Categoria" required />
        <input type="number" step="0.01" value={monthlyLimit} onChange={(e) => setMonthlyLimit(e.target.value)} placeholder="Limite mensal" required />
        <button type="submit">Adicionar</button>
      </form>

      <div className="category-budgets__list">
        {statuses.map((s) => (
          <div key={s.category} className="category-budgets__item">
            <div className="category-budgets__item-header">
              <span>{s.category}</span>
              <span>R$ {s.spent.toFixed(2)} / R$ {s.monthlyLimit.toFixed(2)}</span>
            </div>
            <div className="category-budgets__bar-track">
              <div
                className="category-budgets__bar-fill"
                style={{ width: `${Math.min(100, s.percent)}%`, backgroundColor: statusColor(s.percent) }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}