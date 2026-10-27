import { isTokenExpired } from "../utils/jwt";

const TOKEN_KEY = "token";
const REFRESH_KEY = "refreshToken";
const DEMO_KEY = "demoMode";

/** Disparado quando a sessão não pode mais ser renovada; o App volta para o Login. */
export const SESSION_EXPIRED_EVENT = "session-expired";

function apiUrl(): string {
  return String(import.meta.env.VITE_API_URL);
}

// ---------- armazenamento da sessão ----------

export function storeSession(token: string, refreshToken?: string | null): void {
  localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  else localStorage.removeItem(REFRESH_KEY);
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(DEMO_KEY);
}

export function isDemoMode(): boolean {
  try {
    return localStorage.getItem(DEMO_KEY) === "1";
  } catch {
    return false;
  }
}

export function setDemoMode(): void {
  localStorage.setItem(DEMO_KEY, "1");
}

export function clearDemoMode(): void {
  localStorage.removeItem(DEMO_KEY);
}

function expireSession(): void {
  clearSession();
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

// ---------- renovação do token ----------

export type RefreshResult = { status: "ok"; token: string } | { status: "invalid" } | { status: "error" };

let inflightRefresh: Promise<RefreshResult> | null = null;

/**
 * Troca o refresh token por um novo par de tokens. Se várias requisições recebem 401 ao mesmo tempo,
 * só uma renovação acontece (o refresh token é rotativo: usar o mesmo duas vezes invalidaria a sessão).
 * "invalid" = o servidor recusou (sessão acabou); "error" = não deu para falar com o servidor.
 */
export function refreshSession(baseFetch: typeof fetch = (...args) => globalThis.fetch(...args)): Promise<RefreshResult> {
  if (!inflightRefresh) {
    inflightRefresh = doRefresh(baseFetch).finally(() => {
      inflightRefresh = null;
    });
  }
  return inflightRefresh;
}

async function doRefresh(baseFetch: typeof fetch): Promise<RefreshResult> {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return { status: "invalid" };

  try {
    const res = await baseFetch(`${apiUrl()}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(refreshToken),
    });
    if (res.status === 400 || res.status === 401) return { status: "invalid" };
    if (!res.ok) return { status: "error" };

    const data = await res.json();
    storeSession(data.token, data.refreshToken);
    return { status: "ok", token: data.token };
  } catch {
    return { status: "error" };
  }
}

// ---------- interceptador de fetch ----------

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

/** Chamadas à API que exigem login (tudo, exceto /auth/*, onde 401 significa "senha errada"). */
function isProtectedApiCall(url: string): boolean {
  const base = apiUrl();
  return url.startsWith(base) && !url.startsWith(`${base}/auth/`);
}

/**
 * Envolve o fetch: se a API responder 401, tenta renovar o token uma vez e repete a requisição.
 * Se não for possível renovar, limpa a sessão e avisa o App para voltar ao Login.
 */
export function createAuthFetch(baseFetch: typeof fetch): typeof fetch {
  return async (input, init) => {
    if (!isProtectedApiCall(requestUrl(input))) return baseFetch(input, init);

    const response = await baseFetch(input, init);
    if (response.status !== 401) return response;

    const result = await refreshSession(baseFetch);
    if (result.status === "invalid") {
      expireSession();
      return response;
    }
    if (result.status === "error") return response;

    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${result.token}`);
    const retry = await baseFetch(input, { ...init, headers });
    if (retry.status === 401) expireSession();
    return retry;
  };
}

export function installAuthInterceptor(): void {
  window.fetch = createAuthFetch(window.fetch.bind(window));
}

// ---------- abertura do app e logout ----------

export type SessionState = "authenticated" | "anonymous" | "expired" | "unreachable";

/**
 * Decide, ao abrir o app, se há uma sessão utilizável:
 * token ainda válido → entra; token vencido mas com refresh token → renova; senão → Login.
 */
export async function bootstrapSession(): Promise<SessionState> {
  const token = localStorage.getItem(TOKEN_KEY);
  const hasRefresh = !!localStorage.getItem(REFRESH_KEY);

  if (token && !isTokenExpired(token)) return "authenticated";
  if (!hasRefresh) {
    const hadSession = !!token;
    clearSession();
    return hadSession ? "expired" : "anonymous";
  }

  const result = await refreshSession();
  if (result.status === "ok") return "authenticated";
  if (result.status === "invalid") {
    clearSession();
    return "expired";
  }
  return "unreachable";
}

/** Sai da conta: limpa o navegador na hora e invalida o refresh token no servidor (sem travar a tela). */
export function logout(): void {
  const token = localStorage.getItem(TOKEN_KEY);
  clearSession();
  if (!token) return;

  fetch(`${apiUrl()}/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    keepalive: true,
  }).catch(() => {
    // sem rede: o refresh token expira sozinho em 7 dias
  });
}
