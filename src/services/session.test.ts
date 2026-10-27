import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bootstrapSession, createAuthFetch, logout, SESSION_EXPIRED_EVENT, storeSession } from "./session";

const API = "http://api.test/api";

function jwt(expSeconds: number): string {
  const encode = (value: object) => btoa(JSON.stringify(value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${encode({ alg: "HS256" })}.${encode({ exp: expSeconds })}.assinatura`;
}

const inOneHour = () => Math.floor(Date.now() / 1000) + 3600;
const anHourAgo = () => Math.floor(Date.now() / 1000) - 3600;

function json(status: number, body: unknown = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("session", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubEnv("VITE_API_URL", API);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  describe("createAuthFetch", () => {
    it("não mexe em chamadas para fora da API", async () => {
      const base = vi.fn().mockResolvedValue(json(401));

      const res = await createAuthFetch(base as unknown as typeof fetch)("https://outro.site/x");

      expect(res.status).toBe(401);
      expect(base).toHaveBeenCalledTimes(1);
    });

    it("em 401 renova o token e repete a requisição com o token novo", async () => {
      storeSession("token-velho", "refresh-1");
      const base = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        if (String(input).endsWith("/auth/refresh")) return json(200, { token: "token-novo", refreshToken: "refresh-2" });
        return new Headers(init?.headers).get("Authorization") === "Bearer token-novo" ? json(200, { ok: true }) : json(401);
      });

      const res = await createAuthFetch(base as unknown as typeof fetch)(`${API}/expenses`, {
        headers: { Authorization: "Bearer token-velho" },
      });

      expect(res.status).toBe(200);
      expect(localStorage.getItem("token")).toBe("token-novo");
      expect(localStorage.getItem("refreshToken")).toBe("refresh-2");
    });

    it("quando o servidor recusa o refresh, limpa a sessão e avisa o App", async () => {
      storeSession("token-velho", "refresh-1");
      const listener = vi.fn();
      window.addEventListener(SESSION_EXPIRED_EVENT, listener);
      const base = vi.fn(async () => json(401));

      const res = await createAuthFetch(base as unknown as typeof fetch)(`${API}/expenses`);

      window.removeEventListener(SESSION_EXPIRED_EVENT, listener);
      expect(res.status).toBe(401);
      expect(listener).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem("token")).toBeNull();
      expect(localStorage.getItem("refreshToken")).toBeNull();
    });

    it("se não conseguiu falar com o servidor no refresh, mantém a sessão", async () => {
      storeSession("token-velho", "refresh-1");
      const listener = vi.fn();
      window.addEventListener(SESSION_EXPIRED_EVENT, listener);
      const base = vi.fn(async (input: RequestInfo | URL) => {
        if (String(input).endsWith("/auth/refresh")) throw new TypeError("Failed to fetch");
        return json(401);
      });

      await createAuthFetch(base as unknown as typeof fetch)(`${API}/expenses`);

      window.removeEventListener(SESSION_EXPIRED_EVENT, listener);
      expect(listener).not.toHaveBeenCalled();
      expect(localStorage.getItem("token")).toBe("token-velho");
    });

    it("várias requisições com 401 ao mesmo tempo fazem uma única renovação", async () => {
      storeSession("token-velho", "refresh-1");
      let refreshCalls = 0;
      const base = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        if (String(input).endsWith("/auth/refresh")) {
          refreshCalls++;
          return json(200, { token: "token-novo", refreshToken: "refresh-2" });
        }
        return new Headers(init?.headers).get("Authorization") === "Bearer token-novo" ? json(200) : json(401);
      });
      const authFetch = createAuthFetch(base as unknown as typeof fetch);

      const [a, b, c] = await Promise.all([
        authFetch(`${API}/expenses`),
        authFetch(`${API}/goal/report`),
        authFetch(`${API}/insight/latest`),
      ]);

      expect([a.status, b.status, c.status]).toEqual([200, 200, 200]);
      expect(refreshCalls).toBe(1);
    });

    it("401 em /auth/* (senha errada) nunca dispara renovação", async () => {
      storeSession("token", "refresh-1");
      const base = vi.fn(async () => json(401));

      const res = await createAuthFetch(base as unknown as typeof fetch)(`${API}/auth/login`, { method: "POST" });

      expect(res.status).toBe(401);
      expect(base).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem("token")).toBe("token");
    });

    it("se mesmo com o token novo a API responde 401, encerra a sessão", async () => {
      storeSession("token-velho", "refresh-1");
      const listener = vi.fn();
      window.addEventListener(SESSION_EXPIRED_EVENT, listener);
      const base = vi.fn(async (input: RequestInfo | URL) =>
        String(input).endsWith("/auth/refresh") ? json(200, { token: "novo", refreshToken: "refresh-2" }) : json(401));

      await createAuthFetch(base as unknown as typeof fetch)(`${API}/expenses`);

      window.removeEventListener(SESSION_EXPIRED_EVENT, listener);
      expect(listener).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem("token")).toBeNull();
    });
  });

  describe("bootstrapSession", () => {
    it("sem nada guardado, vai para o Login sem aviso", async () => {
      expect(await bootstrapSession()).toBe("anonymous");
    });

    it("token ainda válido entra direto, sem chamar a API", async () => {
      storeSession(jwt(inOneHour()), "refresh-1");
      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);

      expect(await bootstrapSession()).toBe("authenticated");
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("token vencido e sem refresh token: vai para o Login e limpa tudo", async () => {
      storeSession(jwt(anHourAgo()));

      expect(await bootstrapSession()).toBe("expired");
      expect(localStorage.getItem("token")).toBeNull();
    });

    it("token vencido com refresh válido: renova e entra", async () => {
      storeSession(jwt(anHourAgo()), "refresh-1");
      vi.stubGlobal("fetch", vi.fn(async () => json(200, { token: "token-novo", refreshToken: "refresh-2" })));

      expect(await bootstrapSession()).toBe("authenticated");
      expect(localStorage.getItem("token")).toBe("token-novo");
    });

    it("token vencido com refresh recusado (passou dos 7 dias): vai para o Login", async () => {
      storeSession(jwt(anHourAgo()), "refresh-velho");
      vi.stubGlobal("fetch", vi.fn(async () => json(401)));

      expect(await bootstrapSession()).toBe("expired");
      expect(localStorage.getItem("token")).toBeNull();
      expect(localStorage.getItem("refreshToken")).toBeNull();
    });

    it("sem conseguir falar com o servidor, vai para o Login mas guarda a sessão para tentar depois", async () => {
      storeSession(jwt(anHourAgo()), "refresh-1");
      vi.stubGlobal("fetch", vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }));

      expect(await bootstrapSession()).toBe("unreachable");
      expect(localStorage.getItem("refreshToken")).toBe("refresh-1");
    });
  });

  describe("logout", () => {
    it("limpa token, refresh token e modo demo, e avisa o servidor", () => {
      storeSession("token", "refresh-1");
      localStorage.setItem("demoMode", "1");
      const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
      vi.stubGlobal("fetch", fetchMock);

      logout();

      expect(localStorage.getItem("token")).toBeNull();
      expect(localStorage.getItem("refreshToken")).toBeNull();
      expect(localStorage.getItem("demoMode")).toBeNull();
      expect(String(fetchMock.mock.calls[0][0])).toBe(`${API}/auth/logout`);
    });
  });
});
