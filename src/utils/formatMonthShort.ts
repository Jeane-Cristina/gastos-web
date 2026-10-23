const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** (7, 2026) -> "jul/26". Mês fora de 1–12 devolve "?/aa". */
export function formatMonthShort(month: number, year: number): string {
  const name = MONTHS[month - 1] ?? "?";
  return `${name}/${String(year).slice(-2).padStart(2, "0")}`;
}
