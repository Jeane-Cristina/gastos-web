import { useState, useEffect } from "react";
import {
  getMyAccounts, getPendingInvites, createAccount, inviteMember, respondInvite,
  getExpenses, createExpense, getContributions, getCategorySummary,
  type JointAccount, type Invite, type JointExpense, type Contribution,
} from "../services/jointAccountApi";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import "./JointAccounts.css";

const COLORS = ["#3B4B6B", "#5B7F5E", "#A6402F", "#C99A3E"];

export function JointAccounts() {
  const [accounts, setAccounts] = useState<JointAccount[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [newAccountName, setNewAccountName] = useState("");
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [expenses, setExpenses] = useState<JointExpense[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [categorySummary, setCategorySummary] = useState<{ category: string; total: number }[]>([]);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  function loadAccounts() {
    getMyAccounts().then(setAccounts);
    getPendingInvites().then(setInvites);
  }

  useEffect(loadAccounts, []);

  function loadAccountDetails(id: number) {
    getExpenses(id).then(setExpenses);
    getContributions(id).then(setContributions);
    getCategorySummary(id).then(setCategorySummary);
  }

  useEffect(() => {
    if (selectedId) loadAccountDetails(selectedId);
  }, [selectedId]);

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    await createAccount(newAccountName);
    setNewAccountName("");
    loadAccounts();
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setInviteError(null);
    const result = await inviteMember(selectedId, inviteUsername);
    if (!result.ok) {
      setInviteError(result.message ?? "Erro ao convidar.");
      return;
    }
    setInviteUsername("");
  }

  async function handleRespond(memberId: number, accept: boolean) {
    await respondInvite(memberId, accept);
    loadAccounts();
  }

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    await createExpense(selectedId, {
      description,
      amount: parseFloat(amount),
      category,
      date: new Date(date).toISOString(),
    });
    setDescription("");
    setAmount("");
    setCategory("");
    loadAccountDetails(selectedId);
  }

  const selectedAccount = accounts.find((a) => a.id === selectedId);
  const categoryChartData = categorySummary.map((c) => ({ name: c.category, value: c.total }));

  return (
    <div className="joint-accounts">
      <h2>Contas Conjuntas</h2>

      {invites.length > 0 && (
        <div className="joint-accounts__invites">
          <h3>Convites pendentes</h3>
          {invites.map((inv) => (
            <div key={inv.memberId} className="joint-accounts__invite-item">
              <span>Você foi convidado(a) para "{inv.accountName}"</span>
              <button onClick={() => handleRespond(inv.memberId, true)}>Aceitar</button>
              <button onClick={() => handleRespond(inv.memberId, false)}>Recusar</button>
            </div>
          ))}
        </div>
      )}

      <div className="joint-accounts__layout">
        <div className="joint-accounts__sidebar">
          <form onSubmit={handleCreateAccount} className="joint-accounts__new-form">
            <input value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} placeholder="Nome da conta (ex: Casa)" required />
            <button type="submit">Criar</button>
          </form>

          <ul className="joint-accounts__list">
            {accounts.map((acc) => (
              <li key={acc.id}>
                <button
                  className={selectedId === acc.id ? "joint-accounts__item--active" : ""}
                  onClick={() => setSelectedId(acc.id)}
                >
                  {acc.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {selectedAccount && (
          <div className="joint-accounts__details">
            <h3>{selectedAccount.name}</h3>

            <form onSubmit={handleInvite} className="joint-accounts__invite-form">
              <input value={inviteUsername} onChange={(e) => setInviteUsername(e.target.value)} placeholder="Convidar por nome de usuário" required />
              <button type="submit">Convidar</button>
            </form>
            {inviteError && <p className="joint-accounts__error">{inviteError}</p>}

            <form onSubmit={handleAddExpense} className="joint-accounts__expense-form">
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição" required />
              <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Valor" required />
              <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Categoria" required />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              <button type="submit">Lançar</button>
            </form>

            <div className="joint-accounts__contributions">
              <h4>Contribuição de cada um</h4>
              {contributions.map((c) => (
                <div key={c.userId} className="joint-accounts__contribution-bar">
                  <span>{c.username}: R$ {c.totalPaid.toFixed(2)} ({c.percent.toFixed(0)}%)</span>
                  <div className="joint-accounts__bar-track">
                    <div className="joint-accounts__bar-fill" style={{ width: `${c.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {categoryChartData.length > 0 && (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={categoryChartData} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={50} outerRadius={90}>
                    {categoryChartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}

            <ul className="joint-accounts__expense-list">
              {expenses.map((e) => (
                <li key={e.id}>
                  {e.description} — R$ {e.amount.toFixed(2)} ({e.category})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}