import { describe, it, expect } from 'vitest';
import { calculateTotal } from './calculateTotal';

describe('calculateTotal', () => {
    it('soma os totais de todas as categorias', () => {
        const data = [
            { category: 'Alimentação', total: 150.5 },
            { category: 'Transporte', total: 25 },
        ];

        expect(calculateTotal(data)).toBe(175.5);
    });

    it('retorna 0 para uma lista vazia', () => {
        expect(calculateTotal([])).toBe(0);
    });

    it('funciona com uma única categoria', () => {
        const data = [{ category: 'Lazer', total: 40 }];
        expect(calculateTotal(data)).toBe(40);
    });
});