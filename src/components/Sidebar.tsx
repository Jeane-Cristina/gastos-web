import "./Sidebar.css";
import { useState, useEffect } from "react";

export type View = "lancamentos" | "importar" | "metas" | "investimentos";

interface Props {
  active: View;
  onChange: (view: View) => void;
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function Sidebar({ active, onChange, open, onClose, onLogout }: Props) {

    const [statusPercent, setStatusPercent] = useState<number | null>(null);

    useEffect(() => {
  const token = localStorage.getItem("token");
    fetch(`${import.meta.env.VITE_API_URL}/goal/status-summary`, {
        headers: { Authorization: `Bearer ${token}` },
    })
        .then((r) => r.json())
        .then((data) => setStatusPercent(data.monthlyGoalPercent));
    }, []);

    function statusDot(percent: number | null) {
    if (percent === null) return null;
    const color = percent >= 80 ? "#5B7F5E" : percent >= 40 ? "#C99A3E" : "#A6402F";
    return <span className="sidebar__dot" style={{ backgroundColor: color }} />;
    }

  function handleSelect(view: View) {
    onChange(view);
    onClose();
  }

  return (
    <>
      {open && <div className="sidebar__overlay" onClick={onClose} />}

      <nav className={`sidebar ${open ? "sidebar--open" : ""}`}>
        <button className="sidebar__close" onClick={onClose} aria-label="Fechar menu">
          ×
        </button>

        <button
          className={`sidebar__item ${active === "lancamentos" ? "sidebar__item--active" : ""}`}
          onClick={() => handleSelect("lancamentos")}
        >
          Lançamentos
        </button>
        <button
          className={`sidebar__item ${active === "importar" ? "sidebar__item--active" : ""}`}
          onClick={() => handleSelect("importar")}
        >
          Importar Extrato
        </button>
        <button
        className={`sidebar__item ${active === "metas" ? "sidebar__item--active" : ""}`}
        onClick={() => handleSelect("metas")}
        >
        Metas & Insights {statusDot(statusPercent)}
        </button>
        <button
            className={`sidebar__item ${active === "investimentos" ? "sidebar__item--active" : ""}`}
            onClick={() => handleSelect("investimentos")}
            >
            Investimentos
        </button>

        <div className="sidebar__spacer" />

        <button className="sidebar__logout" onClick={onLogout}>
          Sair
        </button>
      </nav>
    </>
  );
}