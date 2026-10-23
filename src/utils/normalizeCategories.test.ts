import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ensureCategoriesNormalized } from "./normalizeCategories";

describe("ensureCategoriesNormalized", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("token", "abc");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("chama o backend, devolve quantas mudaram e não repete", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ changed: 3 }) });
    vi.stubGlobal("fetch", fetchMock);

    expect(await ensureCategoriesNormalized()).toBe(3);
    expect(await ensureCategoriesNormalized()).toBe(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("não marca como feito quando o endpoint ainda não existe", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    expect(await ensureCategoriesNormalized()).toBe(0);
    expect(await ensureCategoriesNormalized()).toBe(0);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("ignora erro de rede", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect(await ensureCategoriesNormalized()).toBe(0);
  });
});
