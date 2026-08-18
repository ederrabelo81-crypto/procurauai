/**
 * Validação manual dos estabelecimentos importados para a tabela businesses.
 *
 * O fluxo é de mão dupla e passa por planilha, porque a revisão é humana:
 *   1. exporta os pendentes para CSV;
 *   2. o revisor abre no Excel/Sheets, confere os dados, preenche o WhatsApp
 *      (o dado mais valioso, que a Places API não entrega) e escreve a decisão
 *      na coluna `action`;
 *   3. importa o CSV de volta, aplicando decisão e correções no banco.
 *
 * Uso:
 *   node scripts/validate-businesses.mjs                       # lista os pendentes
 *   node scripts/validate-businesses.mjs --export-csv          # gera a planilha
 *   node scripts/validate-businesses.mjs --import-csv=arq.csv  # aplica a revisão
 *
 * Opções:
 *   --city="Guaxupé"      filtra por cidade
 *   --status=verified     status a listar/exportar (padrão: pending)
 *   --limit=N             máximo de registros (padrão: 50)
 *   --export-csv          exporta para data/validation/ em vez de listar
 *   --import-csv=arquivo  aplica as decisões da planilha revisada
 *   --verified-by=UUID    grava quem validou (precisa existir em auth.users)
 *   --dry-run             mostra o que faria, sem gravar nada
 *   --help                esta ajuda
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";

import { parseCsvRecords, toCsv } from "./lib/csv.mjs";
import { formatEnvHelp, looksLikePublicSupabaseKey, readEnv } from "./lib/env.mjs";
import { describeSupabaseFailure } from "./lib/supabase.mjs";

/** Colunas da planilha. `action` e os campos editáveis voltam na importação. */
const CSV_HEADER = [
  "id",
  "name",
  "address",
  "city",
  "category",
  "phone",
  "whatsapp",
  "google_place_id",
  "action",
];

/** Campos que o revisor pode corrigir na planilha e que a importação regrava. */
const EDITABLE_FIELDS = ["phone", "whatsapp"];

/** Decisões aceitas na coluna `action`. */
const ACTIONS = new Set(["verified", "rejected", "needs_update", "pending"]);

const HELP = `
Validação manual dos estabelecimentos (tabela businesses).

  node scripts/validate-businesses.mjs [opções]

Opções:
  --export-csv           exporta os pendentes para data/validation/
  --import-csv=arquivo   aplica as decisões da planilha revisada
  --city="Guaxupé"       filtra por cidade
  --status=pending       status a listar/exportar (pending, verified, rejected, needs_update)
  --limit=50             máximo de registros
  --verified-by=UUID     usuário que validou (precisa existir em auth.users)
  --dry-run              mostra o que faria, sem gravar
  --help                 esta ajuda

Fluxo recomendado:
  1. node scripts/validate-businesses.mjs --export-csv
  2. revise no Excel/Sheets: confira os dados, preencha o WhatsApp e
     escreva verified / rejected / needs_update na coluna "action"
  3. node scripts/validate-businesses.mjs --import-csv=data/validation/ARQUIVO.csv --dry-run
  4. repita sem --dry-run para gravar
`;

/* ------------------------------------------------------------------ *
   Argumentos
 * ------------------------------------------------------------------ */

