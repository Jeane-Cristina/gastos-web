export const INSIGHT_SECTIONS = [
  "DETALHAMENTO SEMANAL",
  "DETALHAMENTO DO PERÍODO",
  "ONDE ECONOMIZAR",
  "ESTRATÉGIA PARA SUAS COMPRAS",
  "SUGESTÃO PRÁTICA",
];

const HEADING_WRAPPED = new RegExp(
  `[*#_]*[ \\t]*(${INSIGHT_SECTIONS.join("|")})[ \\t]*[*#_]*[ \\t]*:?[*#_]*`,
  "g"
);

/**
 * Limpa o markdown que o modelo devolve antes de renderizar:
 * - tira marcações (** # _) coladas nos títulos de seção;
 * - garante espaço depois de negrito fechado ("**Item:**texto" -> "**Item:** texto");
 * - remove "**" que ficaram soltos (quantidade ímpar na linha).
 */
export function cleanInsight(text: string): string {
  const withPlainHeadings = text.replace(HEADING_WRAPPED, (_, title: string) => `${title}:`);

  return withPlainHeadings
    .split("\n")
    .map((line) => {
      let l = line
        .replace(/\*\*\s+([^*]+?)\s+\*\*/g, "**$1**")
        .replace(/\*\*([^*\n]+?)\*\*(?=[A-Za-zÀ-ú0-9])/g, "**$1** ");
      const marks = (l.match(/\*\*/g) ?? []).length;
      if (marks % 2 === 1) l = l.replace(/\*\*/g, "");
      return l;
    })
    .join("\n");
}
