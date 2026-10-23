import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import "./Investments.css";
import { formatBRL } from "../utils/formatBRL";
import { readServerMessage } from "../utils/apiError";

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
  const [editingId, setEditingId] = useState<number | null>(null);

  const url = `${import.meta.env.VITE_API_URL}/investment`;

  function load() {
    fetch(url, { headers: authHeaders() }).then((r) => r.json()).then(setInvestments);
  }

  useEffect(load, []);

  function resetForm() {
    setEditingId(null);
    setName("");
    setType("Renda Fixa");
    setAmountInvested("");
    setCurrentValue("");
    setReturnRate("");
    setRiskProfile("Moderado");
  }

  function startEdit(inv: Investment) {
    setEditingId(inv.id ?? null);
    setName(inv.name);
    setType(inv.type);
    setAmountInvested(String(inv.amountInvested));
    setCurrentValue(String(inv.currentValue));
    setReturnRate(inv.annualReturnRate ? String(inv.annualReturnRate) : "");
    setRiskProfile(inv.riskProfile);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(editingId !== null ? `${url}/${editingId}` : url, {
      method: editingId !== null ? "PUT" : "POST",
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
    if (!res.ok) {
      alert("Não foi possível salvar o investimento. Tente novamente.");
      return;
    }
    resetForm();
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
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions);
      } else {
        setSuggestions(await readServerMessage(res, "Não foi possível gerar sugestões agora."));
      }
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
          <span>Total investido: {formatBRL(totalInvested)}</span>
          <span>Valor atual: {formatBRL(totalCurrent)}</span>
          <span className={totalCurrent >= totalInvested ? "investments__gain" : "investments__loss"}>
            {totalCurrent >= totalInvested ? "▲" : "▼"} {formatBRL(Math.abs(totalCurrent - totalInvested))}
          </span>
        </div>
      )}

      <form className="investments__form" onSubmit={handleSubmit}>
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
        <button type="submit">{editingId !== null ? "Salvar alterações" : "Adicionar"}</button>
        {editingId !== null && (
          <button type="button" onClick={resetForm}>Cancelar</button>
        )}
      </form>

      <ul className="investments__list">
        {investments.map((inv) => (
          <li key={inv.id}>
            <span>{inv.name} ({inv.type}) — {formatBRL(inv.currentValue)}</span>
            <button onClick={() => startEdit(inv)}>editar</button>
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