function parseArgs(argv) {
  const flags = new Set();
  const values = new Map();

  for (const arg of argv) {
    const match = /^--([^=]+)(?:=(.*))?$/.exec(arg);
    if (!match) continue;
    if (match[2] === undefined) flags.add(match[1]);
    else values.set(match[1], match[2].replace(/^["']|["']$/g, ""));
  }

  const limitRaw = values.get("limit");
  const limit = limitRaw === undefined ? 50 : Number(limitRaw);

  return {
    help: flags.has("help"),
    dryRun: flags.has("dry-run"),
    exportCsv: flags.has("export-csv"),
    importCsv: values.get("import-csv") ?? null,
    city: values.get("city") ?? null,
    status: values.get("status") ?? "pending",
    verifiedBy: values.get("verified-by") ?? null,
    limit,
    limitInvalid: !Number.isInteger(limit) || limit < 1,
  };
}

const options = parseArgs(process.argv.slice(2));

if (options.help) {
  console.log(HELP);
  process.exit(0);
}

if (options.limitInvalid) {
  console.error("✖ --limit precisa ser um inteiro maior que zero.");
  process.exit(1);
}

if (options.verifiedBy && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(options.verifiedBy)) {
  console.error("✖ --verified-by precisa ser um UUID de um usuário existente em auth.users.");
  process.exit(1);
}

/* ------------------------------------------------------------------ *
   Credenciais
 * ------------------------------------------------------------------ */

let supabase = null;
let supabaseUrlValue = "";

/**
 * Resolve credenciais e cria o cliente na primeira chamada.
 *
 * É preguiçoso de propósito: os testes importam este módulo só para exercitar
 * planUpdate(), e uma verificação no topo do arquivo derrubaria o processo de
 * teste com process.exit(1) antes de qualquer asserção rodar.
 */
function getSupabase() {
  if (supabase) return supabase;

  // A URL não é secreta: se só existir a do front-end (VITE_), serve.
  const supabaseUrl = readEnv(["SUPABASE_URL", "VITE_SUPABASE_URL"]);
  // A chave precisa ser a service_role — a anon é barrada pelas policies de RLS.
  const serviceRoleKey = readEnv(["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_KEY"]);

  if (!supabaseUrl.value || !serviceRoleKey.value) {
    const missing = [];
    if (!supabaseUrl.value) missing.push("SUPABASE_URL");
    if (!serviceRoleKey.value) missing.push("SUPABASE_SERVICE_ROLE_KEY");

    console.error("✖ Credenciais do Supabase não encontradas.\n");
    console.error(
      formatEnvHelp({
        missing,
        script: "scripts/validate-businesses.mjs",
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
      "✖ A chave informada é a anon/publishable, não a service_role.\n" +
        "  A anon é barrada pelas policies de RLS e o erro que aparece na gravação\n" +
        "  ('row-level security policy') não deixa claro que a causa foi a chave trocada.\n" +
        "  Pegue a service_role em: Supabase → Project Settings → API → service_role.",
    );
    process.exit(1);
  }

  supabaseUrlValue = supabaseUrl.value;
  supabase = createClient(supabaseUrl.value, serviceRoleKey.value, {
    auth: { persistSession: false },
  });
  return supabase;
}

/* ------------------------------------------------------------------ *
   Banco
 * ------------------------------------------------------------------ */

async function fetchBusinesses() {
  let query = getSupabase()
    .from("businesses")
    .select(
      "id, name, address, city, category, category_slug, phone, whatsapp, google_place_id, verification_status, data_source, is_verified, created_at",
    )
    .eq("verification_status", options.status)
    .order("created_at", { ascending: false })
    .limit(options.limit);

  if (options.city) query = query.eq("city", options.city);

  const { data, error } = await query;
  if (error) {
    console.error("✖ Não foi possível ler a tabela businesses.\n");
    console.error(describeSupabaseFailure(error, { supabaseUrl: supabaseUrlValue }));
    process.exit(1);
  }
  return data ?? [];
}

/* ------------------------------------------------------------------ *
   Exportação
 * ------------------------------------------------------------------ */

function exportToCsv(businesses) {
  const date = new Date().toISOString().slice(0, 10);
  const citySlug = options.city
    ? `-${options.city.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\W+/g, "-").toLowerCase()}`
    : "";
  const csvPath = path.join(process.cwd(), "data", "validation", `${options.status}${citySlug}-${date}.csv`);

  const rows = businesses.map((business) =>
    CSV_HEADER.map((column) => (column === "action" ? "" : (business[column] ?? ""))),
  );
  const content = toCsv(CSV_HEADER, rows);

  if (options.dryRun) {
    console.log(`[dry-run] escreveria ${businesses.length} linha(s) em ${csvPath}`);
    return;
  }

  mkdirSync(path.dirname(csvPath), { recursive: true });
  writeFileSync(csvPath, `${content}\n`, "utf8");

  console.log(`✔ CSV exportado: ${csvPath}`);
  console.log("\nComo usar:");
  console.log("  1. Abra o arquivo no Excel ou no Google Sheets.");
  console.log("  2. Confira os dados e preencha a coluna whatsapp (só dígitos, com DDD).");
  console.log("  3. Escreva na coluna action, para cada linha:");
  console.log("       verified      aprovar e liberar no app");
  console.log("       rejected      rejeitar (não aparece no app)");
  console.log("       needs_update  precisa de mais informação");
  console.log("       (vazio)       manter como está, decidir depois");
  console.log("  4. Salve como CSV e rode:");
  console.log(`       node scripts/validate-businesses.mjs --import-csv=${path.relative(process.cwd(), csvPath)} --dry-run`);
  console.log("     Confirme a prévia e repita sem --dry-run para gravar.\n");
}

/* ------------------------------------------------------------------ *
   Importação
 * ------------------------------------------------------------------ */

/** Monta o update de uma linha revisada, ou devolve o motivo de pular. */
export function planUpdate(record, existing, { verifiedBy = null, now = new Date() } = {}) {
  const action = (record.action ?? "").trim().toLowerCase();

  if (!record.id) return { skip: "linha sem id" };
  if (!action) return { skip: "sem decisão" };
  if (!ACTIONS.has(action)) return { invalid: `ação desconhecida "${record.action}"` };

  const updates = {};

  // Correções que o revisor fez na planilha (só o que realmente mudou).
  for (const field of EDITABLE_FIELDS) {
    const value = (record[field] ?? "").trim();
    const current = (existing?.[field] ?? "").trim();
    if (value !== current) updates[field] = value || null;
  }

  const decided = action !== "pending";
  if (decided) {
    updates.verification_status = action;
    updates.is_verified = action === "verified";
    updates.verified_at = action === "verified" ? now.toISOString() : null;
    // Só grava quem validou quando há um usuário real: a coluna é FK para
    // auth.users e um UUID inventado derruba a gravação inteira.
    if (verifiedBy) updates.verified_by = verifiedBy;
  }

  if (Object.keys(updates).length === 0) return { skip: "nada mudou" };

  return { id: record.id, action, updates };
}

async function importValidations(csvPath) {
  if (!existsSync(csvPath)) {
    console.error(`✖ Arquivo não encontrado: ${csvPath}`);
    process.exit(1);
  }

  const records = parseCsvRecords(readFileSync(csvPath, "utf8"));
  if (records.length === 0) {
    console.log("Nenhuma linha no arquivo.");
    return;
  }

  // Busca o estado atual para comparar só o que o revisor de fato mudou.
  const ids = records.map((record) => record.id).filter(Boolean);
  const { data: current, error } = await getSupabase()
    .from("businesses")
    .select("id, name, phone, whatsapp, verification_status")
    .in("id", ids);

  if (error) {
    console.error("✖ Não foi possível ler os registros do arquivo.\n");
    console.error(describeSupabaseFailure(error, { supabaseUrl: supabaseUrlValue }));
    process.exit(1);
  }

  const byId = new Map((current ?? []).map((row) => [row.id, row]));

  const planned = [];
  const stats = { verified: 0, rejected: 0, needs_update: 0, pending: 0, skipped: 0, invalid: 0, missing: 0, errors: 0 };

  for (const record of records) {
    if (record.id && !byId.has(record.id)) {
      console.warn(`⚠ id não existe no banco, ignorando: ${record.id}`);
      stats.missing += 1;
      continue;
    }

    const plan = planUpdate(record, byId.get(record.id), { verifiedBy: options.verifiedBy });

    if (plan.invalid) {
      console.warn(`⚠ ${plan.invalid} (id ${record.id}), ignorando.`);
      stats.invalid += 1;
      continue;
    }
    if (plan.skip) {
      stats.skipped += 1;
      continue;
    }

    planned.push({ ...plan, name: byId.get(record.id)?.name ?? record.name });
  }

  if (planned.length === 0) {
    console.log("\nNenhuma alteração a aplicar.");
    printStats(stats);
    return;
  }

  console.log(`\n${options.dryRun ? "[dry-run] " : ""}${planned.length} registro(s) a atualizar:\n`);
  for (const item of planned.slice(0, 10)) {
    const campos = Object.keys(item.updates).join(", ");
    console.log(`  ${item.action.padEnd(12)} ${item.name ?? item.id} → ${campos}`);
  }
  if (planned.length > 10) console.log(`  … e mais ${planned.length - 10}.`);
  console.log("");

  if (options.dryRun) {
    console.log("[dry-run] nada foi gravado. Rode de novo sem --dry-run para aplicar.\n");
    for (const item of planned) stats[item.action] += 1;
    printStats(stats);
    return;
  }

  for (const item of planned) {
    const { error: updateError } = await getSupabase()
      .from("businesses")
      .update(item.updates)
      .eq("id", item.id);

    if (updateError) {
      console.error(`✖ falhou ao atualizar ${item.name ?? item.id}: ${updateError.message}`);
      stats.errors += 1;
      continue;
    }
    stats[item.action] += 1;
  }

  console.log("✔ Validações aplicadas.");
  printStats(stats);
}

function printStats(stats) {
  console.log("\nResumo:");
  console.log(`  aprovados (verified):    ${stats.verified}`);
  console.log(`  rejeitados (rejected):   ${stats.rejected}`);
  console.log(`  a rever (needs_update):  ${stats.needs_update}`);
  console.log(`  reabertos (pending):     ${stats.pending}`);
  console.log(`  sem mudança:             ${stats.skipped}`);
  if (stats.invalid) console.log(`  ação inválida:           ${stats.invalid}`);
  if (stats.missing) console.log(`  id inexistente:          ${stats.missing}`);
  if (stats.errors) console.log(`  erros de gravação:       ${stats.errors}`);
  console.log("");
}

/* ------------------------------------------------------------------ *
   Listagem
 * ------------------------------------------------------------------ */

function printPreview(businesses) {
  console.log("Amostra dos primeiros registros:\n");

  for (const [index, business] of businesses.slice(0, 10).entries()) {
    console.log(`${index + 1}. ${business.name}`);
    console.log(`   ${business.address || "sem endereço"} — ${business.city || "sem cidade"}`);
    console.log(`   ${business.category || "sem categoria"} (${business.category_slug || "—"})`);
    console.log(`   telefone: ${business.phone || "—"}   whatsapp: ${business.whatsapp || "FALTA (coletar)"}`);
    console.log(`   status: ${business.verification_status} · fonte: ${business.data_source || "—"}`);
    console.log("");
  }

  console.log("Próximo passo: node scripts/validate-businesses.mjs --export-csv\n");
}

/* ------------------------------------------------------------------ *
   Main
 * ------------------------------------------------------------------ */

async function main() {
  if (options.importCsv) {
    console.log(`Importando validações de ${options.importCsv}${options.dryRun ? " (dry-run)" : ""}…`);
    await importValidations(options.importCsv);
    return;
  }

  console.log("Validação de estabelecimentos\n");
  if (options.city) console.log(`  cidade: ${options.city}`);
  console.log(`  status: ${options.status}`);
  console.log(`  limite: ${options.limit}\n`);

  const businesses = await fetchBusinesses();
  console.log(`${businesses.length} registro(s) encontrado(s).\n`);

  if (businesses.length === 0) {
    console.log("Nada pendente com esse filtro.");
    console.log("Dica: --status=verified mostra os já aprovados.\n");
    return;
  }

  if (options.exportCsv) exportToCsv(businesses);
  else printPreview(businesses);
}

// Só executa quando chamado direto pela linha de comando: os testes importam
// este módulo para exercitar planUpdate() e não devem disparar chamada ao banco.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error("✖ Erro inesperado:", error.message);
    process.exitCode = 1;
  });
}
