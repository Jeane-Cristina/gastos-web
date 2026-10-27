import { useState } from "react";
import { AuthError, login, startDemo } from "../services/expenseApi";
import { clearDemoMode, storeSession } from "../services/session";
import "./LoginForm.css";

interface Props {
  onLoginSuccess: () => void;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
  /** Aviso mostrado acima do formulário (por exemplo, "sua sessão expirou"). */
  notice?: string | null;
}

export function LoginForm({ onLoginSuccess, onSwitchToRegister, onForgotPassword, notice }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  function messageFor(err: unknown): string {
    if (err instanceof AuthError) {
      if (err.status === 429) return "Muitas tentativas. Aguarde 1 minuto e tente de novo.";
      if (err.status === 401) return "Usuário ou senha inválidos.";
      return err.message;
    }
    return "Não foi possível conectar ao servidor. Ele pode estar acordando; tente de novo em instantes.";
  }

  async function handleDemo() {
    setError(null);
    setDemoLoading(true);
    try {
      await startDemo();
      onLoginSuccess();
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setDemoLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, refreshToken } = await login(username, password);
      storeSession(token, refreshToken);
      clearDemoMode();
      onLoginSuccess();
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1 className="login-card__brand">Gastos</h1>
        <p className="login-card__subtitle">entre para acessar seus lançamentos</p>
        {notice && <p className="login-card__notice" role="status">{notice}</p>}
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuário" required autoFocus />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" type="password" required />
        <button type="button" onClick={onForgotPassword} className="login-card__link login-card__forgot">
          Esqueci minha senha
        </button>
        <button className="login-card__submit" type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
        {error && <p className="login-card__error">{error}</p>}
        <button type="button" onClick={onSwitchToRegister} className="login-card__link">
          Criar conta
        </button>
        <button type="button" onClick={handleDemo} disabled={demoLoading || loading} className="login-card__demo">
          {demoLoading ? "Preparando a demonstração..." : "Ver demonstração (sem cadastro)"}
        </button>
      </form>
    </div>
  );
}