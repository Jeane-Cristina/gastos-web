import { useState, useMemo } from "react";
import { useExpenses } from "./hooks/useExpenses";
import { useSummary } from "./hooks/useSummary";
import { ExpenseForm } from "./components/ExpenseForm";
import { ExpenseList } from "./components/ExpenseList";
import { ExpenseFiltersBar } from "./components/ExpenseFilters";
import { CategorySummary } from "./components/CategorySummary";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { TopBar } from "./components/TopBar";
import type { Expense, ExpenseFilters } from "./services/expenseApi";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [showRegister, setShowRegister] = useState(false);
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const { expenses, loading, error, add, edit, remove } = useExpenses(filters, isAuthenticated); const { summary } = useSummary(expenses.length);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const availableCategories = useMemo(
    () => Array.from(new Set(expenses.map((e) => e.category))),
    [expenses]
  );

  async function handleSubmit(expense: Expense) {
    if (editingExpense?.id) {
      await edit(editingExpense.id, expense);
      setEditingExpense(null);
    } else {
      await add(expense);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  }

  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <RegisterForm
          onRegisterSuccess={() => setIsAuthenticated(true)}
          onSwitchToLogin={() => setShowRegister(false)}
        />
      );
    }
    return (
      <div className="app">
        <LoginForm onLoginSuccess={() => setIsAuthenticated(true)} />
        <p style={{ textAlign: "center" }}>
          <button onClick={() => setShowRegister(true)} className="login-card__link">
            Criar conta
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="app">
      <TopBar onLogout={handleLogout} />
      <div className="app__content">
        <h1 className="app__title">Controle de Gastos</h1>
        <p className="app__subtitle">registre, edite e acompanhe seus gastos por categoria</p>
        <div className="app__sections">
          <ExpenseForm
            onAdd={handleSubmit}
            editingExpense={editingExpense}
            onCancelEdit={() => setEditingExpense(null)}
          />
          <ExpenseFiltersBar filters={filters} onChange={setFilters} availableCategories={availableCategories} />
          {loading && <p className="app__state">Carregando...</p>}
          {error && <p className="app__state app__state--error">{error}</p>}
          {!loading && !error && (
            <>
              <ExpenseList expenses={expenses} onDelete={remove} onEdit={setEditingExpense} />
              <CategorySummary data={summary} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;