import { useState, useEffect } from "react";
import { getExpenses } from "../services/expenseApi";

export function useAllCategories() {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    getExpenses({}, 1, 1000).then((result) => {
      const unique = Array.from(new Set(result.items.map((e) => e.category)));
      setCategories(unique);
    });
  }, []);

  return categories;
}