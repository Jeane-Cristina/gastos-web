const FLAG = "categoriesNormalizedV1";

/**
 * Pede ao backend para reaplicar o normalizador às categorias antigas do usuário
 * ("IA" e "Ia", "Alimentação(Lazer)" e "Alimentação (Lazer)" viram uma só).
 * Roda uma vez por navegador; se o backend ainda não tiver o endpoint, tenta de novo na próxima vez.
 * Devolve quantas despesas mudaram.
 */
export async function ensureCategoriesNormalized(): Promise<number> {
  try {
    if (localStorage.getItem(FLAG)) return 0;

    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_API_URL}/expenses/normalize-categories`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return 0;

    const data = await res.json();
    localStorage.setItem(FLAG, "1");
    return typeof data.changed === "number" ? data.changed : 0;
  } catch {
    return 0;
  }
}
