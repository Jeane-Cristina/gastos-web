import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // A aplicação é servida pelo `vite preview` (porta 4173), já com o build feito.
    baseUrl: "http://localhost:4173",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    video: false,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 800,
    defaultCommandTimeout: 8000,
  },
});
