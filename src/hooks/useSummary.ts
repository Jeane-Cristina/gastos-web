import { useState, useEffect } from "react";
import { getSummary } from "../services/expenseApi";

interface CategoryTotal {
    category: string;
    total: number;
}

export function useSummary(refreshKey: number) {
    const [summary, setSummary] = useState<CategoryTotal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getSummary()
            .then(setSummary)
            .finally(() => setLoading(false));
    }, [refreshKey]);

    return { summary, loading };
}