const campo = (rotulo: string) => cy.contains("label", rotulo).invoke("attr", "for").then((id) => cy.get(`#${CSS.escape(id!)}`));

describe("Metas e Insights", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get("[data-testid=demo-button]").click();
    cy.get("[data-testid=month-overview]").should("be.visible");
    cy.contains("button", "Metas & Insights").click();
  });

  it("mostra o perfil financeiro e salva uma alteração", () => {
    campo("Renda mensal").invoke("val").should("match", /R\$\s6\.500,00/);

    campo("Quanto quero guardar por mês").clear().type("2500");
    campo("Objetivo de curto prazo").clear().type("Viagem em março");
    cy.contains("button", "Salvar").click();

    cy.wait("@saveProfile").its("request.body").should((body) => {
      expect(body).to.include({ savingsGoal: 2500, shortTermGoal: "Viagem em março" });
    });
    cy.contains("Perfil salvo!").should("be.visible");
  });

  it("abre os relatórios com o resultado da meta do mês e do ano", () => {
    cy.contains("button", "Relatórios").click();

    cy.contains("Relatório de metas").should("be.visible");
    cy.contains("Meta atingida").should("be.visible");
    cy.contains("Abaixo da meta").should("be.visible");
  });
});
