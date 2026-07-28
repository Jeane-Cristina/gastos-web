function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

const BASE = `${import.meta.env.VITE_API_URL}/jointaccount`;

export interface JointAccount {
  id: number;
  name: string;
  createdByUserId: number;
}

export interface Invite {
  memberId: number;
  accountName: string;
}

export interface JointExpense {
  id?: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  paidByUserId: number;
}

export interface Contribution {
  userId: number;
  username: string;
  totalPaid: number;
  percent: number;
}

export async function getMyAccounts(): Promise<JointAccount[]> {
  const res = await fetch(BASE, { headers: authHeaders() });
  return res.json();
}

export async function getPendingInvites(): Promise<Invite[]> {
  const res = await fetch(`${BASE}/invites`, { headers: authHeaders() });
  return res.json();
}

export async function createAccount(name: string): Promise<JointAccount> {
  const res = await fetch(BASE, { method: "POST", headers: authHeaders(), body: JSON.stringify({ name }) });
  return res.json();
}

export async function inviteMember(accountId: number, username: string): Promise<{ ok: boolean; message?: string }> {
  const res = await fetch(`${BASE}/${accountId}/invite`, { method: "POST", headers: authHeaders(), body: JSON.stringify({ username }) });
  if (!res.ok) {
    const data = await res.json();
    return { ok: false, message: data.message };
  }
  return { ok: true };
}

export async function respondInvite(memberId: number, accept: boolean): Promise<void> {
  await fetch(`${BASE}/invites/${memberId}/respond?accept=${accept}`, { method: "POST", headers: authHeaders() });
}

export async function getExpenses(accountId: number): Promise<JointExpense[]> {
  const res = await fetch(`${BASE}/${accountId}/expenses`, { headers: authHeaders() });
  return res.json();
}

export async function createExpense(accountId: number, expense: Omit<JointExpense, "id" | "paidByUserId">): Promise<void> {
  await fetch(`${BASE}/${accountId}/expenses`, { method: "POST", headers: authHeaders(), body: JSON.stringify(expense) });
}

export async function getContributions(accountId: number): Promise<Contribution[]> {
  const res = await fetch(`${BASE}/${accountId}/contributions`, { headers: authHeaders() });
  return res.json();
}

export async function getCategorySummary(accountId: number): Promise<{ category: string; total: number }[]> {
  const res = await fetch(`${BASE}/${accountId}/summary`, { headers: authHeaders() });
  return res.json();
}