import { describe, it, expect } from "vitest";
import { parseMoney } from "./parseMoney";

describe("parseMoney", () => {
  it("lê formatos brasileiros", () => {
    expect(parseMoney("1500")).toBe(1500);
    expect(parseMoney("1500,50")).toBe(1500.5);
    expect(parseMoney("1.500,50")).toBe(1500.5);
    expect(parseMoney("R$ 8.504,15")).toBe(8504.15);
  });

  it("trata ponto com 3 dígitos como milhar", () => {
    expect(parseMoney("1.500")).toBe(1500);
  });

  it("aceita ponto decimal simples", () => {
    expect(parseMoney("19.99")).toBe(19.99);
  });

  it("retorna 0 para texto vazio ou inválido", () => {
    expect(parseMoney("")).toBe(0);
    expect(parseMoney("abc")).toBe(0);
  });
});
