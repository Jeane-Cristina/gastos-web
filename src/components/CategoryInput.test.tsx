import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { CategoryInput } from './CategoryInput';

describe('CategoryInput', () => {
    it('oferece as categorias existentes como sugestão', () => {
        const { container } = render(
            <CategoryInput value="" onChange={vi.fn()} categories={['Alimentação', 'Lazer']} />
        );

        const options = Array.from(container.querySelectorAll('datalist option')).map((o) => o.getAttribute('value'));
        expect(options).toEqual(['Alimentação', 'Lazer']);
    });

    it('ainda permite digitar uma categoria nova', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        function Harness() {
            const [value, setValue] = useState('');
            return (
                <CategoryInput
                    value={value}
                    onChange={(v) => {
                        setValue(v);
                        onChange(v);
                    }}
                    categories={['Lazer']}
                />
            );
        }

        render(<Harness />);
        await user.type(screen.getByPlaceholderText('Categoria'), 'Pets');
        expect(onChange).toHaveBeenLastCalledWith('Pets');
    });
});
