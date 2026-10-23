import { describe, it, expect } from "vitest";
import { cleanInsight } from "./cleanInsight";

describe("cleanInsight", () => {
  it("tira asteriscos dos títulos de seção", () => {
    const out = cleanInsight("**ONDE ECONOMIZAR:**\n- Reduza delivery");
    expect(out).toBe("ONDE ECONOMIZAR:\n- Reduza delivery");
  });

  it("aceita título em negrito sem dois-pontos", () => {
    expect(cleanInsight("**SUGESTÃO PRÁTICA**\nTexto")).toBe("SUGESTÃO PRÁTICA:\nTexto");
  });

  it("remove asteriscos soltos (quantidade ímpar)", () => {
    expect(cleanInsight("Gaste menos com ** delivery")).toBe("Gaste menos com  delivery");
  });

  it("mantém negrito bem formado", () => {
    expect(cleanInsight("Corte **delivery** em 20%")).toBe("Corte **delivery** em 20%");
  });

  it("separa negrito colado no texto", () => {
    expect(cleanInsight("**Delivery:**gastou R$ 200")).toBe("**Delivery:** gastou R$ 200");
  });

  it("conserta negrito com espaço só depois de abrir", () => {
    expect(cleanInsight("O pior mês foi ** setembro/2026** (R$ 4.011,09)")).toBe("O pior mês foi **setembro/2026** (R$ 4.011,09)");
    expect(cleanInsight("compre a ** Mesa nova**.")).toBe("compre a **Mesa nova**.");
  });

  it("normaliza espaços dentro do negrito", () => {
    expect(cleanInsight("Veja ** isto ** agora")).toBe("Veja **isto** agora");
  });
});
