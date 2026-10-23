import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { MoneyInput } from './MoneyInput';

const norm = (s: string) => s.replace(/ /g, ' ');

function Harness({ onChange }: { onChange: (v: number) => void }) {
    const [value, setValue] = useState(0);
    return (
        <MoneyInput
            label="Renda mensal"
            value={value}
            onChange={(v) => {
                setValue(v);
                onChange(v);
            }}
        />
    );
}

describe('MoneyInput', () => {
    it('tem rótulo visível associado ao campo', () => {
        render(<Harness onChange={vi.fn()} />);
        expect(screen.getByLabelText('Renda mensal')).toBeInTheDocument();
    });

    it('envia o número digitado e formata como moeda ao sair do campo', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Harness onChange={onChange} />);

        const input = screen.getByLabelText('Renda mensal') as HTMLInputElement;
        await user.type(input, '1500,5');
        expect(onChange).toHaveBeenLastCalledWith(1500.5);

        await user.tab();
        expect(norm(input.value)).toBe('R$ 1.500,50');
    });
});
