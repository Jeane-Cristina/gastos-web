import { describe, it, expect } from "vitest";
import Papa from "papaparse";
import { cleanImportDescription, parseImportDate, buildSampleCsv } from "./importHelpers";
import { parseMoney } from "./parseMoney";

describe("cleanImportDescription", () => {
  it("remove prefixos de maquininha com asterisco", () => {
    expect(cleanImportDescription("Mp *Drogariadopov")).toBe("Drogariadopov");
    expect(cleanImportDescription("IPAG*Papelaria")).toBe("Papelaria");
    expect(cleanImportDescription("Pag*Padaria Central")).toBe("Padaria Central");
  });

  it("remove prefixos encadeados", () => {
    expect(cleanImportDescription("Mp *Pag*Loja")).toBe("Loja");
  });

  it("não mexe em descrições que só começam parecido", () => {
    expect(cleanImportDescription("Pagamento de boleto")).toBe("Pagamento de boleto");
    expect(cleanImportDescription("Mp3 Store")).toBe("Mp3 Store");
  });

  it("converte TUDO EM MAIÚSCULAS para Title Case", () => {
    expect(cleanImportDescription("SUPERMERCADO BOM PREÇO")).toBe("Supermercado Bom Preço");
  });

  it("colapsa espaços e nunca devolve vazio", () => {
    expect(cleanImportDescription("  Uber   Trip ")).toBe("Uber Trip");
    expect(cleanImportDescription("Mp *")).toBe("Mp *");
  });
});

describe("parseImportDate", () => {
  const today = new Date(2026, 9, 23);

  it("lê formatos brasileiros e ISO", () => {
    expect(parseImportDate("05/10/2026", today)).toBe("2026-10-05");
    expect(parseImportDate("5-1-2026", today)).toBe("2026-01-05");
    expect(parseImportDate("05.10.26", today)).toBe("2026-10-05");
    expect(parseImportDate("2026-10-05", today)).toBe("2026-10-05");
    expect(parseImportDate("2026-10-05T12:00:00Z", today)).toBe("2026-10-05");
  });

  it("cai para hoje quando ausente ou inválida", () => {
    expect(parseImportDate(undefined, today)).toBe("2026-10-23");
    expect(parseImportDate("31/02/2026", today)).toBe("2026-10-23");
    expect(parseImportDate("ontem", today)).toBe("2026-10-23");
  });
});

describe("buildSampleCsv", () => {
  it("gera um CSV que o próprio importador consegue ler", () => {
    const parsed = Papa.parse<Record<string, string>>(buildSampleCsv().replace(/^﻿/, ""), { header: true, skipEmptyLines: true });
    expect(parsed.data).toHaveLength(4);
    expect(parseMoney(parsed.data[0]["Valor"])).toBe(152.4);
    expect(parseImportDate(parsed.data[0]["Data"])).toBe("2026-10-05");
  });
});
