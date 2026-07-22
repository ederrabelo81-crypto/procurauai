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

import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Env faltando. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const doUpdate = args.includes("--update");
const fileArg = args.find((a) => a.startsWith("--file="));
const limitArg = args.find((a) => a.startsWith("--limit="));

if (!fileArg) {
  console.error("Uso: node scripts/import-businesses.mjs --file=data/places/places-XXXX.json");
  process.exit(1);
}

const filePath = fileArg.replace("--file=", "");
const limit = limitArg ? Number(limitArg.replace("--limit=", "")) : Infinity;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const onlyDigits = (value) => String(value ?? "").replace(/\D/g, "");

function toBusinessRow(record) {
  const phoneDigits = onlyDigits(record.phone);
  const whatsappDigits = onlyDigits(record.whatsapp) || phoneDigits;

  return {
    name: String(record.name ?? "").trim(),
    category: String(record.category_hint ?? record.search_category ?? "").trim() || "Serviços",
    // category_slug: definido pelo trigger set_business_category_slug
    category_slug: "servicos",
    neighborhood: String(record.neighborhood ?? "").trim() || "Centro",
    hours: String(record.hours ?? "").trim() || "Consultar horários",
    phone: phoneDigits || null,
    whatsapp: whatsappDigits, // NOT NULL no schema; vazio = comerciante ainda sem WhatsApp confirmado
    cover_images: [],
    is_open_now: false,
    is_verified: false,
    description: null,
    address: String(record.address ?? "").trim() || null,
    plan: "free",
    website: String(record.website ?? "").trim() || null,
    google_place_id: String(record.google_place_id ?? "").trim() || null,
    lat: record.lat === "" || record.lat == null ? null : Number(record.lat),
    lng: record.lng === "" || record.lng == null ? null : Number(record.lng),
  };
}

const run = async () => {
  const raw = await readFile(filePath, "utf8");
  const records = JSON.parse(raw.replace(/^﻿/, ""));

  if (!Array.isArray(records) || records.length === 0) {
    console.log("Arquivo vazio ou inválido.");
    return;
  }

  const rows = records
    .slice(0, limit)
    .map(toBusinessRow)
    .filter((r) => r.name && r.google_place_id);

  console.log(`Lidos ${records.length} registros; válidos para importar: ${rows.length}.`);

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

  const toInsert = rows.filter((r) => !existing.has(r.google_place_id));
  const toUpdate = doUpdate ? rows.filter((r) => existing.has(r.google_place_id)) : [];

  console.log(
    `Novos: ${toInsert.length} | Já existentes: ${existing.size}` +
      (doUpdate ? ` (serão atualizados)` : ` (ignorados; use --update para atualizar)`),
  );

  if (dryRun) {
    console.log("\n(dry-run) Exemplo do primeiro registro que seria inserido:");
    console.log(JSON.stringify(toInsert[0] ?? toUpdate[0] ?? null, null, 2));
    return;
  }

  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += CHUNK) {
    const chunk = toInsert.slice(i, i + CHUNK);
    const { error } = await supabase.from("businesses").insert(chunk);
    if (error) {
      console.error(`Erro ao inserir lote ${i / CHUNK + 1}:`, error.message);
    } else {
      inserted += chunk.length;
      console.log(`Inseridos ${inserted}/${toInsert.length}...`);
    }
  }

  let updated = 0;
  for (const row of toUpdate) {
    const { google_place_id, ...fields } = row;
    const { error } = await supabase
      .from("businesses")
      .update(fields)
      .eq("google_place_id", google_place_id);
    if (error) {
      console.error(`Erro ao atualizar ${google_place_id}:`, error.message);
    } else {
      updated += 1;
    }
  }

  console.log(`\nConcluído: ${inserted} inseridos, ${updated} atualizados.`);
  console.log("Confira no app e no painel do Supabase (tabela businesses).");
};

run().catch((error) => {
  console.error("Falha no script:", error);
  process.exit(1);
});
