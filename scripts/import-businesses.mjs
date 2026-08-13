/**
 * Importa lugares coletados (scripts/collect-places.mjs) para a tabela businesses do Supabase.
 *
 * Uso:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/import-businesses.mjs --file=data/places/places-2026-07-22.json
 *
 * Opções:
 *   --file=caminho.json   (obrigatório; JSON gerado pela coleta, já revisado)
 *   --dry-run             (mostra o que faria sem gravar)
 *   --update              (além de inserir novos, atualiza registros existentes com mesmo google_place_id)
 *   --limit=N             (processa só os N primeiros — bom para testar)
 *
 * Regras:
 *   - Deduplica por google_place_id: o que já existe no banco não é inserido de novo.
 *   - NÃO importa fotos nem avaliações do Google (política do Google e qualidade:
 *     fotos devem vir do próprio comerciante).
 *   - category_slug é definido automaticamente pelo trigger do banco.
 */

import { existsSync, readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

import {
  ENRICHABLE_FIELDS,
  adaptRowToColumns,
  buildNameIndex,
  dedupeIncoming,
  fetchTableColumns,
  findExistingByName,
  pickEnrichment,
  toBusinessRow,
} from "./lib/businessRow.mjs";
import { formatEnvHelp, looksLikePublicSupabaseKey, readEnv } from "./lib/env.mjs";
import { describeSupabaseFailure } from "./lib/supabase.mjs";

// A URL não é secreta: se só existir a do front-end (VITE_), serve.
const supabaseUrl = readEnv(["SUPABASE_URL", "VITE_SUPABASE_URL"]);
// Já a chave precisa ser a service_role — a anon é barrada pelas policies de RLS.
const serviceRoleKey = readEnv(["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_KEY"]);

if (!supabaseUrl.value || !serviceRoleKey.value) {
  const missing = [];
  if (!supabaseUrl.value) missing.push("SUPABASE_URL");
  if (!serviceRoleKey.value) missing.push("SUPABASE_SERVICE_ROLE_KEY");

  console.error("✖ Credenciais do Supabase não encontradas.\n");
  console.error(
    formatEnvHelp({
      missing,
      script: "scripts/import-businesses.mjs",
      vars: [
        ["SUPABASE_URL", "https://SEU-PROJETO.supabase.co"],
        ["SUPABASE_SERVICE_ROLE_KEY", "cole_aqui_a_service_role"],
      ],
    }),
  );
  console.error(
    "\n  Onde achar: painel do Supabase → Settings → API Keys → service_role (secret).\n" +
      "  Ela NÃO é a anon/publishable que está no .env.local para o front-end.\n" +
      "  Essa chave ignora RLS: use só localmente e nunca commite.",
  );
  process.exit(1);
}

if (looksLikePublicSupabaseKey(serviceRoleKey.value)) {
  console.error(
    `✖ ${serviceRoleKey.name} contém uma chave pública (anon/publishable), não a service_role.\n\n` +
      "  Com ela a importação é bloqueada pelas policies de RLS.\n" +
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
const doUpdate = args.includes("--update");
const allowNameDuplicates = args.includes("--allow-name-duplicates");
const fileArg = args.find((a) => a.startsWith("--file="));
const limitArg = args.find((a) => a.startsWith("--limit="));

if (!fileArg) {
  console.error("Uso: node scripts/import-businesses.mjs --file=data/places/places-XXXX.json");
  process.exit(1);
}

const filePath = fileArg.replace("--file=", "");
const limit = limitArg ? Number(limitArg.replace("--limit=", "")) : Infinity;

if (!existsSync(filePath)) {
  console.error(`✖ Arquivo não encontrado: ${filePath}`);
  const placesDir = path.join("data", "places");
  if (existsSync(placesDir)) {
    const found = readdirSync(placesDir).filter((f) => f.endsWith(".json"));
    if (found.length > 0) {
      console.error("\n  Arquivos disponíveis em data/places:");
      for (const file of found) console.error(`    --file=${path.join(placesDir, file)}`);
    }
  } else {
    console.error("\n  Rode antes a coleta: node scripts/collect-places.mjs");
  }
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

/**
 * Traz os registros já cadastrados para o casamento por nome. Só as colunas
 * necessárias, paginado, porque a tabela cresce com o tempo.
 */
async function fetchExistingForMatching(client, columns) {
  const wanted = ["id", "name", "city", "google_place_id", ...ENRICHABLE_FIELDS];
  const select = [...new Set(wanted)]
    .filter((column) => !columns || columns.has(column))
    .join(",");

  const all = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await client
      .from("businesses")
      .select(select)
      .range(from, from + PAGE - 1);
    if (error) throw error;
    all.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return all;
}

const run = async () => {
  const raw = await readFile(filePath, "utf8");
  const records = JSON.parse(raw.replace(/^﻿/, ""));

  if (!Array.isArray(records) || records.length === 0) {
    console.log("Arquivo vazio ou inválido.");
    return;
  }

  // O schema real varia (lat/lng x latitude/longitude, com ou sem city):
  // descobre as colunas antes de montar as linhas.
  const columns = await fetchTableColumns(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, "businesses");
  if (!columns) {
    console.log(
      "⚠ Não consegui ler as colunas de businesses; seguindo com os nomes padrão.",
    );
  }

  const canonicalRows = records
    .slice(0, limit)
    .map(toBusinessRow)
    .filter((r) => r.name && r.google_place_id);

  let droppedFields = [];
  const adaptedRows = canonicalRows.map((row) => {
    const { row: adapted, dropped } = adaptRowToColumns(row, columns);
    if (dropped.length > droppedFields.length) droppedFields = dropped;
    return adapted;
  });

  // O arquivo da coleta pode trazer o mesmo comércio duas vezes (place_ids
  // diferentes para a mesma fachada). Sem isso os dois entram.
  const { unique: rows, duplicates } = allowNameDuplicates
    ? { unique: adaptedRows, duplicates: [] }
    : dedupeIncoming(adaptedRows);

  console.log(`Lidos ${records.length} registros; válidos para importar: ${rows.length}.`);
  if (duplicates.length > 0) {
    console.log(
      `⚠ ${duplicates.length} repetido(s) dentro do próprio arquivo (ignorados; ` +
        `use --allow-name-duplicates para importar assim mesmo):`,
    );
    for (const { dropped } of duplicates) {
      console.log(`    "${dropped.name}" — ${dropped.city ?? "sem cidade"} (${dropped.google_place_id})`);
    }
  }
  if (droppedFields.length > 0) {
    console.log(
      `⚠ Campos ignorados por não existirem na tabela: ${droppedFields.join(", ")}.`,
    );
  }

  // Busca os google_place_id que já existem no banco
  const placeIds = rows.map((r) => r.google_place_id);
  const existing = new Set();
  const CHUNK = 200;
  for (let i = 0; i < placeIds.length; i += CHUNK) {
    const { data, error } = await supabase
      .from("businesses")
      .select("google_place_id")
      .in("google_place_id", placeIds.slice(i, i + CHUNK));
    if (error) throw error;
    for (const row of data ?? []) existing.add(row.google_place_id);
  }

  // Parte da base foi carregada à mão, sem google_place_id: sem casar por nome,
  // cada um desses viraria uma segunda linha do mesmo comércio.
  const nameIndex = allowNameDuplicates
    ? new Map()
    : buildNameIndex(await fetchExistingForMatching(supabase, columns));

  const toInsert = [];
  const nameMatches = [];
  for (const row of rows) {
    if (existing.has(row.google_place_id)) continue;

    const match = findExistingByName(row, nameIndex);
    if (match) nameMatches.push({ existing: match, incoming: row });
    else toInsert.push(row);
  }

  const toUpdate = doUpdate ? rows.filter((r) => existing.has(r.google_place_id)) : [];

  // Só enriquece campo vazio: whatsapp, phone e is_verified vêm de campo e ficam intactos.
  const toEnrich = nameMatches
    .map(({ existing: current, incoming }) => ({
      id: current.id,
      name: current.name,
      patch: pickEnrichment(current, incoming),
    }))
    .filter(({ patch }) => Object.keys(patch).length > 0);

  console.log(
    `Novos: ${toInsert.length} | Já existentes por place_id: ${existing.size}` +
      (doUpdate ? ` (serão atualizados)` : ` (ignorados; use --update para atualizar)`),
  );
  if (nameMatches.length > 0) {
    console.log(
      `Já cadastrados com o mesmo nome: ${nameMatches.length} ` +
        `(não serão duplicados; ${toEnrich.length} têm campo vazio a completar)`,
    );
  }

  if (dryRun) {
    console.log("\n(dry-run) Exemplo do primeiro registro que seria inserido:");
    console.log(JSON.stringify(toInsert[0] ?? toUpdate[0] ?? null, null, 2));
    if (toEnrich.length > 0) {
      console.log("\n(dry-run) Exemplo de complemento em registro já existente:");
      console.log(JSON.stringify(toEnrich[0], null, 2));
    }
    return 0;
  }

  let inserted = 0;
  let firstError = null;
  for (let i = 0; i < toInsert.length; i += CHUNK) {
    const chunk = toInsert.slice(i, i + CHUNK);
    const { error } = await supabase.from("businesses").insert(chunk);
    if (error) {
      firstError ??= error;
      console.error(`Erro ao inserir lote ${i / CHUNK + 1}:`, error.message);
    } else {
      inserted += chunk.length;
      console.log(`Inseridos ${inserted}/${toInsert.length}...`);
    }
  }

  let enriched = 0;
  for (const { id, name, patch } of toEnrich) {
    const { error } = await supabase.from("businesses").update(patch).eq("id", id);
    if (error) {
      firstError ??= error;
      console.error(`Erro ao complementar "${name}":`, error.message);
    } else {
      enriched += 1;
    }
  }
  if (enriched > 0) console.log(`Complementados ${enriched} registros já existentes.`);

  let updated = 0;
  for (const row of toUpdate) {
    const { google_place_id, ...fields } = row;
    const { error } = await supabase
      .from("businesses")
      .update(fields)
      .eq("google_place_id", google_place_id);
    if (error) {
      firstError ??= error;
      console.error(`Erro ao atualizar ${google_place_id}:`, error.message);
    } else {
      updated += 1;
    }
  }

  // Nada gravado com erros pelo caminho não é "concluído": sinaliza a falha.
  if (inserted === 0 && updated === 0 && enriched === 0 && firstError) {
    console.error(`\n✖ Nenhum registro gravado. Primeiro erro: ${firstError.message}`);
    const described = describeSupabaseFailure(firstError, { supabaseUrl: SUPABASE_URL });
    if (described) console.error(`\n  ${described.hint}`);
    return 1;
  }

  console.log(
    `\nConcluído: ${inserted} inseridos, ${enriched} complementados, ${updated} atualizados.`,
  );
  if (firstError) {
    console.log("⚠ Parte dos lotes falhou — reveja os erros acima e rode de novo (é idempotente).");
  }
  console.log("Confira no app e no painel do Supabase (tabela businesses).");
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
