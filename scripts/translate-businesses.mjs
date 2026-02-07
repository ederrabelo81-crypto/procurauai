import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const DEEPL_API_URL =
  process.env.DEEPL_API_URL ?? "https://api-free.deepl.com/v2/translate";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !DEEPL_API_KEY) {
  console.error(
    "Env faltando. Defina SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e DEEPL_API_KEY."
  );
  process.exit(1);
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const idsArg = args.find((arg) => arg.startsWith("--ids="));
const limitArg = args.find((arg) => arg.startsWith("--limit="));
const offsetArg = args.find((arg) => arg.startsWith("--offset="));

const ids = idsArg ? idsArg.replace("--ids=", "").split(",") : null;
const limit = limitArg ? Number(limitArg.replace("--limit=", "")) : 50;
const offset = offsetArg ? Number(offsetArg.replace("--offset=", "")) : 0;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const foodRegex =
  /comida|restaurante|supermercado|lanchonete|padaria|pizzaria|hamburguer|bar|cafe|café|mercado/i;

const roundRating = (value) => {
  if (value === null || value === undefined) return null;
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return null;
  return Math.round(numberValue * 10) / 10;
};

const translateText = async (text) => {
  const body = new URLSearchParams({
    auth_key: DEEPL_API_KEY,
    text,
    target_lang: "PT-BR",
  });

  const response = await fetch(DEEPL_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro na API de tradução: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  const translated = payload?.translations?.[0]?.text;
  if (!translated) {
    throw new Error("Resposta de tradução inválida.");
  }
  return translated;
};

const fetchBusinesses = async () => {
  let query = supabase
    .from("businesses")
    .select("id, description, rating, category")
    .order("id")
    .range(offset, offset + limit - 1);

  if (ids && ids.length > 0) {
    query = supabase.from("businesses").select("id, description, rating, category").in("id", ids);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
};

const run = async () => {
  const businesses = await fetchBusinesses();

  if (businesses.length === 0) {
    console.log("Nenhum registro encontrado para processar.");
    return;
  }

  console.log(
    `Processando ${businesses.length} registros${dryRun ? " (dry-run)" : ""}.`
  );

  for (const business of businesses) {
    const updates = {};

    if (business.description) {
      const translated = await translateText(business.description);
      updates.description = translated;
    }

    const roundedRating = roundRating(business.rating);
    if (roundedRating !== null) {
      updates.rating = roundedRating;
    }

    if (business.category && foodRegex.test(business.category)) {
      updates.category = "Negócios";
    }

    if (Object.keys(updates).length === 0) {
      console.log(`- ${business.id}: sem mudanças.`);
      continue;
    }

    if (dryRun) {
      console.log(`- ${business.id}:`, updates);
      continue;
    }

    const { error } = await supabase
      .from("businesses")
      .update(updates)
      .eq("id", business.id);

    if (error) {
      console.error(`Erro ao atualizar ${business.id}:`, error);
    } else {
      console.log(`- ${business.id}: atualizado.`);
    }
  }
};

run().catch((error) => {
  console.error("Falha no script:", error);
  process.exit(1);
});
