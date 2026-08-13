/**
 * Normaliza para pt-BR as descrições dos comércios já cadastrados.
 *
 * A carga inicial da base gravou descrições no formato
 * "Beauty salon em Centro. Nota: 4.400000 (21 avaliações)." — tipo do Google em
 * inglês e nota com as seis casas decimais do Postgres. Este script reescreve
 * para "Salão de beleza em Centro. Nota 4,4 (21 avaliações).".
 *
 * Uso:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/fix-descriptions.mjs --dry-run
 *
 * Opções:
 *   --dry-run    mostra o antes/depois sem gravar nada
 *   --limit=N    processa só os N primeiros (bom para testar)
 *
 * É idempotente: rodar de novo sobre a base já corrigida não muda nada.
 * Diferente de scripts/translate-businesses.mjs, não depende do DeepL — a
 * descrição segue um template fixo, então a conversão é determinística e o
 * mapa de tipos fica versionado em scripts/lib/googleTypes.mjs.
 */

import { createClient } from "@supabase/supabase-js";

import { translateDescription } from "./lib/businessDescription.mjs";
import { formatEnvHelp, looksLikePublicSupabaseKey, readEnv } from "./lib/env.mjs";
import { describeSupabaseFailure } from "./lib/supabase.mjs";

const supabaseUrl = readEnv(["SUPABASE_URL", "VITE_SUPABASE_URL"]);
const serviceRoleKey = readEnv(["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_KEY"]);

if (!supabaseUrl.value || !serviceRoleKey.value) {
  const missing = [];
  if (!supabaseUrl.value) missing.push("SUPABASE_URL");
  if (!serviceRoleKey.value) missing.push("SUPABASE_SERVICE_ROLE_KEY");

  console.error("✖ Credenciais do Supabase não encontradas.\n");
  console.error(
    formatEnvHelp({
      missing,
      script: "scripts/fix-descriptions.mjs",
      vars: [
        ["SUPABASE_URL", "https://SEU-PROJETO.supabase.co"],
        ["SUPABASE_SERVICE_ROLE_KEY", "cole_aqui_a_service_role"],
      ],
    }),
  );
  process.exit(1);
}

if (looksLikePublicSupabaseKey(serviceRoleKey.value)) {
  console.error(
    `✖ ${serviceRoleKey.name} contém uma chave pública (anon/publishable), não a service_role.\n\n` +
      "  Com ela a atualização é bloqueada pelas policies de RLS.\n" +
      "  Pegue a correta em Settings → API Keys → service_role (secret).",
  );
  process.exit(1);
}

const SUPABASE_URL = supabaseUrl.value;
const SUPABASE_SERVICE_ROLE_KEY = serviceRoleKey.value;

console.log(
  `Supabase: ${SUPABASE_URL} (${supabaseUrl.name} de ${supabaseUrl.source}, ` +
    `chave de ${serviceRoleKey.source})`,
);

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const limitArg = args.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.replace("--limit=", "")) : Infinity;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

/** Uma casa decimal também na coluna, não só no texto da descrição. */
function roundRating(value) {
  if (value === null || value === undefined) return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.round(number * 10) / 10;
}

async function fetchAllBusinesses() {
  const all = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id, name, category, description, rating")
      .order("id")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    all.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return all;
}

const run = async () => {
  const businesses = (await fetchAllBusinesses()).slice(0, limit);
  console.log(`Lidos ${businesses.length} registros${dryRun ? " (dry-run)" : ""}.`);

  const pending = [];
  const untranslated = new Map();
  let semTemplate = 0;

  for (const business of businesses) {
    const patch = {};

    const result = translateDescription(business.description, {
      fallbackType: business.category,
    });

    if (result) {
      if (result.untranslatedType) {
        untranslated.set(
          result.untranslatedType,
          (untranslated.get(result.untranslatedType) ?? 0) + 1,
        );
      }
      if (result.changed) patch.description = result.description;
    } else if (business.description) {
      semTemplate += 1;
    }

    const rounded = roundRating(business.rating);
    if (rounded !== null && rounded !== Number(business.rating)) patch.rating = rounded;

    if (Object.keys(patch).length > 0) {
      pending.push({ id: business.id, name: business.name, before: business.description, patch });
    }
  }

  console.log(`A corrigir: ${pending.length}. Já em pt-BR ou sem descrição: ${businesses.length - pending.length}.`);
  if (semTemplate > 0) {
    console.log(`ℹ ${semTemplate} descrição(ões) fora do template — deixadas intactas.`);
  }
  if (untranslated.size > 0) {
    console.log("\n⚠ Tipos sem tradução no mapa (mantidos como estão; acrescente em scripts/lib/googleTypes.mjs):");
    for (const [type, count] of [...untranslated].sort((a, b) => b[1] - a[1])) {
      console.log(`    ${type} (${count})`);
    }
  }

  if (pending.length === 0) {
    console.log("\nNada a fazer.");
    return 0;
  }

  if (dryRun) {
    console.log("\n(dry-run) Primeiras mudanças:");
    for (const { name, before, patch } of pending.slice(0, 10)) {
      console.log(`\n  ${name}`);
      if (patch.description) {
        console.log(`    antes:  ${before}`);
        console.log(`    depois: ${patch.description}`);
      }
      if (patch.rating !== undefined) console.log(`    rating: ${patch.rating}`);
    }
    console.log(`\n(dry-run) Nada gravado. Rode sem --dry-run para aplicar as ${pending.length} correções.`);
    return 0;
  }

  let updated = 0;
  let firstError = null;
  for (const { id, name, patch } of pending) {
    const { error } = await supabase.from("businesses").update(patch).eq("id", id);
    if (error) {
      firstError ??= error;
      console.error(`Erro ao atualizar "${name}":`, error.message);
    } else {
      updated += 1;
      if (updated % 50 === 0) console.log(`Atualizados ${updated}/${pending.length}...`);
    }
  }

  if (updated === 0 && firstError) {
    console.error(`\n✖ Nenhum registro gravado. Primeiro erro: ${firstError.message}`);
    const described = describeSupabaseFailure(firstError, { supabaseUrl: SUPABASE_URL });
    if (described) console.error(`\n  ${described.hint}`);
    return 1;
  }

  console.log(`\nConcluído: ${updated} descrições normalizadas.`);
  if (firstError) {
    console.log("⚠ Parte falhou — reveja os erros acima e rode de novo (é idempotente).");
  }
  return firstError ? 2 : 0;
};

run()
  .then((code) => {
    process.exitCode = code ?? 0;
  })
  .catch((error) => {
    const described = describeSupabaseFailure(error, { supabaseUrl: SUPABASE_URL });
    if (described) {
      console.error(`✖ ${described.title}`);
      console.error(`\n  ${described.hint}`);
    } else {
      console.error("Falha no script:", error);
    }
    process.exit(1);
  });
