const linha = (descricao: string) => cy.contains("[data-testid=expense-list] li", descricao);

describe("Lançamentos: editar, excluir e filtrar", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get("[data-testid=demo-button]").click();
    cy.get("[data-testid=expense-list]").should("contain.text", "Combustível");
  });

  it("edita o valor de uma despesa", () => {
    linha("Combustível").contains("button", "editar").click();

    // Durante a edição a linha troca o texto por campos, então ela é localizada pelo modo de edição.
    cy.get("[data-testid=expense-list] .expense-item__edit-row").should("be.visible");
    cy.get("[data-testid=expense-list] .expense-item__edit-row input[type=number]").type("{selectall}250");
    cy.get("[data-testid=expense-list] .expense-item__edit-row").contains("button", "salvar").click();

    cy.wait("@updateExpense").its("request.body").should((body) => {
      expect(body).to.include({ description: "Combustível", amount: 250 });
    });
    linha("Combustível").should("contain.text", "250,00");
  });

  it("exclui uma despesa", () => {
    linha("Combustível").contains("button", "excluir").click();

    cy.wait("@deleteExpense").its("request.url").should("match", /\/expenses\/3$/);
    cy.get("[data-testid=expense-list]").should("not.contain.text", "Combustível");
    cy.get("[data-testid=expense-list]").should("contain.text", "Aluguel");
  });

  it("filtra por categoria e limpa o filtro", () => {
    cy.contains("select", "Todas as categorias").select("Alimentação");

    // @listExpenses também guarda as chamadas do carregamento inicial, então procura entre todas.
    cy.get("@listExpenses.all").should((chamadas) => {
      const urls = (chamadas as unknown as { request: { url: string } }[]).map((c) => c.request.url);
      expect(urls.some((u) => u.includes("category=Aliment"))).to.eq(true);
    });
    cy.get("[data-testid=expense-list]")
      .should("contain.text", "Supermercado Bom Preço")
      .and("not.contain.text", "Aluguel");

    cy.contains("button", "Limpar filtros").click();
    cy.get("[data-testid=expense-list]").should("contain.text", "Aluguel");
  });

  it("filtra só os lançamentos não pagos", () => {
    cy.contains("select", "Pago ou não pago").select("Não pago");

    cy.get("[data-testid=expense-list]")
      .should("contain.text", "Curso online de inglês")
      .and("not.contain.text", "Aluguel");
  });

  it("mostra a lista vazia quando o mês filtrado não tem lançamentos", () => {
    cy.contains("select", "Todos os meses").select("Janeiro");

    cy.get("[data-testid=expense-list] li").should("not.exist");
  });
});
