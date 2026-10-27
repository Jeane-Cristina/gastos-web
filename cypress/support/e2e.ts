import { stubApi } from "./api";

// Em todos os testes a API é simulada: o teste não depende de backend, banco nem do
// tempo de acordar do servidor no Render. O que está sendo testado é o fluxo da tela.
beforeEach(() => {
  stubApi();
});
