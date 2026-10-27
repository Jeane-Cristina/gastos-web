import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./LoginForm";

function renderForm() {
  const onLoginSuccess = vi.fn();
  render(<LoginForm onLoginSuccess={onLoginSuccess} onSwitchToRegister={vi.fn()} onForgotPassword={vi.fn()} />);
  return onLoginSuccess;
}

function mockFetch(status: number, body: unknown = {}) {
  const fn = vi.fn().mockResolvedValue({ ok: status >= 200 && status < 300, status, json: async () => body });
  vi.stubGlobal("fetch", fn);
  return fn;
}

describe("LoginForm", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it("o botão de demonstração cria a conta demo, guarda o token e entra", async () => {
    const fetchMock = mockFetch(200, { token: "demo-token", refreshToken: "demo-refresh", demo: true });
    const onLoginSuccess = renderForm();

    await userEvent.click(screen.getByRole("button", { name: /ver demonstração/i }));

    await waitFor(() => expect(onLoginSuccess).toHaveBeenCalled());
    expect(String(fetchMock.mock.calls[0][0])).toContain("/auth/demo");
    expect(localStorage.getItem("token")).toBe("demo-token");
    expect(localStorage.getItem("refreshToken")).toBe("demo-refresh");
    expect(localStorage.getItem("demoMode")).toBe("1");
  });

  it("mostra a mensagem do servidor quando a demonstração está lotada", async () => {
    mockFetch(503, { message: "A demonstração está lotada no momento." });
    renderForm();

    await userEvent.click(screen.getByRole("button", { name: /ver demonstração/i }));

    expect(await screen.findByText("A demonstração está lotada no momento.")).toBeInTheDocument();
    expect(localStorage.getItem("demoMode")).toBeNull();
  });

  it("diferencia senha errada (401) de excesso de tentativas (429)", async () => {
    mockFetch(401);
    renderForm();
    await userEvent.type(screen.getByPlaceholderText("Usuário"), "ana");
    await userEvent.type(screen.getByPlaceholderText("Senha"), "errada");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByText("Usuário ou senha inválidos.")).toBeInTheDocument();
  });

  it("avisa sobre excesso de tentativas no 429", async () => {
    mockFetch(429);
    renderForm();
    await userEvent.type(screen.getByPlaceholderText("Usuário"), "ana");
    await userEvent.type(screen.getByPlaceholderText("Senha"), "x");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByText(/muitas tentativas/i)).toBeInTheDocument();
  });

  it("explica quando o servidor não responde", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    renderForm();
    await userEvent.type(screen.getByPlaceholderText("Usuário"), "ana");
    await userEvent.type(screen.getByPlaceholderText("Senha"), "x");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByText(/não foi possível conectar/i)).toBeInTheDocument();
  });
});
