import { useState, useEffect } from "react";
import type { Expense } from "../services/expenseApi";
import "./ExpenseForm.css";

interface Props {
    onAdd: (expense: Expense) => void;
    editingExpense?: Expense | null;
    onCancelEdit?: () => void;
}

export function ExpenseForm({ onAdd, editingExpense, onCancelEdit }: Props) {
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [paidBy, setPaidBy] = useState("");
    const [paid, setPaid] = useState("");

    useEffect(() => {
        if (editingExpense) {
            setDescription(editingExpense.description);
            setAmount(String(editingExpense.amount));
            setCategory(editingExpense.category);
            setDate(editingExpense.date.split("T")[0]);
            setPaidBy(editingExpense.paidBy ?? "");
            setPaid(editingExpense.paid === undefined ? "" : String(editingExpense.paid));
        }
    }, [editingExpense]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onAdd({
        description,
        amount: parseFloat(amount),
        category,
        date: new Date(date).toISOString(),
        paidBy: paidBy.trim() || undefined,
        paid: paid === "" ? undefined : paid === "true",
        });
        setDescription("");
        setAmount("");
        setCategory("");
        setPaidBy("");
        setPaid("");
    }

    return (
        <form className="expense-form" onSubmit={handleSubmit}>
            <div className="expense-form__row">
                <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição" required />
                <input value={date} onChange={(e) => setDate(e.target.value)} type="date" required />
            </div>
            <div className="expense-form__row">
                <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Valor" type="number" step="0.01" required />
                <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Categoria" required />
            </div>
            <div className="expense-form__row">
                <input value={paidBy} onChange={(e) => setPaidBy(e.target.value)} placeholder="Pago por (opcional)" />
                <select value={paid} onChange={(e) => setPaid(e.target.value)}>
                    <option value="">Status (opcional)</option>
                    <option value="true">Pago</option>
                    <option value="false">Não pago</option>
                </select>
            </div>
            <div className="expense-form__actions">
                <button className="expense-form__submit" type="submit">
                    {editingExpense ? "Salvar edição" : "Adicionar"}
                </button>
                {editingExpense && onCancelEdit && (
                    <button className="expense-form__cancel" type="button" onClick={onCancelEdit}>
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    );
}