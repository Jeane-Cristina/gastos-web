import { useState } from "react";
import "./Sidebar.css";

export type View = "lancamentos" | "metas";

interface Props {
  active: View;
  onChange: (view: View) => void;
}

export function Sidebar({ active, onChange }: Props) {
  const [open, setOpen] = useState(false);

  function handleSelect(view: View) {
    onChange(view);
    setOpen(false);
  }

  return (
    <>
      <button className="sidebar__toggle" onClick={() => setOpen(true)} aria-label="Abrir menu">
        ☰
      </button>

      {open && <div className="sidebar__overlay" onClick={() => setOpen(false)} />}

      <nav className={`sidebar ${open ? "sidebar--open" : ""}`}>
        <button className="sidebar__close" onClick={() => setOpen(false)} aria-label="Fechar menu">
          ×
        </button>
        <button
          className={`sidebar__item ${active === "lancamentos" ? "sidebar__item--active" : ""}`}
          onClick={() => handleSelect("lancamentos")}
        >
          Lançamentos
        </button>
        <button
          className={`sidebar__item ${active === "metas" ? "sidebar__item--active" : ""}`}
          onClick={() => handleSelect("metas")}
        >
          Metas & Insights
        </button>
      </nav>
    </>
  );
}