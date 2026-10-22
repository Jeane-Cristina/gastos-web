import { describe, it, expect } from "vitest";
import { formatBRL } from "./formatBRL";

// Intl usa espaço não separável entre "R$" e o número; normalizamos para comparar.
const norm = (s: string) => s.replace(/ /g, " ");

describe("formatBRL", () => {
  it("usa vírgula decimal e ponto de milhar", () => {
    expect(norm(formatBRL(19.99))).toBe("R$ 19,99");
    expect(norm(formatBRL(8504.15))).toBe("R$ 8.504,15");
  });

  it("formata zero e valores negativos", () => {
    expect(norm(formatBRL(0))).toBe("R$ 0,00");
    expect(norm(formatBRL(-10))).toBe("-R$ 10,00");
  });

  it("não quebra com NaN ou Infinity", () => {
    expect(norm(formatBRL(NaN))).toBe("R$ 0,00");
    expect(norm(formatBRL(Infinity))).toBe("R$ 0,00");
  });
});
