import { useState } from "react";
import { login } from "../services/expenseApi";
import "./LoginForm.css";

interface Props {
  onLoginSuccess: () => void;
  onSwitchToRegister: () => void;
}

export function LoginForm({ onLoginSuccess, onSwitchToRegister }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const { token, refreshToken } = await login(username, password);
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      onLoginSuccess();
    } catch (err) {
      setError("Usuário ou senha inválidos.");
    }
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1 className="login-card__brand">Gastos</h1>
        <p className="login-card__subtitle">entre para acessar seus lançamentos</p>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuário" required autoFocus />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" type="password" required />
        <button className="login-card__submit" type="submit">Entrar</button>
        {error && <p className="login-card__error">{error}</p>}
        <button type="button" onClick={onSwitchToRegister} className="login-card__link">
          Criar conta
        </button>
      </form>
    </div>
  );
}