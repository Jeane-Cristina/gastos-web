import "./DemoBanner.css";

interface Props {
  onExit: () => void;
}

export function DemoBanner({ onExit }: Props) {
  return (
    <div className="demo-banner" role="status" data-testid="demo-banner">
      <span>
        Você está na <strong>conta demonstração</strong> com dados fictícios. Ela é apagada em 24 h e a IA mostra só um exemplo pronto.
      </span>
      <button type="button" onClick={onExit}>
        Sair e criar conta
      </button>
    </div>
  );
}
