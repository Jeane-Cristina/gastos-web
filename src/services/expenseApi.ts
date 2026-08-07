const BASE_URL = `${import.meta.env.VITE_API_URL}/expenses`;

export interface Expense {
    id?: number;
    description: string;
    amount: number;
    category: string;
    date: string;
    paidBy?: string;
    paid?: boolean;
}

export interface ExpenseFilters {
  month?: number;
  year?: number;
  category?: string;
  week?: number;
  paidBy?: string;
  paid?: boolean;
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

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export async function getExpenses(filters: ExpenseFilters = {}, page: number = 1, pageSize: number = 20): Promise<PagedResult<Expense>> {
  const params = new URLSearchParams();
  if (filters.month) params.append("month", String(filters.month));
  if (filters.year) params.append("year", String(filters.year));
  if (filters.category) params.append("category", filters.category);
  if (filters.week) params.append("week", String(filters.week));
  if (filters.paidBy) params.append("paidBy", filters.paidBy);
  if (filters.paid !== undefined) params.append("paid", String(filters.paid));
  params.append("page", String(page));
  params.append("pageSize", String(pageSize));

  const url = `${BASE_URL}?${params.toString()}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (res.status === 401) throw new Error("Sessão expirada. Faça login novamente.");
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

export async function getSummary(filters: ExpenseFilters = {}): Promise<{ category: string; total: number }[]> {
  const params = new URLSearchParams();
  if (filters.month) params.append("month", String(filters.month));
  if (filters.year) params.append("year", String(filters.year));
  if (filters.category) params.append("category", filters.category);
  if (filters.week) params.append("week", String(filters.week));
  if (filters.paidBy) params.append("paidBy", filters.paidBy);
  if (filters.paid !== undefined) params.append("paid", String(filters.paid));

  const url = `${BASE_URL}/summary?${params.toString()}`;
  const res = await fetch(url, { headers: authHeaders() });
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

  if (res.status === 400) {
    const data = await res.json();
    const firstError = data.errors ? Object.values(data.errors)[0] : null;
    const message = Array.isArray(firstError) ? firstError[0] : "Dados inválidos.";
    throw new Error(message as string);
  }

  if (!res.ok) throw new Error("Não foi possível criar a conta.");

  const data = await res.json();
  return data.token;
}

export async function forgotPassword(username: string): Promise<void> {
  await fetch(`${AUTH_URL}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const res = await fetch(`${AUTH_URL}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message ?? "Erro ao redefinir senha.");
  }
}