import "./ExpenseList.css";
import type { Expense } from "../services/expenseApi";

interface Props {
    expenses: Expense[];
    onDelete: (id: number) => void;
    onEdit: (expense: Expense) => void;
}

export function ExpenseList({ expenses, onDelete, onEdit }: Props) {
    return (
        <ul className="expense-list">
            {expenses.map((e) => (
                <li key={e.id} className="expense-item">
                    <span className="expense-item__desc">{e.description}</span>
                    <span className="expense-item__leader"></span>
                    <span className="expense-item__category">{e.category}</span>
                    <span className="expense-item__amount">R$ {e.amount.toFixed(2)}</span>
                    <span className="expense-item__actions">
                        <button className="expense-item__edit" onClick={() => onEdit(e)}>editar</button>
                        <button className="expense-item__delete" onClick={() => e.id && onDelete(e.id)}>excluir</button>
                    </span>
                </li>
            ))}
        </ul>
    );
}