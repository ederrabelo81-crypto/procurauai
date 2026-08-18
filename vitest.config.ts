import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}", "scripts/**/*.{test,spec}.mjs"],
    // `src/config/env.ts` valida as variáveis com Zod e derruba o processo se
    // faltar alguma. Sem estes valores de mentira, qualquer teste que importe
    // um módulo que use `env` (logger, services, páginas) quebra na coleta.
    // Antes isso passava porque havia um .env.local versionado no repositório —
    // não pode voltar a depender disso: é lá que mora a service_role.
    env: {
      VITE_SUPABASE_URL: "https://teste.supabase.co",
      VITE_SUPABASE_ANON_KEY: "chave-anon-de-teste",
      VITE_ENVIRONMENT: "development",
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
