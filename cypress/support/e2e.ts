import { stubApi } from "./api";

// O app é um PWA e registra um service worker (registerType: autoUpdate). No Cypress isso
// atrapalha: o service worker assume a página, recarrega no meio do teste e as requisições
// dele escapam do cy.intercept. Removendo a API antes de a página carregar, o app não registra nada.
Cypress.on("window:before:load", (win) => {
  Reflect.deleteProperty(Object.getPrototypeOf(win.navigator), "serviceWorker");
});

// Em todos os testes a API é simulada: o teste não depende de backend, banco nem do
// tempo de acordar do servidor no Render. O que está sendo testado é o fluxo da tela.
beforeEach(() => {
  stubApi();
});
