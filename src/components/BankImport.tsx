import { useState } from "react";
import Papa from "papaparse";
import "./BankImport.css";

interface ParsedRow {
  description: string;
  amount: number;
  date: string;
  category: string;
}

interface Props {
  onImportSuccess: () => void;
}

export function BankImport({ onImportSuccess }: Props) {
  const [rows, setRows] = useState<ParsedRow[]>([]);

function parseAmount(raw: string): number {
  const cleaned = raw.trim().replace(/\s+/g, "");
  const isNegative = cleaned.startsWith("-");
  const numeric = cleaned.replace("-", "").replace(/\./g, "").replace(",", ".");
  const value = parseFloat(numeric);
  return isNegative ? -value : value;
}

function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;

  Papa.parse(file, {
    header: true,
    complete: async (results) => {
      const allRows = (results.data as any[]).filter((r) => r.title && r.amount);

      const parsed: ParsedRow[] = allRows
        .map((r) => ({
          description: r.title,
          amount: parseAmount(String(r.amount)),
          date: r.date,
          category: "",
        }))
        .filter((r) => r.amount > 0 && !isNaN(r.amount)); // remove créditos e valores inválidos

      const skipped = allRows.length - parsed.length;
      if (skipped > 0) {
        console.warn(`${skipped} linha(s) ignorada(s): créditos, estornos ou valores inválidos.`);
      }

      const token = localStorage.getItem("token");
      const suggestRes = await fetch(`${import.meta.env.VITE_API_URL}/expenses/suggest-categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ descriptions: parsed.map((p) => p.description) }),
      });
      const suggestions: { description: string; suggestedCategory: string | null }[] = await suggestRes.json();

      const withSuggestions = parsed.map((p) => ({
        ...p,
        category: suggestions.find((s) => s.description === p.description)?.suggestedCategory ?? "",
      }));

      setRows(withSuggestions);
    },
  });
}

  function updateCategory(index: number, category: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, category } : r)));
  }

  async function confirmImport() {
    const token = localStorage.getItem("token");
    await fetch(`${import.meta.env.VITE_API_URL}/expenses/bulk-import`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        expenses: rows.map((r) => ({
          description: r.description,
          amount: r.amount,
          category: r.category || "Não categorizado",
          date: new Date(r.date).toISOString(),
        })),
      }),
    });
    setRows([]);
    onImportSuccess();
    alert("Importação concluída!");
  }

  return (
    <div className="bank-import">
      <h2>Importar extrato bancário</h2>

      <div className="bank-import__upload">
        <input type="file" accept=".csv" onChange={handleFile} />
        <p className="bank-import__hint">Selecione o arquivo CSV exportado do seu banco</p>
      </div>

      {rows.length > 0 && (
        <div className="bank-import__table-wrapper">
          <table className="bank-import__table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Categoria</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td>{row.description}</td>
                  <td className="bank-import__amount">R$ {row.amount.toFixed(2)}</td>
                  <td>{row.date}</td>
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
            <span>{rows.length} despesas encontradas</span>
            <button className="bank-import__confirm" onClick={confirmImport}>
              Confirmar importação
            </button>
          </div>
        </div>
      )}
    </div>
  );
}