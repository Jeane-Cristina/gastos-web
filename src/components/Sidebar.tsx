import "./Sidebar.css";

export type View = "lancamentos" | "metas";

interface Props {
  active: View;
  onChange: (view: View) => void;
}

export function Sidebar({ active, onChange }: Props) {
  return (
    <nav className="sidebar">
      <button
        className={`sidebar__item ${active === "lancamentos" ? "sidebar__item--active" : ""}`}
        onClick={() => onChange("lancamentos")}
      >
        Lançamentos
      </button>
      <button
        className={`sidebar__item ${active === "metas" ? "sidebar__item--active" : ""}`}
        onClick={() => onChange("metas")}
      >
        Metas & Insights
      </button>
    </nav>
  );
}