import "./GoalsSubNav.css";

export type GoalsSubView = "perfil" | "relatorios" | "orcamento" | "assistente";

interface Props {
  active: GoalsSubView;
  onChange: (view: GoalsSubView) => void;
}

const TABS: { id: GoalsSubView; label: string }[] = [
  { id: "perfil", label: "Meu Perfil" },
  { id: "relatorios", label: "Relatórios" },
  { id: "orcamento", label: "Orçamento" },
  { id: "assistente", label: "Assistente" },
];

export function GoalsSubNav({ active, onChange }: Props) {
  return (
    <div className="goals-subnav">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`goals-subnav__tab ${active === tab.id ? "goals-subnav__tab--active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}