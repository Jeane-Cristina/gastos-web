import { useState, useEffect } from "react";
import { getExpenses } from "../services/expenseApi";

export function useAllCategories() {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    getExpenses({}).then((all) => {
      const unique = Array.from(new Set(all.map((e) => e.category)));
      setCategories(unique);
    });
  }, []);

  return categories;
}