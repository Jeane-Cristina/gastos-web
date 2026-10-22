# 💰 Controle de Gastos — Frontend

Interface web (PWA) do app de controle e planejamento financeiro pessoal. Construída em React + TypeScript e consumindo a API REST em C#/ASP.NET Core.

**🔗 App em produção:** [gastos-web-ten.vercel.app](https://gastos-web-ten.vercel.app)
**🔗 Repositório do backend:** [github.com/Jeane-Cristina/gastos](https://github.com/Jeane-Cristina/gastos)

> ⚠️ A API roda no plano gratuito do Render, que "dorme" após 15 minutos sem uso. O primeiro carregamento pode levar de 30 a 60 segundos.

Arquitetura geral, decisões de produto, princípios de engajamento ético e a explicação de como os insights de IA funcionam estão no [README do backend](https://github.com/Jeane-Cristina/gastos). Este documento cobre o que é específico do frontend.

---

## 🛠️ Stack

| Tecnologia | Uso |
|---|---|
| **React 18 + TypeScript** | Interface e tipagem estática |
| **Vite** | Build e servidor de desenvolvimento |
| **Vitest + Testing Library + user-event** | Testes automatizados |
| **vite-plugin-pwa** | Manifesto e service worker (instalação como app) |
| **Recharts** | Gráficos |
| **React Markdown** | Renderização dos insights de IA |
| **PapaParse** | Leitura de extratos bancários em CSV |
| **Lucide React** | Ícones |
| **CSS puro + Design Tokens** | Identidade visual própria, modo claro e escuro |

Sem Redux ou gerenciador de estado externo: o estado é resolvido com `useState`/`useEffect` e hooks customizados, o que basta para este porte.

---

## ✨ Destaques técnicos

- **Hooks customizados** (`useExpenses`, `useSummary`, `useAllCategories`, `useTheme`) isolam dados e preferências dos componentes de apresentação, com tratamento explícito de `loading` e `error`
- **Edição inline:** cada despesa vira um mini-formulário ao clicar em editar
- **Filtros e paginação** conectados aos query parameters da API
- **Importação de extrato (CSV):** tratamento de formatos numéricos (separador de milhar `.`, decimal `,`, negativos), sugestão de categoria, marcação de possíveis duplicatas e prévia editável antes de confirmar
- **Menu lateral off-canvas** com o mesmo comportamento em desktop e mobile
- **Modo escuro** via CSS Custom Properties: o tema alterna redefinindo um único bloco de variáveis
- **Insights de IA renderizados em Markdown**, com seleção de período (semanal, mensal, trimestral)
- **Contas conjuntas:** convites, despesas compartilhadas e contribuição por membro
- **PWA instalável** em Android e iOS, com manifesto, ícones em vários tamanhos e meta tags para iOS
- **Variável de ambiente `VITE_API_URL`** para apontar para diferentes ambientes sem alterar código
- **Testes** de componente de exibição (`ExpenseList`), componente com formulário e interação (`ExpenseForm`) e lógica pura (`calculateTotal`)

---

## 🚀 Rodando localmente

### Pré-requisitos
- [Node.js 20+](https://nodejs.org)
- Backend rodando localmente (veja o [README do backend](https://github.com/Jeane-Cristina/gastos)) ou a API de produção

### Passos

```bash
git clone https://github.com/Jeane-Cristina/gastos-web
cd gastos-web
cp .env.example .env.local     # Windows PowerShell: Copy-Item .env.example .env.local
npm install
npm run dev
```

O app abre em `http://localhost:5173`. O `.env.example` aponta para `http://localhost:5134/api`; para usar a API de produção, ajuste o valor de `VITE_API_URL` no `.env.local`.

Arquivos `.env*` reais não são versionados; apenas o `.env.example`.

### Testando como PWA

PWA não funciona em modo dev; use o build de produção:

```bash
npm run build
npm run preview
```

Acesse `http://localhost:4173`. O ícone de instalação aparece na barra de endereço (Chrome) ou no menu de compartilhamento (Safari/iOS).

---

## 🧪 Testes

```bash
npm run test
```

Roda em modo watch por padrão.

---

## 📂 Estrutura

```
src/
├── components/   # Componentes de apresentação (+ .test.tsx ao lado)
├── hooks/        # Lógica de estado reaproveitável
├── services/     # Chamadas HTTP isoladas
├── utils/        # Funções puras
└── test/         # Setup do ambiente de testes (Vitest + jsdom)
```

Áreas principais:
- **Lançamentos:** `ExpenseForm`, `ExpenseList`, `ExpenseFiltersBar`, `Pagination`, `RecurringExpenses`, `BankImport`
- **Metas e insights:** `FinancialProfileForm`, `PurchaseGoals`, `GoalReport`, `GoalHistory`, `WeeklyInsight`, `CategoryPieChart`, `CategoryBudgets`, `GoalScore`
- **Investimentos:** `Investments`
- **Contas conjuntas:** `JointAccounts`
- **Navegação:** `TopBar`, `Sidebar`

Cada componente carrega seu próprio `.css`, com os design tokens definidos globalmente em `index.css`.

---

## 🔮 Próximos passos

- Usar o refresh token no frontend (hoje a sessão depende do token de acesso)
- Funcionamento offline completo via Service Worker
- Ajustar a ordem das tags do `index.html` (`apple-touch-icon` fora do `<head>`)

---

## 👩‍💻 Autora

**Jeane Cristina Oliveira Martins** — Desenvolvedora Full Stack (C#/.NET, React/TypeScript)
[LinkedIn](https://linkedin.com/in/jeane-cristina-dev) · [GitHub](https://github.com/Jeane-Cristina)
