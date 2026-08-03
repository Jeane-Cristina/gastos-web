import { useState } from "react";
import "./OnboardingBanner.css";

interface Props {
  onNavigate: (view: "importar" | "metas") => void;
}

export function OnboardingBanner({ onNavigate }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="onboarding-banner">
      <button className="onboarding-banner__close" onClick={() => setDismissed(true)} aria-label="Fechar">
        ×
      </button>
      <h3>Bem-vindo(a)! Primeiros passos</h3>
      <ol className="onboarding-banner__steps">
        <li>
          Cadastre sua primeira despesa usando o formulário acima, ou{" "}
          <button className="onboarding-banner__link" onClick={() => onNavigate("importar")}>
            importe um extrato bancário
          </button>
        </li>
        <li>
          Configure seu{" "}
          <button className="onboarding-banner__link" onClick={() => onNavigate("metas")}>
            perfil financeiro e metas
          </button>{" "}
          para receber insights personalizados
        </li>
        <li>Depois de uma semana de uso, gere seu primeiro insight de IA na aba Assistente</li>
      </ol>
    </div>
  );
}