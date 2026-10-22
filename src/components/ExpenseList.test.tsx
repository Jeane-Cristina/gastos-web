import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ExpenseList } from './ExpenseList';
import type { Expense } from '../services/expenseApi';

const mockExpenses: Expense[] = [
    { id: 1, description: 'Mercado', amount: 150.5, category: 'Alimentação', date: '2026-07-01' },
    { id: 2, description: 'Uber', amount: 25, category: 'Transporte', date: '2026-07-02' },
];

describe('ExpenseList', () => {
    it('renderiza todas as despesas recebidas', () => {
        render(<ExpenseList expenses={mockExpenses} onDelete={vi.fn()} onSave={vi.fn()} />);

        expect(screen.getByText('Mercado')).toBeInTheDocument();
        expect(screen.getByText('Uber')).toBeInTheDocument();
    });

    it('exibe o valor no formato de moeda brasileiro', () => {
        render(<ExpenseList expenses={mockExpenses} onDelete={vi.fn()} onSave={vi.fn()} />);

        // Intl usa espaço não separável entre "R$" e o número
        expect(screen.getByText('R$ 150,50', { normalizer: (t) => t.replace(/\u00a0/g, ' ') })).toBeInTheDocument();
        expect(screen.getByText('R$ 25,00', { normalizer: (t) => t.replace(/\u00a0/g, ' ') })).toBeInTheDocument();
    });

    it('chama onDelete com o id correto ao clicar em excluir', async () => {
        const user = userEvent.setup();
        const onDelete = vi.fn();
        render(<ExpenseList expenses={mockExpenses} onDelete={onDelete} onSave={vi.fn()} />);

        const deleteButtons = screen.getAllByText('excluir');
        await user.click(deleteButtons[0]);

        expect(onDelete).toHaveBeenCalledWith(1);
    });

    it('chama onSave com o id e a despesa ao editar e salvar', async () => {
        const user = userEvent.setup();
        const onSave = vi.fn().mockResolvedValue(undefined);
        render(<ExpenseList expenses={mockExpenses} onDelete={vi.fn()} onSave={onSave} />);

        const editButtons = screen.getAllByText('editar');
        await user.click(editButtons[1]);
        await user.click(screen.getByText('salvar'));

        expect(onSave).toHaveBeenCalledWith(2, mockExpenses[1]);
    });
});
