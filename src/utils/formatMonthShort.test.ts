import { describe, it, expect } from "vitest";
import { formatMonthShort } from "./formatMonthShort";

describe("formatMonthShort", () => {
  it("abrevia mês e ano em português", () => {
    expect(formatMonthShort(7, 2026)).toBe("jul/26");
    expect(formatMonthShort(1, 2025)).toBe("jan/25");
    expect(formatMonthShort(12, 2026)).toBe("dez/26");
  });

  it("não quebra com mês inválido", () => {
    expect(formatMonthShort(13, 2026)).toBe("?/26");
  });
});
