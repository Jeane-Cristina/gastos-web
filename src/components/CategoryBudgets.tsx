import { useState, useEffect } from "react";
import "./CategoryBudgets.css";
import { CategoryInput } from "./CategoryInput";
import { useAllCategories } from "../hooks/useAllCategories";
import { formatBRL } from "../utils/formatBRL";

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

type BudgetLevel = "ok" | "near" | "over";

function budgetLevel(percent: number): BudgetLevel {
  if (percent >= 100) return "over";
  if (percent >= 80) return "near";
  return "ok";
}

const LEVEL_COLOR: Record<BudgetLevel, string> = {
  ok: "var(--sage)",
  near: "#C99A3E",
  over: "var(--rust)",
};

function alertText(s: { percent: number; spent: number; monthlyLimit: number }): string | null {
  const level = budgetLevel(s.percent);
  if (level === "over") return `🔴 Limite estourado em ${formatBRL(s.spent - s.monthlyLimit)}`;
  if (level === "near") return `⚠️ Atenção: ${Math.round(s.percent)}% do limite já usado`;
  return null;
}

export function CategoryBudgets() {
  const categories = useAllCategories();
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
        <CategoryInput value={category} onChange={setCategory} categories={categories} required />
        <input type="number" step="0.01" value={monthlyLimit} onChange={(e) => setMonthlyLimit(e.target.value)} placeholder="Limite mensal" required />
        <button type="submit">Adicionar</button>
      </form>

      <div className="category-budgets__list">
        {statuses.map((s) => {
          const level = budgetLevel(s.percent);
          const alert = alertText(s);
          return (
          <div key={s.category} className={`category-budgets__item category-budgets__item--${level}`}>
            <div className="category-budgets__item-header">
              <span>{s.category}</span>
              <span>{formatBRL(s.spent)} / {formatBRL(s.monthlyLimit)}</span>
            </div>
            <div className="category-budgets__bar-track">
              <div
                className="category-budgets__bar-fill"
                style={{ width: `${Math.min(100, s.percent)}%`, backgroundColor: LEVEL_COLOR[level] }}
              />
            </div>
            {alert && <p className={`category-budgets__alert category-budgets__alert--${level}`} role="status">{alert}</p>}
          </div>
          );
        })}
      </div>
    </div>
  );
}