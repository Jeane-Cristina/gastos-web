const BASE_URL = `${import.meta.env.VITE_API_URL}/expenses`;

export interface Expense {
    id?: number;
    description: string;
    amount: number;
    category: string;
    date: string;
}

export interface ExpenseFilters {
    month?: number;
    year?: number;
    category?: string;
}

export interface ExpenseFilters {
  month?: number;
  year?: number;
  category?: string;
  week?: number;
}

function authHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

const AUTH_URL = `${import.meta.env.VITE_API_URL}/auth`;

export async function login(username: string, password: string): Promise<{ token: string; refreshToken: string }> {
  const res = await fetch(`${AUTH_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Usuário ou senha inválidos");
  return res.json();
}

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  const res = await fetch(`${AUTH_URL}/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(refreshToken),
  });

  if (!res.ok) return null;
  const data = await res.json();
  localStorage.setItem("token", data.token);
  localStorage.setItem("refreshToken", data.refreshToken);
  return data.token;
}

export async function getExpenses(filters: ExpenseFilters = {}): Promise<Expense[]> {
    const params = new URLSearchParams();
    if (filters.month) params.append("month", String(filters.month));
    if (filters.year) params.append("year", String(filters.year));
    if (filters.category) params.append("category", filters.category);
    if (filters.week) params.append("week", String(filters.week));

    const url = params.toString() ? `${BASE_URL}?${params.toString()}` : BASE_URL;
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error("Erro ao buscar despesas");
    return res.json();
}

export async function createExpense(expense: Expense): Promise<Expense> {
    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(expense),
    });
    if (!res.ok) throw new Error("Erro ao criar despesa");
    return res.json();
}

export async function getSummary(): Promise<{ category: string; total: number }[]> {
    const res = await fetch(`${BASE_URL}/summary`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Erro ao buscar resumo");
    return res.json();
}

export async function updateExpense(id: number, expense: Expense): Promise<void> {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(expense),
    });
    if (!res.ok) throw new Error("Erro ao atualizar despesa");
}

export async function deleteExpense(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Erro ao excluir despesa");
}

export async function register(username: string, password: string): Promise<string> {
    const res = await fetch(`${AUTH_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    if (res.status === 409) throw new Error("Esse usuário já existe.");
    if (!res.ok) throw new Error("Não foi possível criar a conta.");

    const data = await res.json();
    return data.token;
}