import "./CategorySummary.css";
import { calculateTotal } from "../utils/calculateTotal";
import { formatBRL } from "../utils/formatBRL";


interface CategoryTotal {
    category: string;
    total: number;
}

interface Props {
    data: CategoryTotal[];
}

export function CategorySummary({ data }: Props) {
    if (data.length === 0) {
        return <p className="summary__empty">Nenhuma despesa cadastrada ainda.</p>;
    }

    const totalGeral = calculateTotal(data);

    return (
        <div className="summary">
            <p className="summary__title">Resumo por categoria</p>
            {data.map((item) => (
                <div className="summary__row" key={item.category}>
                    <span>{item.category}</span>
                    <span>{formatBRL(item.total)}</span>
                </div>
            ))}
            <div className="summary__total">
                <span>Total</span>
                <span>{formatBRL(totalGeral)}</span>
            </div>
        </div>
    );
}