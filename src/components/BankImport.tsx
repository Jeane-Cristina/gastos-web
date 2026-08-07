import { useState } from "react";
import Papa from "papaparse";
import { Upload, FileText, X } from "lucide-react";
import "./BankImport.css";

interface ParsedRow {
  description: string;
  amount: number;
  date: string;
  category: string;
  possibleDuplicate?: boolean;
  include?: boolean;
}

interface Props {
  onImportSuccess: () => void;
}

// Cada campo aceita nomes de coluna de diferentes formatos de planilha.
// Colunas do arquivo que não estiverem em nenhuma dessas listas são ignoradas.
const DESCRIPTION_ALIASES = ["title", "despesa", "descricao", "description"];
const AMOUNT_ALIASES = ["amount", "valor"];
const DATE_ALIASES = ["date", "data"];
const CATEGORY_ALIASES = ["category", "categoria"];

function normalizeHeader(header: string): string {
  return header
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function findField(fields: string[], aliases: string[]): string | undefined {
  const normalized = fields.map((f) => ({ original: f, normalized: normalizeHeader(f) }));
  for (const alias of aliases) {
    const match = normalized.find((f) => f.normalized === alias);
    if (match) return match.original;
  }
  return undefined;
}

function toDateInputValue(raw: string | undefined): string {
  if (raw) {
    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

export function BankImport({ onImportSuccess }: Props) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function parseAmount(raw: string): number {
    const cleaned = raw.trim().replace(/[^0-9,.-]/g, "");
    const isNegative = cleaned.startsWith("-");
    const numeric = cleaned.replace("-", "").replace(/\./g, "").replace(",", ".");
    const value = parseFloat(numeric);
    return isNegative ? -value : value;
  }

  function processFile(file: File) {
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const fields = results.meta.fields ?? [];
        const descriptionField = findField(fields, DESCRIPTION_ALIASES);
        const amountField = findField(fields, AMOUNT_ALIASES);
        const dateField = findField(fields, DATE_ALIASES);
        const categoryField = findField(fields, CATEGORY_ALIASES);

        if (!descriptionField || !amountField) {
          alert("Não foi possível identificar as colunas de descrição e valor no arquivo.");
          setFileName(null);
          return;
        }

        const allRows = (results.data as any[]).filter(
          (r) => r[descriptionField] && r[amountField]
        );

        const parsed: ParsedRow[] = allRows
          .map((r) => ({
            description: r[descriptionField],
            amount: parseAmount(String(r[amountField])),
            date: toDateInputValue(dateField ? r[dateField] : undefined),
            category: categoryField ? String(r[categoryField] ?? "").trim() : "",
          }))
          .filter((r) => r.amount > 0 && !isNaN(r.amount)); // remove créditos e valores inválidos

        const skipped = allRows.length - parsed.length;
        if (skipped > 0) {
          console.warn(`${skipped} linha(s) ignorada(s): créditos, estornos ou valores inválidos.`);
        }

        const token = localStorage.getItem("token");

        // Só pede sugestão de categoria para linhas que não vieram com categoria no arquivo.
        const descriptionsNeedingSuggestion = parsed.filter((p) => !p.category).map((p) => p.description);
        let suggestions: { description: string; suggestedCategory: string | null }[] = [];
        if (descriptionsNeedingSuggestion.length > 0) {
          const suggestRes = await fetch(`${import.meta.env.VITE_API_URL}/expenses/suggest-categories`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ descriptions: descriptionsNeedingSuggestion }),
          });
          suggestions = await suggestRes.json();
        }

        // Checagem de duplicatas
        const dates = parsed.map((p) => new Date(p.date).getTime());
        const from = new Date(Math.min(...dates)).toISOString();
        const to = new Date(Math.max(...dates)).toISOString();

        const dupRes = await fetch(
          `${import.meta.env.VITE_API_URL}/expenses/check-duplicates?from=${from}&to=${to}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const existing: { description: string; amount: number; date: string }[] = await dupRes.json();

        const withSuggestions = parsed.map((p) => {
          const isDuplicate = existing.some(
            (e) =>
              e.description.toLowerCase() === p.description.toLowerCase() &&
              Math.abs(e.amount - p.amount) < 0.01 &&
              new Date(e.date).toDateString() === new Date(p.date).toDateString()
          );
          return {
            ...p,
            category: p.category || suggestions.find((s) => s.description === p.description)?.suggestedCategory || "",
            possibleDuplicate: isDuplicate,
            include: !isDuplicate,
          };
        });

        setRows(withSuggestions);
      },
    });
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith(".csv")) {
      processFile(file);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function clearFile() {
    setFileName(null);
    setRows([]);
  }

  function updateCategory(index: number, category: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, category } : r)));
  }

  function updateDate(index: number, date: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, date } : r)));
  }

  function toggleInclude(index: number, include: boolean) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, include } : r)));
  }

  async function confirmImport() {
    const toImport = rows.filter((r) => r.include ?? true);
    const token = localStorage.getItem("token");

    const res = await fetch(`${import.meta.env.VITE_API_URL}/expenses/bulk-import`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        expenses: toImport.map((r) => ({
          description: r.description,
          amount: r.amount,
          category: r.category || "Não categorizado",
          date: new Date(r.date).toISOString(),
        })),
      }),
    });

    if (!res.ok) {
      alert("Erro ao importar. Veja o console para detalhes.");
      return;
    }

    setRows([]);
    setFileName(null);
    onImportSuccess();
    alert("Importação concluída!");
  }

  return (
    <div className="bank-import">
      <h2>Importar extrato bancário</h2>

      <div
        className={`bank-import__upload ${isDragging ? "bank-import__upload--dragging" : ""} ${fileName ? "bank-import__upload--filled" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {!fileName ? (
          <label className="bank-import__dropzone">
            <Upload size={28} className="bank-import__upload-icon" />
            <span className="bank-import__upload-title">Arraste seu extrato aqui</span>
            <span className="bank-import__upload-subtitle">ou clique para escolher um arquivo CSV</span>
            <input type="file" accept=".csv" onChange={handleFile} className="bank-import__file-input" />
          </label>
        ) : (
          <div className="bank-import__file-selected">
            <FileText size={20} className="bank-import__file-icon" />
            <span className="bank-import__file-name">{fileName}</span>
            <button type="button" className="bank-import__file-remove" onClick={clearFile} aria-label="Remover arquivo">
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {rows.length > 0 && (
        <div className="bank-import__table-wrapper">
          <table className="bank-import__table">
            <thead>
              <tr>
                <th></th>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Categoria</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={row.possibleDuplicate ? "bank-import__row--duplicate" : ""}>
                  <td>
                    <input
                      type="checkbox"
                      checked={row.include ?? true}
                      onChange={(e) => toggleInclude(i, e.target.checked)}
                    />
                  </td>
                  <td>
                    {row.description}
                    {row.possibleDuplicate && (
                      <span className="bank-import__duplicate-tag">⚠️ possível duplicata</span>
                    )}
                  </td>
                  <td className="bank-import__amount">R$ {row.amount.toFixed(2)}</td>
                  <td>
                    <input
                      type="date"
                      className="bank-import__date-input"
                      value={row.date}
                      onChange={(e) => updateDate(i, e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="bank-import__category-input"
                      value={row.category}
                      onChange={(e) => updateCategory(i, e.target.value)}
                      placeholder="Categoria"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bank-import__footer">
            <span>{rows.filter((r) => r.include ?? true).length} de {rows.length} despesas selecionadas</span>
            <button className="bank-import__confirm" onClick={confirmImport}>
              Confirmar importação
            </button>
          </div>
        </div>
      )}
    </div>
  );
}