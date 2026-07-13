import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ExpenseForm } from './ExpenseForm';

describe('ExpenseForm', () => {
    it('chama onAdd com os dados preenchidos ao submeter', async () => {
        const user = userEvent.setup();
        const onAdd = vi.fn();
        render(<ExpenseForm onAdd={onAdd} />);

        await user.type(screen.getByPlaceholderText('Descrição'), 'Cinema');
        await user.type(screen.getByPlaceholderText('Valor'), '40');
        await user.type(screen.getByPlaceholderText('Categoria'), 'Lazer');
        await user.click(screen.getByText('Adicionar'));

        expect(onAdd).toHaveBeenCalledTimes(1);
        const chamadaComEsses = onAdd.mock.calls[0][0];
        expect(chamadaComEsses.description).toBe('Cinema');
        expect(chamadaComEsses.amount).toBe(40);
        expect(chamadaComEsses.category).toBe('Lazer');
    });

    it('limpa os campos depois de submeter', async () => {
        const user = userEvent.setup();
        render(<ExpenseForm onAdd={vi.fn()} />);

        const descInput = screen.getByPlaceholderText('Descrição') as HTMLInputElement;
        await user.type(descInput, 'Cinema');
        await user.type(screen.getByPlaceholderText('Valor'), '40');
        await user.type(screen.getByPlaceholderText('Categoria'), 'Lazer');
        await user.click(screen.getByText('Adicionar'));

        expect(descInput.value).toBe('');
    });

    it('preenche os campos quando recebe uma despesa para editar', () => {
        const editingExpense = {
            id: 1,
            description: 'Academia',
            amount: 89.9,
            category: 'Saúde',
            date: '2026-07-01',
        };

        render(<ExpenseForm onAdd={vi.fn()} editingExpense={editingExpense} />);

        expect(screen.getByPlaceholderText('Descrição')).toHaveValue('Academia');
        expect(screen.getByPlaceholderText('Valor')).toHaveValue(89.9);
        expect(screen.getByText('Salvar edição')).toBeInTheDocument();
    });

    it('chama onCancelEdit ao clicar em cancelar durante edição', async () => {
        const user = userEvent.setup();
        const onCancelEdit = vi.fn();
        const editingExpense = {
            id: 1,
            description: 'Academia',
            amount: 89.9,
            category: 'Saúde',
            date: '2026-07-01',
        };

        render(<ExpenseForm onAdd={vi.fn()} editingExpense={editingExpense} onCancelEdit={onCancelEdit} />);
        await user.click(screen.getByText('Cancelar'));

        expect(onCancelEdit).toHaveBeenCalledTimes(1);
    });
});