import { useTheme } from "../hooks/useTheme";

interface Props {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: Props) {
  const { theme, toggle } = useTheme();

  return (
    <header className="topbar">
      <span className="topbar__brand">Gastos</span>
      <div className="topbar__actions">
        <button className="topbar__theme" onClick={toggle} aria-label="Alternar tema">
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        <button className="topbar__menu" onClick={onMenuClick} aria-label="Abrir menu">
          ☰
        </button>
      </div>
    </header>
  );
}