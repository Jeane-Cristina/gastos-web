const PROFILE_URL = `${import.meta.env.VITE_API_URL}/financialprofile`;
const INSIGHT_URL = `${import.meta.env.VITE_API_URL}/insight`;

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

export interface FinancialProfile {
  monthlyIncome: number;
  savingsGoal: number;
  shortTermGoal: string;
  mediumTermGoal: string;
  longTermGoal: string;
}

export async function getProfile(): Promise<FinancialProfile | null> {
  const res = await fetch(PROFILE_URL, { headers: authHeaders() });
  if (!res.ok) throw new Error("Erro ao buscar perfil");
  return res.json();
}

export async function saveProfile(profile: FinancialProfile): Promise<void> {
  const res = await fetch(PROFILE_URL, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error("Erro ao salvar perfil");
}

export interface InsightResponse {
  insight: string;
  cached: boolean;
  nextAvailableAt: string;
}

export async function generateInsight(): Promise<InsightResponse> {
  const res = await fetch(`${INSIGHT_URL}/generate`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao gerar insight");
  return res.json();
}