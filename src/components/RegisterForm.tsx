import { useState } from "react";
import { register } from "../services/expenseApi";
import "./LoginForm.css";

interface Props {
    onRegisterSuccess: () => void;
    onSwitchToLogin: () => void;
}

export function RegisterForm({ onRegisterSuccess, onSwitchToLogin }: Props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }

        try {
            const token = await register(username, password);
            localStorage.setItem("token", token);
            onRegisterSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao criar conta.");
        }
    }

    return (
        <div className="login-screen">
            <form className="login-card" onSubmit={handleSubmit}>
                <h1 className="login-card__brand">Gastos</h1>
                <p className="login-card__subtitle">crie sua conta</p>
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuário" required autoFocus />
                <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" type="password" required minLength={6} />
                <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmar senha" type="password" required />
                <button className="login-card__submit" type="submit">Criar conta</button>
                {error && <p className="login-card__error">{error}</p>}
                <button type="button" onClick={onSwitchToLogin} className="login-card__link">
                    Já tenho conta
                </button>
            </form>
        </div>
    );
}