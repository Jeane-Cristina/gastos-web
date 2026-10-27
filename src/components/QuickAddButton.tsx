import { useState } from "react";
import { CategoryInput } from "./CategoryInput";
import "./QuickAddButton.css";

interface Props {
  categories?: string[];
  onAdd: (expense: { description: string; amount: number; category: string; date: string }) => Promise<void>;
}

export function QuickAddButton({ onAdd, categories = [] }: Props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const recentCategories = categories.slice(0, 5);

  function reset() {
    setAmount("");
    setCategory("");
    setDescription("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onAdd({
        description: description || category,
        amount: parseFloat(amount),
        category,
        date: new Date().toISOString(),
      });
      reset();
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button data-testid="quick-add-fab" className="quick-add__fab" onClick={() => setOpen(true)} aria-label="Lançar gasto rápido">
        +
      </button>

      {open && (
        <div className="quick-add__overlay" onClick={() => setOpen(false)}>
          <form data-testid="quick-add-form" className="quick-add__modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
            <h3>Lançamento rápido</h3>

            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Valor"
              autoFocus
              required
            />

            {recentCategories.length > 0 && (
              <div className="quick-add__chips">
                {recentCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`quick-add__chip ${category === cat ? "quick-add__chip--active" : ""}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            <CategoryInput value={category} onChange={setCategory} categories={categories} required />

            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição (opcional)"
            />

            <div className="quick-add__actions">
              <button type="button" onClick={() => setOpen(false)}>Cancelar</button>
              <button type="submit" disabled={saving}>{saving ? "Salvando..." : "Lançar"}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}