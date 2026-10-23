/**
 * Converte texto digitado em reais para número.
 * Aceita "1500", "1500,50", "1.500,50", "R$ 1.500,50" e "1.500" (milhar).
 */
export function parseMoney(text: string): number {
  const cleaned = text.replace(/[^\d,.-]/g, "");
  if (!cleaned) return 0;

  let normalized: string;
  if (cleaned.includes(",")) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (/^-?\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    normalized = cleaned.replace(/\./g, "");
  } else {
    normalized = cleaned;
  }

  const value = parseFloat(normalized);
  return Number.isFinite(value) ? value : 0;
}
