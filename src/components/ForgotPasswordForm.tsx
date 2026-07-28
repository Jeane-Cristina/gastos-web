import { useState } from "react";
import { forgotPassword } from "../services/expenseApi";
import "./LoginForm.css";

interface Props {
  onBackToLogin: () => void;
}

export function ForgotPasswordForm({ onBackToLogin }: Props) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(username);
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1 className="login-card__brand">Gastos</h1>
        <p className="login-card__subtitle">recupere o acesso à sua conta</p>

        {sent ? (
          <p>Se o usuário existir, um e-mail com o link de redefinição foi enviado. Verifique também a caixa de spam.</p>
        ) : (
          <>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Usuário"
              required
              autoFocus
            />
            <button className="login-card__submit" type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar link"}
            </button>
          </>
        )}

        <button type="button" onClick={onBackToLogin} className="login-card__link">
          Voltar para o login
        </button>
      </form>
    </div>
  );
}