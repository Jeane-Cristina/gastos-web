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
    const biggest = Math.max(...data.map((item) => item.total), 1);

    return (
        <div className="summary">
            <div className="summary__head">
                <p className="summary__title">Resumo por categoria</p>
                <p className="summary__total">
                    <span>Total</span> <strong>{formatBRL(totalGeral)}</strong>
                </p>
            </div>
            <div className="summary__rows">
                {data.map((item) => (
                    <div className="summary__row" key={item.category}>
                        <span className="summary__name">{item.category}</span>
                        <span className="summary__value">{formatBRL(item.total)}</span>
                        <span className="summary__bar" aria-hidden="true">
                            <span style={{ width: `${(item.total / biggest) * 100}%` }} />
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
