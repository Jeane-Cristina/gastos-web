import { useEffect, useState } from "react";
import { getExpenses } from "../services/expenseApi";

/** Quantidade de lançamentos do mês atual: base para avisar quando a "economia" está calculada com poucos dados. */
export function useMonthEntryCount(refreshKey: number = 0): number | null {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const now = new Date();
    getExpenses({ month: now.getMonth() + 1, year: now.getFullYear() }, 1, 1)
      .then((r) => setCount(r.totalCount))
      .catch(() => setCount(null));
  }, [refreshKey]);

  return count;
}
