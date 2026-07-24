import { useState } from "react";
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
import { FinancialProfileForm } from "./components/FinancialProfileForm";
import { WeeklyInsight } from "./components/WeeklyInsight";
import "./App.css";
import { useAllCategories } from "./hooks/useAllCategories";
import { Sidebar, type View } from "./components/Sidebar";
import { GoalReport } from "./components/GoalReport";
import { BankImport } from "./components/BankImport";
import { PurchaseGoals } from "./components/PurchaseGoals";
import { CategoryPieChart } from "./components/CategoryPieChart";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [showRegister, setShowRegister] = useState(false);
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [activeView, setActiveView] = useState<View>("lancamentos");
  const [menuOpen, setMenuOpen] = useState(false);
  const availableCategories = useAllCategories();
  const { expenses, loading, error, add, edit, remove, reload } = useExpenses(filters, isAuthenticated);
  const { summary } = useSummary(expenses.length);

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
      <LoginForm
        onLoginSuccess={() => setIsAuthenticated(true)}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  return (
    <div className="app">
      <TopBar onMenuClick={() => setMenuOpen(true)} />
      <div className="app__content">
        <h1 className="app__title">Controle de Gastos</h1>
        <p className="app__subtitle">registre, edite e acompanhe seus gastos por categoria</p>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <Sidebar
            active={activeView}
            onChange={setActiveView}
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            onLogout={handleLogout}
          />
          <div style={{ flex: 1 }}>
            {activeView === "lancamentos" && (
              <div className="app__sections">
                <ExpenseForm
                  onAdd={handleSubmit}
                />
                <ExpenseFiltersBar filters={filters} onChange={setFilters} availableCategories={availableCategories} />
                {loading && <p className="app__state">Carregando...</p>}
                {error && <p className="app__state app__state--error">{error}</p>}
                {!loading && !error && (
                  <>
                    <ExpenseList expenses={expenses} onDelete={remove} onSave={edit} />
                    <CategorySummary data={summary} />
                  </>
                )}
              </div>
            )}
            {activeView === "importar" && (
              <div className="app__sections">
                <BankImport onImportSuccess={reload} />
              </div>
            )}
            {activeView === "metas" && (
              <div className="app__sections">
                <FinancialProfileForm />
                <PurchaseGoals />
                <GoalReport />
                <WeeklyInsight />
                <CategoryPieChart data={summary} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;