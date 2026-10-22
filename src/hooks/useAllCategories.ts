import { useState, useEffect } from "react";
import { getExpenses } from "../services/expenseApi";

export function useAllCategories(refreshKey: number = 0) {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    getExpenses({}, 1, 1000)
      .then((result) => {
        const unique = Array.from(new Set(result.items.map((e) => e.category))).sort((a, b) => a.localeCompare(b, "pt-BR"));
        setCategories(unique);
      })
      .catch(() => setCategories([]));
  }, [refreshKey]);

  return categories;
}
