import { useState } from "react";
import "./ExpenseList.css";
import type { Expense } from "../services/expenseApi";

interface Props {
  expenses: Expense[];
  onDelete: (id: number) => void;
  onSave: (id: number, expense: Expense) => Promise<void>;
}

export function ExpenseList({ expenses, onDelete, onSave }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Expense | null>(null);

  function startEdit(expense: Expense) {
    setEditingId(expense.id ?? null);
    setDraft({ ...expense });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
  }

  async function saveEdit() {
    if (draft && editingId !== null) {
      await onSave(editingId, draft);
      setEditingId(null);
      setDraft(null);
    }
  }

  return (
    <ul className="expense-list">
      {expenses.map((e) => (
        <li key={e.id} className="expense-item">
          {editingId === e.id && draft ? (
            <div className="expense-item__edit-row">
              <input
                value={draft.description}
                onChange={(ev) => setDraft({ ...draft, description: ev.target.value })}
              />
              <input
                type="number"
                step="0.01"
                value={draft.amount}
                onChange={(ev) => setDraft({ ...draft, amount: parseFloat(ev.target.value) || 0 })}
              />
              <input
                value={draft.category}
                onChange={(ev) => setDraft({ ...draft, category: ev.target.value })}
              />
              <input
                type="date"
                value={draft.date.split("T")[0]}
                onChange={(ev) => setDraft({ ...draft, date: ev.target.value })}
              />
              <input
                value={draft.paidBy ?? ""}
                onChange={(ev) => setDraft({ ...draft, paidBy: ev.target.value || undefined })}
                placeholder="Pago por (opcional)"
              />
              <select
                value={draft.paid === undefined ? "" : String(draft.paid)}
                onChange={(ev) =>
                  setDraft({ ...draft, paid: ev.target.value === "" ? undefined : ev.target.value === "true" })
                }
              >
                <option value="">Status (opcional)</option>
                <option value="true">Pago</option>
                <option value="false">Não pago</option>
              </select>
              <div className="expense-item__edit-actions">
                <button className="expense-item__save" onClick={saveEdit}>salvar</button>
                <button className="expense-item__cancel" onClick={cancelEdit}>cancelar</button>
              </div>
            </div>
          ) : (
            <>
              <span className="expense-item__desc">{e.description}</span>
              <span className="expense-item__leader"></span>
              <span className="expense-item__category">{e.category}</span>
              {e.paidBy && <span className="expense-item__paid-by">{e.paidBy}</span>}
              {e.paid !== undefined && (
                <span className={`expense-item__status ${e.paid ? "expense-item__status--paid" : "expense-item__status--unpaid"}`}>
                  {e.paid ? "Pago" : "Não pago"}
                </span>
              )}
              <span className="expense-item__amount">R$ {e.amount.toFixed(2)}</span>
              <span className="expense-item__actions">
                <button className="expense-item__edit" onClick={() => startEdit(e)}>editar</button>
                <button className="expense-item__delete" onClick={() => e.id && onDelete(e.id)}>excluir</button>
              </span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}