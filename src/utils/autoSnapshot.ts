const KEY = "snapshotDay";

/**
 * Salva o snapshot das metas do mês automaticamente, no máximo uma vez por dia de uso.
 * Substitui o botão manual "Salvar snapshot deste mês".
 */
export async function ensureDailySnapshot(): Promise<void> {
  try {
    const today = new Date().toISOString().split("T")[0];
    if (localStorage.getItem(KEY) === today) return;

    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_API_URL}/goal/snapshot`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    // 400 = perfil financeiro ainda não configurado: tenta de novo em outro dia
    if (res.ok) localStorage.setItem(KEY, today);
  } catch {
    // snapshot é um extra: nunca deve atrapalhar o uso do app
  }
}
