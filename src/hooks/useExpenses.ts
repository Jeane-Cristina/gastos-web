import { useState, useEffect } from "react";
import { getExpenses, createExpense, updateExpense, deleteExpense, type Expense, type ExpenseFilters } from "../services/expenseApi";

export function useExpenses(filters: ExpenseFilters, isAuthenticated: boolean) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const result = await getExpenses(filters, page, pageSize);
      setExpenses(result.items);
      setTotalCount(result.totalCount);
      setError(null);
    } catch (err) {
      setError("Não foi possível carregar as despesas.");
    } finally {
      setLoading(false);
    }
  }

  async function add(expense: Expense) {
    await createExpense(expense);
    setPage(1);
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
  }, [filters.month, filters.year, filters.category, filters.week, filters.paidBy, page, isAuthenticated]);

  useEffect(() => {
    setPage(1);
  }, [filters.month, filters.year, filters.category, filters.week, filters.paidBy]);

  return { expenses, loading, error, add, edit, remove, reload: load, totalCount, page, setPage, pageSize };
}