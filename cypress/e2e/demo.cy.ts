describe("Demonstração: do login ao primeiro lançamento", () => {
  it("entra na demonstração, lança uma despesa e vê o valor na lista", () => {
    cy.visit("/");

    // 1. Entra sem cadastro
    cy.get("[data-testid=demo-button]").should("be.visible").click();
    cy.wait("@listExpenses");

    cy.get("[data-testid=demo-banner]").should("contain.text", "conta demonstração");
    cy.get("[data-testid=month-overview]").should("contain.text", "Ainda pode gastar neste mês");
    cy.get("[data-testid=expense-list]").should("contain.text", "Aluguel");

    // 2. Lança uma despesa pelo botão rápido
    cy.get("[data-testid=quick-add-fab]").click();
    cy.get("[data-testid=quick-add-form]").within(() => {
      cy.get("input[placeholder=Valor]").type("42.50");
      cy.get("input[placeholder=Categoria]").type("Alimentação");
      cy.get("input[placeholder='Descrição (opcional)']").type("Almoço de teste");
      cy.contains("button", "Lançar").click();
    });

    // 3. O app enviou o lançamento certo e a lista o mostra
    cy.wait("@createExpense").its("request.body").should((body) => {
      expect(body).to.include({ description: "Almoço de teste", category: "Alimentação", amount: 42.5 });
    });
    cy.get("[data-testid=quick-add-form]").should("not.exist");
    cy.get("[data-testid=expense-list]").should("contain.text", "Almoço de teste");
  });

  it("sai da conta e volta para a tela de login", () => {
    cy.visit("/");
    cy.get("[data-testid=demo-button]").click();
    cy.get("[data-testid=month-overview]").should("be.visible");

    cy.get("[data-testid=logout-button]").click();

    cy.get("[data-testid=demo-button]").should("be.visible");
    cy.contains("button", "Entrar").should("be.visible");
    cy.window().then((win) => {
      expect(win.localStorage.getItem("token")).to.eq(null);
    });
  });
});

describe("Login", () => {
  it("mostra erro quando usuário ou senha estão errados", () => {
    cy.visit("/");
    cy.get("input[placeholder=Usuário]").type("alguem");
    cy.get("input[placeholder=Senha]").type("senha-errada");
    cy.contains("button", "Entrar").click();

    cy.get("[data-testid=demo-button]").should("be.visible");
    cy.get(".login-card__error").should("be.visible");
  });
});
