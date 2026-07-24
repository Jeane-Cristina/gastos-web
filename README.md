# 💰 Controle de Gastos — Frontend

Interface web (PWA) de um app completo de controle e planejamento financeiro pessoal. Construída em React + TypeScript, consumindo a API REST do backend.

**🔗 App em produção:** [gastos-web-ten.vercel.app](https://gastos-web-ten.vercel.app)
**🔗 Repositório do backend:** [github.com/Jeane-Cristina/gastos](https://github.com/Jeane-Cristina/gastos)

> ⚠️ A API roda no plano gratuito do Render, que "dorme" após 15 minutos sem uso. O primeiro carregamento do dia pode levar de 30 a 60 segundos.

Para o contexto completo do projeto — arquitetura, jornada de aprendizado, desafios técnicos, como o agente de IA funciona — veja o [README do backend](https://github.com/Jeane-Cristina/gastos), que é a documentação principal. Este README foca no que é específico do frontend.

---

## 🛠️ Stack

| Tecnologia | Uso |
|---|---|
| **React 18 + TypeScript** | Interface e tipagem estática |
| **Vite** | Build tool e dev server |
| **Vitest + Testing Library + user-event** | Testes automatizados |
| **vite-plugin-pwa** | Manifesto e service worker (instalação como app) |
| **Recharts** | Gráficos de pizza, radar (gauge), barras e linha |
| **React Markdown** | Renderização formatada dos insights gerados pela IA |
| **PapaParse** | Leitura e parsing de extratos bancários em CSV |
| **jsPDF + html2canvas** | Captura visual de seções da tela e exportação em PDF |
| **Lucide React** | Ícones do menu de navegação |
| **CSS puro + Design Tokens** | Identidade visual própria, com suporte a modo claro/escuro, sem biblioteca de UI |

Sem Redux, sem gerenciador de estado externo — todo o estado é resolvido com `useState`/`useEffect` e hooks customizados, proposital para um app deste porte.

---

## ✨ Destaques técnicos

- **Hooks customizados** (`useExpenses`, `useSummary`, `useAllCategories`, `useTheme`) isolam a lógica de dados e preferências dos componentes de apresentação, com tratamento explícito de `loading`/`error`
- **Edição inline**: cada despesa vira seu próprio mini-formulário ao clicar em "editar", sem navegação nem scroll até um formulário separado
- **Menu lateral off-canvas**: navegação por Sidebar que desliza sobre o conteúdo (não empurra layout), com indicador de status colorido refletindo o progresso da meta, consistente em desktop e mobile
- **Modo escuro** via CSS Custom Properties: como todo o projeto referencia variáveis (`var(--paper)`, `var(--ink)`, etc.) em vez de cor fixa, o tema inteiro alterna redefinindo um único bloco de variáveis, sem tocar nos demais arquivos CSS
- **Sistema de design próprio**: paleta, tipografia (`Space Mono` + `IBM Plex Sans`) e um elemento de assinatura visual (linha pontilhada entre descrição e valor, como em nota fiscal), tudo via CSS Custom Properties
- **Importação de extrato bancário**: parsing de CSV com tratamento de formatos numéricos variados (separador de milhar `.`, decimal `,`, valores negativos com espaço), prévia editável antes de confirmar, e sugestão automática de categoria
- **Renderização de conteúdo gerado por IA**: o insight semanal vem estruturado em seções (via Markdown), parseado e formatado com `react-markdown` — negrito, listas e ênfases da IA aparecem como elementos reais, não texto com asterisco literal
- **Testes automatizados**, cobrindo três categorias diferentes:
  - Componente de exibição pura (`ExpenseList`)
  - Componente com formulário e interação de usuário (`ExpenseForm`)
  - Lógica extraída e testada isoladamente (`calculateTotal`)
- **PWA real**: manifesto configurado, ícones em múltiplos tamanhos, meta tags específicas para iOS — instalável tanto em Android quanto iPhone, sem passar por loja de aplicativos
- **Variáveis de ambiente** (`VITE_API_URL`) para apontar a diferentes ambientes de API sem alterar código

---

## 🚀 Rodando localmente

### Pré-requisitos
- [Node.js 20+](https://nodejs.org)
- Backend rodando localmente (veja o [README do backend](https://github.com/Jeane-Cristina/gastos)) ou apontado para a API em produção

### Passos

```bash
npm install
npm run dev
```

O app abre em `http://localhost:5173`. Por padrão, aponta para `http://localhost:5134/api` (backend local) — ajuste os arquivos em `src/services/` se necessário, ou configure a variável `VITE_API_URL`.

### Testando como PWA localmente

PWA não funciona em modo dev — precisa do build de produção:

```bash
npm run build
npm run preview
```

Acesse `http://localhost:4173` no navegador — o ícone de instalação deve aparecer na barra de endereço (Chrome) ou no menu de compartilhamento (Safari/iOS).

---

## 🧪 Testes

```bash
npm run test
```

Roda em modo watch por padrão — os testes reagem a mudanças de arquivo automaticamente.

---

## 📂 Estrutura

```
src/
├── components/       # Componentes de apresentação (+ arquivos .test.tsx ao lado)
├── hooks/             # Lógica de estado reaproveitável (useExpenses, useSummary, useTheme, useAllCategories)
├── services/           # Chamadas HTTP isoladas (expenseApi, authApi, profileApi)
├── utils/               # Funções puras (calculateTotal)
└── test/                 # Setup do ambiente de testes (Vitest + jsdom)
```

Componentes principais por área:
- **Lançamentos**: `ExpenseForm`, `ExpenseList` (com edição inline), `ExpenseFiltersBar`, `BankImport`
- **Metas & Insights**: `FinancialProfileForm`, `PurchaseGoals`, `GoalReport`, `GoalRadar`, `GoalHistory`, `WeeklyInsight`, `CategoryPieChart`, `MonthComparisonChart`, `StatusBadge`
- **Investimentos**: `Investments`
- **Navegação**: `TopBar`, `Sidebar`

Cada componente carrega seu próprio arquivo `.css` (design tokens definidos globalmente em `index.css`), e cada componente relevante tem seu teste correspondente lado a lado — facilita encontrar e manter os dois juntos.

---

## 👩‍💻 Autora

**Jeane Cristina**
[GitHub](https://github.com/Jeane-Cristina)
