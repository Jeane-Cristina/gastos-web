import { useTheme } from "../hooks/useTheme";
import "./TopBar.css";
import { StreakBadge } from "./StreakBadge";
import { GuardaiLogo } from "./Logo";

interface Props {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: Props) {
  const { theme, toggle } = useTheme();

  return (
    <header className="topbar">
      <span className="topbar__brand"><GuardaiLogo size={26} /></span>
      <StreakBadge />
      <div className="topbar__actions">
        <button className="topbar__theme" onClick={toggle} aria-label="Alternar tema" style={{border:"none"}}>
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        <button className="topbar__menu" onClick={onMenuClick} aria-label="Abrir menu">
          ☰
        </button>
      </div>
    </header>
  );
}