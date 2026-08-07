import { useState, useEffect } from "react";
import { getExpenses } from "../services/expenseApi";

export function useAllPayers() {
  const [payers, setPayers] = useState<string[]>([]);

  useEffect(() => {
    getExpenses({}, 1, 1000).then((result) => {
      const unique = Array.from(
        new Set(result.items.map((e) => e.paidBy).filter((p): p is string => !!p))
      );
      setPayers(unique);
    });
  }, []);

  return payers;
}
