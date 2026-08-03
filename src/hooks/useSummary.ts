import { useState, useEffect } from "react";
import { getSummary, type ExpenseFilters } from "../services/expenseApi";

interface CategoryTotal {
  category: string;
  total: number;
}

export function useSummary(filters: ExpenseFilters, refreshKey: number) {
  const [summary, setSummary] = useState<CategoryTotal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getSummary(filters)
      .then(setSummary)
      .finally(() => setLoading(false));
  }, [filters.month, filters.year, filters.category, filters.week, refreshKey]);

  return { summary, loading };
}