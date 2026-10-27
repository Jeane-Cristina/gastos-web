import { useState, useEffect } from "react";
import { useExpenses } from "./hooks/useExpenses";
import { useSummary } from "./hooks/useSummary";
import { ExpenseForm } from "./components/ExpenseForm";
import { ExpenseList } from "./components/ExpenseList";
import { ExpenseFiltersBar } from "./components/ExpenseFilters";
import { MonthOverview } from "./components/MonthOverview";
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
import { useAllPayers } from "./hooks/useAllPayers";
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
import { ensureDailySnapshot } from "./utils/autoSnapshot";
import { ensureCategoriesNormalized } from "./utils/normalizeCategories";
import { DemoBanner } from "./components/DemoBanner";
import { isDemoMode } from "./services/expenseApi";
import { bootstrapSession, logout, SESSION_EXPIRED_EVENT } from "./services/session";
import { QuickAddButton } from "./components/QuickAddButton";


const VIEW_HEADINGS: Record<View, { title: string; subtitle: string }> = {
  lancamentos: { title: "Lançamentos", subtitle: "registre, edite e acompanhe seus gastos por categoria" },
  recorrentes: { title: "Recorrentes", subtitle: "despesas que se repetem todo mês, lançadas automaticamente" },
  importar: { title: "Importar extrato", subtitle: "traga os gastos de um arquivo CSV do seu banco" },
  metas: { title: "Metas & Insights", subtitle: "defina metas, acompanhe o mês e receba análises" },
  investimentos: { title: "Investimentos", subtitle: "sua carteira e sugestões educacionais" },
  conjunta: { title: "Conta Conjunta", subtitle: "gastos compartilhados com outras pessoas" },
};

function App() {
  // Começa deslogado: a sessão só é aceita depois de checada (token válido ou renovado pelo refresh token)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const now = new Date();
  const [filters, setFilters] = useState<ExpenseFilters>({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [activeView, setActiveView] = useState<View>("lancamentos");
  const [goalsSubView, setGoalsSubView] = useState<GoalsSubView>("perfil");
  const [menuOpen, setMenuOpen] = useState(false);
  const availablePayers = useAllPayers();
  const { expenses, loading, error, add, edit, remove, reload, totalCount, page, setPage, pageSize } = useExpenses(filters, isAuthenticated);
  const availableCategories = useAllCategories(totalCount);
  const { summary } = useSummary(filters, expenses.length);
  const urlParams = new URLSearchParams(window.location.search);
  const hasResetToken = urlParams.has("token");

  useEffect(() => {
    let cancelled = false;
    bootstrapSession().then((state) => {
      if (cancelled) return;
      setIsAuthenticated(state === "authenticated");
      if (state === "expired") setSessionNotice("Sua sessão expirou. Entre novamente.");
      if (state === "unreachable") setSessionNotice("Não foi possível verificar sua sessão. Entre novamente.");
      setAuthReady(true);
    });

    function handleExpired() {
      setIsAuthenticated(false);
      setSessionNotice("Sua sessão expirou. Entre novamente.");
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    return () => {
      cancelled = true;
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    };
  }, []);

  useEffect(() => {
    document.title = isAuthenticated
      ? `${VIEW_HEADINGS[activeView].title} · Guardai`
      : "Guardai";
  }, [activeView, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) ensureDailySnapshot();
  }, [isAuthenticated]);

  // Uma vez por navegador: unifica categorias antigas ("IA"/"Ia", "Alimentação(Lazer)")
  useEffect(() => {
    if (!isAuthenticated || isDemoMode()) return;
    ensureCategoriesNormalized().then((changed) => {
      if (changed > 0) window.location.reload();
    });
  }, [isAuthenticated]);

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
    logout();
    setSessionNotice(null);
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

  if (!authReady) {
    return (
      <div className="login-screen">
        <p className="login-card__subtitle" role="status">Verificando sua sessão...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <RegisterForm
          onRegisterSuccess={() => {
            setSessionNotice(null);
            setIsAuthenticated(true);
          }}
          onSwitchToLogin={() => setShowRegister(false)}
        />
      );
    }
    if (showForgotPassword) {
      return <ForgotPasswordForm onBackToLogin={() => setShowForgotPassword(false)} />;
    }
    return (
      <LoginForm
        onLoginSuccess={() => {
          setSessionNotice(null);
          setIsAuthenticated(true);
        }}
        onSwitchToRegister={() => setShowRegister(true)}
        onForgotPassword={() => setShowForgotPassword(true)}
        notice={sessionNotice}
      />
    );
  }

  return (
    <div className="app">
      <TopBar onMenuClick={() => setMenuOpen(true)} />
      {isDemoMode() && <DemoBanner onExit={handleLogout} />}
        {!isBackendWarmed() && <ColdStartBanner loading={loading} />}
      <div className="app__content">
        <h1 className="app__title">{VIEW_HEADINGS[activeView].title}</h1>
        <p className="app__subtitle">{VIEW_HEADINGS[activeView].subtitle}</p>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <Sidebar
            active={activeView}
            onChange={setActiveView}
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            onLogout={handleLogout}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
          {activeView === "lancamentos" && (
            <div className="app__sections">
              {!loading && expenses.length === 0 && totalCount === 0 && (
                <OnboardingBanner onNavigate={(view) => setActiveView(view)} />
              )}
              <MonthOverview summary={summary} refreshKey={totalCount} />
              <details className="app__add-details">
                <summary>Novo lançamento completo (pago por, status)</summary>
                <ExpenseForm onAdd={handleSubmit} categories={availableCategories} />
              </details>
              <ExpenseFiltersBar filters={filters} onChange={setFilters} availableCategories={availableCategories} availablePayers={availablePayers} />
              {loading && <p className="app__state">Carregando...</p>}
              {error && <p className="app__state app__state--error">{error}</p>}
              {!loading && !error && (
                <>
                  <ExpenseList expenses={expenses} onDelete={remove} onSave={edit} categories={availableCategories} />
                  <Pagination page={page} totalCount={totalCount} pageSize={pageSize} onPageChange={setPage} />
                </>
              )}
            </div>
          )}
          {activeView === "recorrentes" && (
            <div className="app__sections">
              <RecurringExpenses />
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
      <QuickAddButton onAdd={add} categories={availableCategories} />
    </div>
  );
}

export default App;