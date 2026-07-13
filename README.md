# 💰 Controle de Gastos — Frontend

Interface web (PWA) do app de controle de gastos pessoais. Construída em React + TypeScript, consumindo a API REST do backend.

**🔗 App em produção:** [gastos-web-ten.vercel.app](https://gastos-web-ten.vercel.app)
**🔗 Repositório do backend:** [github.com/Jeane-Cristina/gastos](https://github.com/Jeane-Cristina/gastos)

> ⚠️ A API roda no plano gratuito do Render, que "dorme" após 15 minutos sem uso. O primeiro carregamento do dia pode levar de 30 a 60 segundos.

Para o contexto completo do projeto — arquitetura, jornada de aprendizado, desafios técnicos — veja o [README do backend](https://github.com/Jeane-Cristina/gastos), que é a documentação principal. Este README foca no que é específico do frontend.

---


## 🛠️ Stack

| Tecnologia | Uso |
|---|---|
| **React 18 + TypeScript** | Interface e tipagem estática |
| **Vite** | Build tool e dev server |
| **Vitest + Testing Library + user-event** | Testes automatizados |
| **vite-plugin-pwa** | Manifesto e service worker (instalação como app) |
| **CSS puro + Design Tokens** | Identidade visual própria, sem biblioteca de UI |

Sem Redux, sem gerenciador de estado externo — todo o estado é resolvido com `useState`/`useEffect` e hooks customizados, proposital para um app deste porte.

---

## ✨ Destaques técnicos

- **Hooks customizados** (`useExpenses`, `useSummary`) isolam a lógica de dados dos componentes de apresentação, com tratamento explícito de `loading`/`error`
- **Um único formulário reaproveitado** para criar e editar despesas, controlado por estado — padrão comum em telas de CRUD
- **Sistema de design próprio**: paleta, tipografia (`Space Mono` + `IBM Plex Sans`) e um elemento de assinatura visual (linha pontilhada entre descrição e valor, como em nota fiscal), tudo via CSS Custom Properties
- **11 testes automatizados**, cobrindo três categorias diferentes:
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

O app abre em `http://localhost:5173`. Por padrão, aponta para `http://localhost:5134/api` (backend local) — ajuste `src/services/expenseApi.ts` e `authApi.ts` se necessário, ou configure a variável `VITE_API_URL`.

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
├── hooks/             # Lógica de estado reaproveitável (useExpenses, useSummary)
├── services/           # Chamadas HTTP isoladas (expenseApi, authApi)
├── utils/               # Funções puras (calculateTotal)
└── test/                 # Setup do ambiente de testes (Vitest + jsdom)
```

Cada componente carrega seu próprio arquivo `.css` (design tokens definidos globalmente em `index.css`), e cada componente relevante tem seu teste correspondente lado a lado — facilita encontrar e manter os dois juntos.

---

## 👩‍💻 Autora

**Jeane Cristina**
[GitHub](https://github.com/Jeane-Cristina)
