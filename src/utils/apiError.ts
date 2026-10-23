/** Lê o campo "message" que a API devolve em erros; cai no texto padrão se não houver. */
export async function readServerMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    if (data && typeof data.message === "string" && data.message.trim()) return data.message;
  } catch {
    // corpo vazio ou não-JSON
  }
  return fallback;
}
