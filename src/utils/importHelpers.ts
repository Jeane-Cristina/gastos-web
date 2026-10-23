// Prefixos de maquininha/intermediadora que poluem a descrição do extrato
// ("Mp *Drogaria", "Pag*Padaria", "Ipag*Loja"...). Só removemos quando há "*",
// para não mexer em descrições reais como "Pagamento de boleto".
const GATEWAY_PREFIX = /^(?:mp|ipag|pag|pagseguro|mercado\s?pago|sumup|picpay)\s*\*\s*/i;

function titleCase(text: string): string {
  return text
    .toLocaleLowerCase("pt-BR")
    .replace(/(^|\s)(\S)/g, (_, space: string, char: string) => space + char.toLocaleUpperCase("pt-BR"));
}

/**
 * Limpa a descrição vinda do extrato: tira prefixos de maquininha, espaços
 * repetidos e converte TUDO EM MAIÚSCULAS para "Title Case".
 * Nunca devolve vazio: se a limpeza apagar tudo, mantém o original.
 */
export function cleanImportDescription(raw: string): string {
  const original = raw.replace(/\s+/g, " ").trim();
  let text = original;

  // até 2 rodadas, para casos como "Mp *Pag*Loja"
  for (let i = 0; i < 2; i++) text = text.replace(GATEWAY_PREFIX, "");
  text = text.trim();
  if (!text) return original;

  const hasLowercase = /[a-zà-ÿ]/.test(text);
  if (!hasLowercase) return titleCase(text);
  return text.charAt(0).toLocaleUpperCase("pt-BR") + text.slice(1);
}

function toIso(year: number, month: number, day: number): string | null {
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function todayIso(today: Date): string {
  return toIso(today.getFullYear(), today.getMonth() + 1, today.getDate())!;
}

/**
 * Lê datas de extratos: aaaa-mm-dd, dd/mm/aaaa, dd-mm-aaaa, dd.mm.aaaa e dd/mm/aa.
 * Data ausente ou inválida cai para hoje.
 */
export function parseImportDate(raw: string | undefined, today: Date = new Date()): string {
  const text = (raw ?? "").trim();

  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return toIso(+iso[1], +iso[2], +iso[3]) ?? todayIso(today);

  const br = text.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4}|\d{2})(?!\d)/);
  if (br) {
    const year = br[3].length === 2 ? 2000 + +br[3] : +br[3];
    return toIso(year, +br[2], +br[1]) ?? todayIso(today);
  }

  return todayIso(today);
}

/** CSV de exemplo para download (com BOM para o Excel abrir os acentos). */
export function buildSampleCsv(): string {
  const lines = [
    "Data,Descrição,Valor,Categoria",
    "05/10/2026,Mercado Exemplo,\"152,40\",Alimentação",
    "07/10/2026,Posto de Gasolina,\"210,00\",Transporte",
    "10/10/2026,Netflix,\"55,90\",Lazer",
    "12/10/2026,Farmácia,\"38,75\",Saúde",
  ];
  return "﻿" + lines.join("\r\n") + "\r\n";
}
