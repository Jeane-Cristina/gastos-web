import { useState, useEffect } from "react";
import { useExpenses } from "./hooks/useExpenses";
import { useSummary } from "./hooks/useSummary";
import { ExpenseForm } from "./components/ExpenseForm";
import { ExpenseList } from "./components/ExpenseList";
import { ExpenseFiltersBar } from "./components/ExpenseFilters";
import { CategorySummary } from "./components/CategorySummary";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { ForgotPasswordForm } from "./components/ForgotPasswordForm";
import { ResetPasswordForm } from "./components/ResetPasswordForm";
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
import { GoalHistory } from "./components/GoalHistory";
import { Investments } from "./components/Investments";
import { CategoryPieChart } from "./components/CategoryPieChart";
import { RecurringExpenses } from "./components/RecurringExpenses";
import { Pagination } from "./components/Pagination";
import { CategoryBudgets } from "./components/CategoryBudgets";
import { ChatBox } from "./components/ChatBox";
import { JointAccounts } from "./components/JointAccounts";
import { GoalScore } from "./components/GoalScore";
import { GoalsSubNav, type GoalsSubView } from "./components/GoalsSubNav";
import { OnboardingBanner } from "./components/OnboardingBanner";
import { ColdStartBanner } from "./components/ColdStartBanner";
import { isBackendWarmed, markBackendWarmed } from "./utils/session";


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [activeView, setActiveView] = useState<View>("lancamentos");
  const [goalsSubView, setGoalsSubView] = useState<GoalsSubView>("perfil");
  const [menuOpen, setMenuOpen] = useState(false);
  const availableCategories = useAllCategories();
  const { expenses, loading, error, add, edit, remove, reload, totalCount, page, setPage, pageSize } = useExpenses(filters, isAuthenticated);
  const { summary } = useSummary(filters, expenses.length);
  const urlParams = new URLSearchParams(window.location.search);
  const hasResetToken = urlParams.has("token");

  useEffect(() => {
    if (!loading && expenses.length >= 0 && !isBackendWarmed()) {
      markBackendWarmed();
    }
  }, [loading]);

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

  if (hasResetToken) {
    return (
      <ResetPasswordForm
        onResetSuccess={() => {
          window.history.replaceState({}, "", window.location.pathname);
          setShowForgotPassword(false);
        }}
      />
    );
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
    if (showForgotPassword) {
      return <ForgotPasswordForm onBackToLogin={() => setShowForgotPassword(false)} />;
    }
    return (
      <>
        <LoginForm
          onLoginSuccess={() => setIsAuthenticated(true)}
          onSwitchToRegister={() => setShowRegister(true)}
        />
        <p style={{ textAlign: "center" }}>
          <button onClick={() => setShowForgotPassword(true)} className="login-card__link">
            Esqueci minha senha
          </button>
        </p>
      </>
    );
  }

  return (
    <div className="app">
      <TopBar onMenuClick={() => setMenuOpen(true)} />
        {!isBackendWarmed() && <ColdStartBanner loading={loading} />}
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
              {!loading && expenses.length === 0 && totalCount === 0 && (
                <OnboardingBanner onNavigate={(view) => setActiveView(view)} />
              )}
              <ExpenseForm
                onAdd={handleSubmit}
              />
              <RecurringExpenses />
              <ExpenseFiltersBar filters={filters} onChange={setFilters} availableCategories={availableCategories} />
              {loading && <p className="app__state">Carregando...</p>}
              {error && <p className="app__state app__state--error">{error}</p>}
              {!loading && !error && (
                <>
                  <ExpenseList expenses={expenses} onDelete={remove} onSave={edit} />
                  <Pagination page={page} totalCount={totalCount} pageSize={pageSize} onPageChange={setPage} />
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
                <GoalsSubNav active={goalsSubView} onChange={setGoalsSubView} />

                {goalsSubView === "perfil" && (
                  <>
                    <FinancialProfileForm />
                    <PurchaseGoals />
                  </>
                )}

                {goalsSubView === "relatorios" && (
                  <>
                    <GoalReport />
                    <GoalHistory />
                    <CategoryPieChart data={summary} />
                  </>
                )}

                {goalsSubView === "orcamento" && (
                  <CategoryBudgets />
                )}

                {goalsSubView === "assistente" && (
                  <>
                    <WeeklyInsight />
                    <ChatBox />
                    <GoalScore />
                  </>
                )}
              </div>
            )}
            {activeView === "investimentos" && (
            <div className="app__sections">
              <Investments />
            </div>
          )}
          {activeView === "conjunta" && (
          <div className="app__sections">
            <JointAccounts />
          </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;