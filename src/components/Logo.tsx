interface MarkProps {
  size?: number;
  /** "color": azul com moeda verde. "inverse": branco com G azul, para fundos escuros. */
  variant?: "color" | "inverse";
}

/** Símbolo do Guardai: um G em anel aberto, com a moeda entrando pela abertura. */
export function GuardaiMark({ size = 28, variant = "color" }: MarkProps) {
  const inverse = variant === "inverse";
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="15" fill={inverse ? "#FFFFFF" : "#22408F"} />
      <g transform="translate(32 32) scale(1.2) translate(-32 -32)">
        <path
          d="M41 21.3A14 14 0 1 0 46 32H33.5"
          fill="none"
          stroke={inverse ? "#22408F" : "#FFFFFF"}
          strokeWidth="6.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="48.6" cy="19.6" r="3.9" fill={inverse ? "#1F9D6B" : "#7FE0AB"} />
      </g>
    </svg>
  );
}

interface LogoProps extends MarkProps {
  className?: string;
}

/** Símbolo + nome, usado na barra do topo e nas telas de acesso. */
export function GuardaiLogo({ size = 28, variant = "color", className }: LogoProps) {
  return (
    <span className={`guardai-logo ${className ?? ""}`.trim()}>
      <GuardaiMark size={size} variant={variant} />
      <span className="guardai-logo__name">guardai</span>
    </span>
  );
}
