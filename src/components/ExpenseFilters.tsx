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

            <select
                value={filters.week ?? ""}
                onChange={(e) => onChange({ ...filters, week: e.target.value ? Number(e.target.value) : undefined })}
                >
                <option value="">Todas as semanas</option>
                <option value="1">Semana 1 (dias 1-7)</option>
                <option value="2">Semana 2 (dias 8-14)</option>
                <option value="3">Semana 3 (dias 15-21)</option>
                <option value="4">Semana 4 (dias 22+)</option>
            </select>

            {(filters.month || filters.category) && (
                <button type="button" onClick={() => onChange({})}>Limpar filtros</button>
            )}
        </div>
    );
}