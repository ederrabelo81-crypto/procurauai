import { describe, expect, it } from "vitest";

import { formatEnvHelp, looksLikePublicSupabaseKey, readEnv } from "../lib/env.mjs";
import { describeSupabaseFailure } from "../lib/supabase.mjs";

const jwt = (payload) =>
  `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.assinatura`;

describe("readEnv", () => {
  it("prefere o shell e nem toca nos arquivos .env", () => {
    let loaded = false;
    const result = readEnv(["SUPABASE_URL"], {
      env: { SUPABASE_URL: "https://do-shell.supabase.co" },
      load: () => {
        loaded = true;
      },
    });
    expect(result).toMatchObject({ value: "https://do-shell.supabase.co", source: "ambiente" });
    expect(loaded).toBe(false);
  });

  it("cai para o .env.local quando o shell não tem a variável", () => {
    const env = {};
    const result = readEnv(["SUPABASE_URL"], {
      env,
      load: () => {
        env.SUPABASE_URL = "https://do-arquivo.supabase.co";
      },
    });
    expect(result).toMatchObject({ value: "https://do-arquivo.supabase.co", source: ".env.local" });
  });

  it("respeita a ordem dos apelidos (SUPABASE_URL antes de VITE_SUPABASE_URL)", () => {
    const env = { SUPABASE_URL: "https://a.supabase.co", VITE_SUPABASE_URL: "https://b.supabase.co" };
    expect(readEnv(["SUPABASE_URL", "VITE_SUPABASE_URL"], { env, load: () => {} })).toMatchObject({
      name: "SUPABASE_URL",
      value: "https://a.supabase.co",
    });
  });

  it("usa o apelido VITE_ quando é o único disponível", () => {
    const env = { VITE_SUPABASE_URL: "https://b.supabase.co" };
    expect(readEnv(["SUPABASE_URL", "VITE_SUPABASE_URL"], { env, load: () => {} })).toMatchObject({
      name: "VITE_SUPABASE_URL",
      value: "https://b.supabase.co",
    });
  });

  it("ignora valor em branco e apara espaços", () => {
    expect(readEnv(["A"], { env: { A: "   " }, load: () => {} }).value).toBe("");
    expect(readEnv(["A"], { env: { A: "  x  " }, load: () => {} }).value).toBe("x");
  });

  it("aceita um nome avulso, não só lista", () => {
    expect(readEnv("DEEPL_API_KEY", { env: { DEEPL_API_KEY: "k" }, load: () => {} }).value).toBe("k");
  });
});

describe("looksLikePublicSupabaseKey", () => {
  it("reconhece a chave publishable nova", () => {
    expect(looksLikePublicSupabaseKey("sb_publishable_abc123")).toBe(true);
  });

  it("reconhece o JWT com role anon", () => {
    expect(looksLikePublicSupabaseKey(jwt({ role: "anon", iss: "supabase" }))).toBe(true);
  });

  it("aceita a service_role", () => {
    expect(looksLikePublicSupabaseKey(jwt({ role: "service_role" }))).toBe(false);
    expect(looksLikePublicSupabaseKey("sb_secret_abc123")).toBe(false);
  });

  it("não quebra com valor vazio ou lixo", () => {
    expect(looksLikePublicSupabaseKey("")).toBe(false);
    expect(looksLikePublicSupabaseKey(undefined)).toBe(false);
    expect(looksLikePublicSupabaseKey("a.b.c")).toBe(false);
  });
});

describe("formatEnvHelp", () => {
  const help = formatEnvHelp({
    missing: ["SUPABASE_SERVICE_ROLE_KEY"],
    script: "scripts/import-businesses.mjs",
    vars: [
      ["SUPABASE_URL", "https://SEU-PROJETO.supabase.co"],
      ["SUPABASE_SERVICE_ROLE_KEY", "cole_aqui"],
    ],
  });

  it("lista o que falta e ensina as duas formas de configurar", () => {
    expect(help).toContain("Faltando: SUPABASE_SERVICE_ROLE_KEY");
    expect(help).toContain("SUPABASE_URL=https://SEU-PROJETO.supabase.co");
    expect(help).toContain('$env:SUPABASE_URL="https://SEU-PROJETO.supabase.co"');
    expect(help).toContain("SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-businesses.mjs");
  });

  it("avisa que a sintaxe do bash não funciona no PowerShell", () => {
    expect(help).toContain("PowerShell");
    expect(help).toContain("NÃO funciona");
  });
});

describe("describeSupabaseFailure", () => {
  it("explica chave recusada", () => {
    const described = describeSupabaseFailure(new Error("Invalid API key"), {
      supabaseUrl: "https://x.supabase.co",
    });
    expect(described.title).toContain("recusou a chave");
    expect(described.hint).toContain("service_role");
  });

  it("explica bloqueio de RLS", () => {
    const described = describeSupabaseFailure({
      message: 'new row violates row-level security policy for table "businesses"',
    });
    expect(described.title).toContain("RLS");
  });

  it("explica tabela ausente", () => {
    const described = describeSupabaseFailure({
      message: "Could not find the table 'public.businesses' in the schema cache",
    });
    expect(described.hint).toContain("schema.sql");
  });

  it("distingue coluna ausente de tabela ausente", () => {
    const described = describeSupabaseFailure({
      message: "Could not find the 'lat' column of 'businesses' in the schema cache",
    });
    expect(described.title).toContain("'lat'");
    expect(described.hint).toContain("latitude/longitude");
    expect(described.hint).not.toContain("schema.sql");
  });

  it("explica falha de rede", () => {
    expect(describeSupabaseFailure(new Error("fetch failed")).title).toContain("falar com o Supabase");
  });

  it("devolve null para erro desconhecido, sem esconder o original", () => {
    expect(describeSupabaseFailure(new Error("algo totalmente inesperado"))).toBeNull();
  });
});
