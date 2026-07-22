import "./TopBar.css";

interface Props {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: Props) {
  return (
    <header className="topbar">
      <span className="topbar__brand">Gastos</span>
      <button className="topbar__menu" onClick={onMenuClick} aria-label="Abrir menu">
        ☰
      </button>
    </header>
  );
}