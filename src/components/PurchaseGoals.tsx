import { useState, useEffect } from "react";
import "./PurchaseGoals.css";

interface PurchaseGoal {
  id?: number;
  description: string;
  estimatedCost: number;
  priority: string;
  isEssential: boolean;
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export function PurchaseGoals() {
  const [goals, setGoals] = useState<PurchaseGoal[]>([]);
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [priority, setPriority] = useState("Média");
  const [isEssential, setIsEssential] = useState(false);

  const url = `${import.meta.env.VITE_API_URL}/purchasegoal`;

  function load() {
    fetch(url, { headers: authHeaders() }).then((r) => r.json()).then(setGoals);
  }

  useEffect(load, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await fetch(url, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ description, estimatedCost: parseFloat(cost), priority, isEssential }),
    });
    setDescription("");
    setCost("");
    setIsEssential(false);
    load();
  }

  async function handleDelete(id?: number) {
    if (!id) return;
    await fetch(`${url}/${id}`, { method: "DELETE", headers: authHeaders() });
    load();
  }

  return (
    <div className="purchase-goals">
      <h2>O que quero/preciso comprar</h2>
      <form className="purchase-goals__form" onSubmit={handleAdd}>
        <input className="purchase-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="O que é" required />
        <input type="number" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Valor estimado" required />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option>Alta</option>
          <option>Média</option>
          <option>Baixa</option>
        </select>
        <label>
          <input type="checkbox" checked={isEssential} onChange={(e) => setIsEssential(e.target.checked)} />
          É necessidade (não desejo)
        </label>
        <button type="submit">Adicionar</button>
      </form>

      <ul className="purchase-goals__list">
        {goals.map((g) => (
          <li key={g.id}>
            <span>{g.isEssential ? "🔧" : "✨"} {g.description} — R$ {g.estimatedCost.toFixed(2)} ({g.priority})</span>
            <button onClick={() => handleDelete(g.id)}>excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}