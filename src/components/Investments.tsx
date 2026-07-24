import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import "./Investments.css";

interface Investment {
  id?: number;
  name: string;
  type: string;
  amountInvested: number;
  currentValue: number;
  annualReturnRate: number;
  riskProfile: string;
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export function Investments() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("Renda Fixa");
  const [amountInvested, setAmountInvested] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [returnRate, setReturnRate] = useState("");
  const [riskProfile, setRiskProfile] = useState("Moderado");
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const url = `${import.meta.env.VITE_API_URL}/investment`;

  function load() {
    fetch(url, { headers: authHeaders() }).then((r) => r.json()).then(setInvestments);
  }

  useEffect(load, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await fetch(url, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        name,
        type,
        amountInvested: parseFloat(amountInvested),
        currentValue: parseFloat(currentValue),
        annualReturnRate: parseFloat(returnRate) || 0,
        riskProfile,
      }),
    });
    setName("");
    setAmountInvested("");
    setCurrentValue("");
    setReturnRate("");
    load();
  }

  async function handleDelete(id?: number) {
    if (!id) return;
    await fetch(`${url}/${id}`, { method: "DELETE", headers: authHeaders() });
    load();
  }

  async function handleGetSuggestions() {
    setLoadingSuggestions(true);
    try {
      const res = await fetch(`${url}/suggestions`, { headers: authHeaders() });
      const data = await res.json();
      setSuggestions(data.suggestions);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  const totalInvested = investments.reduce((sum, i) => sum + i.amountInvested, 0);
  const totalCurrent = investments.reduce((sum, i) => sum + i.currentValue, 0);

  return (
    <div className="investments">
      <h2>Meus investimentos</h2>

      {investments.length > 0 && (
        <div className="investments__summary">
          <span>Total investido: R$ {totalInvested.toFixed(2)}</span>
          <span>Valor atual: R$ {totalCurrent.toFixed(2)}</span>
          <span className={totalCurrent >= totalInvested ? "investments__gain" : "investments__loss"}>
            {totalCurrent >= totalInvested ? "▲" : "▼"} R$ {Math.abs(totalCurrent - totalInvested).toFixed(2)}
          </span>
        </div>
      )}

      <form className="investments__form" onSubmit={handleAdd}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome (ex: Tesouro Selic)" required />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option>Renda Fixa</option>
          <option>Renda Variável</option>
          <option>Fundo</option>
          <option>Cripto</option>
          <option>Outro</option>
        </select>
        <input type="number" step="0.01" value={amountInvested} onChange={(e) => setAmountInvested(e.target.value)} placeholder="Valor investido" required />
        <input type="number" step="0.01" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} placeholder="Valor atual" required />
        <input type="number" step="0.01" value={returnRate} onChange={(e) => setReturnRate(e.target.value)} placeholder="Rentabilidade anual (%)" />
        <select value={riskProfile} onChange={(e) => setRiskProfile(e.target.value)}>
          <option>Conservador</option>
          <option>Moderado</option>
          <option>Arrojado</option>
        </select>
        <button type="submit">Adicionar</button>
      </form>

      <ul className="investments__list">
        {investments.map((inv) => (
          <li key={inv.id}>
            <span>{inv.name} ({inv.type}) — R$ {inv.currentValue.toFixed(2)}</span>
            <button onClick={() => handleDelete(inv.id)}>excluir</button>
          </li>
        ))}
      </ul>

      <button className="investments__suggest-btn" onClick={handleGetSuggestions} disabled={loadingSuggestions}>
        {loadingSuggestions ? "Analisando..." : "Obter sugestões da IA"}
      </button>

      {suggestions && (
        <div className="investments__suggestions">
          <p className="investments__disclaimer">
            ⚠️ Sugestões educacionais gerais, sem dados de mercado em tempo real. Não substitui consultoria financeira certificada.
          </p>
          <ReactMarkdown>{suggestions}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}