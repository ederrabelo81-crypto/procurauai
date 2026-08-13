/**
 * Leitura de variáveis de ambiente para os scripts de `scripts/`.
 *
 * Os scripts rodam fora do app (Node puro), então não passam pelo Vite nem pelo
 * `src/config/env.ts`: sem isto, `.env.local` era simplesmente ignorado e o
 * script reclamava de variável faltando com a chave já configurada no arquivo.
 *
 * Precedência: o que está exportado no shell sempre ganha do arquivo.
 */

import { existsSync } from "node:fs";

const DEFAULT_ENV_FILES = [".env.local", ".env"];

let alreadyLoaded = false;

/** Carrega .env.local e .env para process.env (uma vez por processo). */
export function loadEnvFiles(files = DEFAULT_ENV_FILES) {
  if (alreadyLoaded) return;
  alreadyLoaded = true;

  for (const file of files) {
    if (!existsSync(file)) continue;
    try {
      process.loadEnvFile(file);
    } catch {
      // arquivo malformado não deve derrubar o script — o valor ainda pode vir do shell
    }
  }
}

/**
 * Procura o primeiro nome preenchido, tentando o shell antes dos arquivos .env.
 * `names` aceita apelidos em ordem de preferência (ex.: SUPABASE_URL, VITE_SUPABASE_URL).
 */
export function readEnv(names, { env = process.env, load = loadEnvFiles } = {}) {
  const list = Array.isArray(names) ? names : [names];
  const pick = () => list.find((name) => env[name]?.trim());

  const fromShell = pick();
  if (fromShell) return { name: fromShell, value: env[fromShell].trim(), source: "ambiente" };

  load();

  const fromFile = pick();
  if (fromFile) return { name: fromFile, value: env[fromFile].trim(), source: ".env.local" };

  return { name: "", value: "", source: "" };
}

/**
 * Detecta chave pública do Supabase (anon/publishable) usada onde se espera a
 * service role. A anon é barrada pelas policies de RLS, e o erro que aparece
 * ("new row violates row-level security policy") não deixa claro que a causa
 * foi a chave trocada.
 */
export function looksLikePublicSupabaseKey(key) {
  const value = String(key ?? "").trim();
  if (!value) return false;
  if (value.startsWith("sb_publishable_")) return true;

  const parts = value.split(".");
  if (parts.length === 3) {
    try {
      const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
      return payload.role === "anon";
    } catch {
      return false;
    }
  }
  return false;
}

/** Bloco de ajuda com as duas formas de configurar (arquivo ou terminal). */
export function formatEnvHelp({ missing, script, vars }) {
  const fileLines = vars.map(([name, example]) => `    ${name}=${example}`).join("\n");
  const powershell = vars.map(([name, example]) => `$env:${name}="${example}"`).join("; ");
  const bash = vars.map(([name]) => `${name}=...`).join(" ");

  return [
    `  Faltando: ${missing.join(", ")}`,
    "",
    "  Opção 1 — .env.local na raiz do projeto (git-ignored; o script lê sozinho):",
    fileLines,
    "",
    "  Opção 2 — só nesta sessão do terminal:",
    "    PowerShell (Windows):",
    `      ${powershell}`,
    `      node ${script} ...`,
    "    bash/zsh (Linux/macOS):",
    `      ${bash} node ${script} ...`,
    "",
    "  Atenção: no PowerShell o formato `VAR=valor node script.mjs` (bash) NÃO funciona —",
    "  use `$env:VAR=\"valor\"` numa linha antes de chamar o node.",
  ].join("\n");
}
