/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Controle de Gastos',
        short_name: 'Gastos',
        description: 'Registre, edite e acompanhe seus gastos por categoria',
        theme_color: '#3B4B6B',
        background_color: '#F5F2E8',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icon.jpg',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon.jpg',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon.jpg',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})