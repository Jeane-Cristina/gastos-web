import { useState, useEffect } from "react";
import { getExpenses, createExpense, updateExpense, deleteExpense, type Expense, type ExpenseFilters } from "../services/expenseApi";

export function useExpenses(filters: ExpenseFilters, isAuthenticated: boolean) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        try {
            const data = await getExpenses(filters);
            setExpenses(data);
            setError(null);
        } catch (err) {
            setError("Não foi possível carregar as despesas.");
        } finally {
            setLoading(false);
        }
    }

    async function add(expense: Expense) {
        await createExpense(expense);
        await load();
    }

    async function edit(id: number, expense: Expense) {
        await updateExpense(id, expense);
        await load();
    }

    async function remove(id: number) {
        await deleteExpense(id);
        await load();
    }

    useEffect(() => {
        if (isAuthenticated) {
            load();
        }
    }, [filters.month, filters.year, filters.category, isAuthenticated]);

    return { expenses, loading, error, add, edit, remove, reload: load };
}