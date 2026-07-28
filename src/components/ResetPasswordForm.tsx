import { useState, useEffect } from "react";
import { resetPassword } from "../services/expenseApi";
import "./LoginForm.css";

interface Props {
  onResetSuccess: () => void;
}

export function ResetPasswordForm({ onResetSuccess }: Props) {
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token"));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(onResetSuccess, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao redefinir senha.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <h1 className="login-card__brand">Gastos</h1>
          <p className="login-card__error">Link inválido ou incompleto. Solicite um novo link de redefinição.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1 className="login-card__brand">Gastos</h1>
        <p className="login-card__subtitle">defina sua nova senha</p>

        {success ? (
          <p>Senha alterada com sucesso! Redirecionando para o login...</p>
        ) : (
          <>
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nova senha"
              type="password"
              required
              minLength={8}
              autoFocus
            />
            <button className="login-card__submit" type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Redefinir senha"}
            </button>
            {error && <p className="login-card__error">{error}</p>}
          </>
        )}
      </form>
    </div>
  );
}