export interface StubExpense {
  id: number;
  description: string;
  category: string;
  amount: number;
  date: string;
  paid: boolean;
  paidBy: string | null;
}

const INCOME = 6500;
const GOAL = 2200;

// Token com `exp` no ano 2100, para o app não tentar renovar a sessão durante o teste.
const FAKE_TOKEN = "x.eyJleHAiOjQxMDI0NDQ4MDB9.y";

function seed(): StubExpense[] {
  const now = new Date();
  const mk = (
    id: number,
    description: string,
    category: string,
    amount: number,
    day: number,
    paid = true,
  ): StubExpense => ({
    id,
    description,
    category,
    amount,
    date: new Date(Date.UTC(now.getFullYear(), now.getMonth(), Math.min(day, now.getDate()), 12)).toISOString(),
    paid,
    paidBy: null,
  });
  return [
    mk(1, "Aluguel", "Moradia", 1800, 5),
    mk(2, "Supermercado Bom Preço", "Alimentação", 412.8, 3),
    mk(3, "Combustível", "Transporte", 220, 9),
    mk(4, "Curso online de inglês", "Educação", 119, 15, false),
  ];
}

const sum = (list: StubExpense[]) => list.reduce((s, e) => s + e.amount, 0);

function byCategory(list: StubExpense[]) {
  const totals = new Map<string, number>();
  list.forEach((e) => totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount));
  return [...totals].map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total);
}

/**
 * Simula a API do Gastos. Os lançamentos ficam em memória durante o teste, então um POST
 * aparece na listagem seguinte, como na API de verdade.
 */
export function stubApi() {
  const expenses = seed();
  let nextId = 100;
  let profile = {
    monthlyIncome: INCOME,
    savingsGoal: GOAL,
    annualSavingsGoal: GOAL * 12,
    currentSavings: 8500,
    shortTermGoal: "Montar uma reserva de emergência",
    mediumTermGoal: "Trocar de notebook",
    longTermGoal: "Entrada de um imóvel",
  };

  // Qualquer rota não prevista responde vazio, para uma chamada nova não derrubar o teste.
  cy.intercept({ pathname: "/api/**" }, (req) => {
    req.reply({ statusCode: 200, body: req.method === "GET" ? [] : {} });
  });

  cy.intercept({ method: "POST", pathname: "/api/auth/demo" }, { token: FAKE_TOKEN, refreshToken: "refresh", demo: true });
  cy.intercept({ method: "POST", pathname: "/api/auth/login" }, { statusCode: 401, body: { message: "Usuário ou senha inválidos" } });

  cy.intercept({ method: "GET", pathname: "/api/expenses" }, (req) => {
    // Aplica os mesmos filtros que a API de verdade aceita pela query string.
    const q = new URL(req.url).searchParams;
    const filtered = expenses.filter((e) => {
      if (q.get("category") && e.category !== q.get("category")) return false;
      if (q.get("paid") && String(e.paid) !== q.get("paid")) return false;
      if (q.get("paidBy") && e.paidBy !== q.get("paidBy")) return false;
      if (q.get("month") && new Date(e.date).getUTCMonth() + 1 !== Number(q.get("month"))) return false;
      return true;
    });
    const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
    req.reply({ items: sorted, totalCount: sorted.length, page: 1, pageSize: 20 });
  }).as("listExpenses");

  cy.intercept({ method: "POST", pathname: "/api/expenses" }, (req) => {
    const created: StubExpense = {
      id: nextId++,
      paid: true,
      paidBy: null,
      ...req.body,
    };
    expenses.push(created);
    req.reply({ statusCode: 201, body: created });
  }).as("createExpense");

  cy.intercept({ method: "PATCH", pathname: /^\/api\/expenses\/\d+$/ }, (req) => {
    const id = Number(req.url.split("?")[0].split("/").pop());
    const i = expenses.findIndex((e) => e.id === id);
    if (i >= 0) expenses[i] = { ...expenses[i], ...req.body, id };
    req.reply({ statusCode: 204 });
  }).as("updateExpense");

  cy.intercept({ method: "DELETE", pathname: /^\/api\/expenses\/\d+$/ }, (req) => {
    const id = Number(req.url.split("?")[0].split("/").pop());
    const i = expenses.findIndex((e) => e.id === id);
    if (i >= 0) expenses.splice(i, 1);
    req.reply({ statusCode: 204 });
  }).as("deleteExpense");

  cy.intercept({ method: "GET", pathname: "/api/expenses/summary" }, (req) => req.reply(byCategory(expenses)));
  cy.intercept({ method: "GET", pathname: "/api/expenses/streak" }, { streak: 6, current: 6, days: 6 });
  cy.intercept({ method: "POST", pathname: "/api/expenses/normalize-categories" }, { changed: 0 });

  cy.intercept({ method: "GET", pathname: "/api/goal/report" }, (req) => {
    const spent = sum(expenses);
    const achieved = INCOME - spent;
    req.reply({
      monthlySpent: spent,
      monthlySavingsGoal: GOAL,
      monthlySavingsAchieved: achieved,
      monthlyGoalMet: achieved >= GOAL,
      monthlyProgressPercent: Math.min(100, (achieved / GOAL) * 100),
      annualSpent: 41000,
      annualSavingsGoal: GOAL * 12,
      annualSavingsAchieved: 24100,
      annualGoalMet: false,
      annualProgressPercent: 91,
    });
  });
  cy.intercept({ method: "GET", pathname: "/api/goal/status-summary" }, { monthlyPercent: 100, percent: 100, monthlyProgressPercent: 100 });
  cy.intercept({ method: "POST", pathname: "/api/goal/snapshot" }, {});
  cy.intercept({ method: "GET", pathname: "/api/financialprofile" }, (req) => req.reply(profile));
  cy.intercept({ method: "PUT", pathname: "/api/financialprofile" }, (req) => {
    profile = { ...profile, ...req.body };
    req.reply({ statusCode: 204 });
  }).as("saveProfile");
  cy.intercept({ method: "GET", pathname: "/api/goal/score" }, { score: 82 });
}
