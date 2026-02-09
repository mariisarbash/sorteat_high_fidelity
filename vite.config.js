import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from "path"

export default defineConfig({
  // Rimosso 'logLevel: error' per ora, così se c'è un errore lo vediamo nel terminale!
  plugins: [
    base44({
      legacySDKImports: true,
      hmrNotifier: true,
      navigationNotifier: true,
      visualEditAgent: true
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});