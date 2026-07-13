import type { ExpenseFilters } from "../services/expenseApi";
import "./ExpenseFilters.css";

interface Props {
    filters: ExpenseFilters;
    onChange: (filters: ExpenseFilters) => void;
    availableCategories: string[];
}

const MONTHS = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function ExpenseFiltersBar({ filters, onChange, availableCategories }: Props) {
    return (
        <div className="filters">
            <select
                value={filters.month ?? ""}
                onChange={(e) => onChange({ ...filters, month: e.target.value ? Number(e.target.value) : undefined })}
            >
                <option value="">Todos os meses</option>
                {MONTHS.map((name, index) => (
                    <option key={name} value={index + 1}>{name}</option>
                ))}
            </select>

            <select
                value={filters.category ?? ""}
                onChange={(e) => onChange({ ...filters, category: e.target.value || undefined })}
            >
                <option value="">Todas as categorias</option>
                {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>

            {(filters.month || filters.category) && (
                <button type="button" onClick={() => onChange({})}>Limpar filtros</button>
            )}
        </div>
    );
}