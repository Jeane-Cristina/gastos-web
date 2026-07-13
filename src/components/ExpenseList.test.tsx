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
        render(<ExpenseList expenses={mockExpenses} onDelete={vi.fn()} onEdit={vi.fn()} />);

        expect(screen.getByText('Mercado')).toBeInTheDocument();
        expect(screen.getByText('Uber')).toBeInTheDocument();
    });

    it('exibe o valor formatado com duas casas decimais', () => {
        render(<ExpenseList expenses={mockExpenses} onDelete={vi.fn()} onEdit={vi.fn()} />);

        expect(screen.getByText('R$ 150.50')).toBeInTheDocument();
        expect(screen.getByText('R$ 25.00')).toBeInTheDocument();
    });

    it('chama onDelete com o id correto ao clicar em excluir', async () => {
        const user = userEvent.setup();
        const onDelete = vi.fn();
        render(<ExpenseList expenses={mockExpenses} onDelete={onDelete} onEdit={vi.fn()} />);

        const deleteButtons = screen.getAllByText('excluir');
        await user.click(deleteButtons[0]);

        expect(onDelete).toHaveBeenCalledWith(1);
    });

    it('chama onEdit com a despesa correta ao clicar em editar', async () => {
        const user = userEvent.setup();
        const onEdit = vi.fn();
        render(<ExpenseList expenses={mockExpenses} onDelete={vi.fn()} onEdit={onEdit} />);

        const editButtons = screen.getAllByText('editar');
        await user.click(editButtons[1]);

        expect(onEdit).toHaveBeenCalledWith(mockExpenses[1]);
    });
});