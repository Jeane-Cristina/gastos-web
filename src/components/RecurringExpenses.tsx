import { useState, useEffect } from "react";
import "./RecurringExpenses.css";

interface RecurringExpense {
  id?: number;
  description: string;
  amount: number;
  category: string;
  dayOfMonth: number;
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export function RecurringExpenses() {
  const [items, setItems] = useState<RecurringExpense[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [dayOfMonth, setDayOfMonth] = useState("");

  const url = `${import.meta.env.VITE_API_URL}/recurringexpense`;

  function load() {
    fetch(url, { headers: authHeaders() }).then((r) => r.json()).then(setItems);
  }

  useEffect(load, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await fetch(url, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        description,
        amount: parseFloat(amount),
        category,
        dayOfMonth: parseInt(dayOfMonth, 10),
      }),
    });
    setDescription("");
    setAmount("");
    setCategory("");
    setDayOfMonth("");
    load();
  }

  async function handleDelete(id?: number) {
    if (!id) return;
    await fetch(`${url}/${id}`, { method: "DELETE", headers: authHeaders() });
    load();
  }

  return (
    <div className="recurring-expenses">
      <h2>Despesas recorrentes</h2>
      <form className="recurring-expenses__form" onSubmit={handleAdd}>
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição (ex: Netflix)" required />
        <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Valor" required />
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Categoria" required />
        <input type="number" min="1" max="31" value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} placeholder="Dia do mês" required />
        <button type="submit">Adicionar</button>
      </form>

      <ul className="recurring-expenses__list">
        {items.map((item) => (
          <li key={item.id}>
            <span>{item.description} — R$ {item.amount.toFixed(2)} ({item.category}) — todo dia {item.dayOfMonth}</span>
            <button onClick={() => handleDelete(item.id)}>excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}