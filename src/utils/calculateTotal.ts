interface CategoryTotal {
    category: string;
    total: number;
}

export function calculateTotal(data: CategoryTotal[]): number {
    return data.reduce((sum, item) => sum + item.total, 0);
}