/**
 * Conversão dos registros coletados (scripts/collect-places.mjs) em linhas da
 * tabela `businesses`.
 *
 * Existem duas versões do schema em circulação — `supabase/schema.sql`
 * (`lat`/`lng`, sem `city`) e a de `docs/database/schema.sql`, com PostGIS
 * (`latitude`/`longitude`, `city`, `hours_text`). O banco de produção segue a
 * segunda. Em vez de fixar num dos dois, o script descobre as colunas reais e
 * adapta a linha: sem isso, a importação falhava em todos os lotes com
 * "Could not find the 'lat' column of 'businesses' in the schema cache".
 */

/** Nome canônico → nomes aceitos, em ordem de preferência. */
export const COLUMN_ALIASES = {
  latitude: ["latitude", "lat"],
  longitude: ["longitude", "lng"],
  hours: ["hours", "hours_text"],
  logo: ["logo", "logo_url"],
};

const onlyDigits = (value) => String(value ?? "").replace(/\D/g, "");

/**
 * Monta a linha em nomes canônicos. Não traz `rating`/`reviews_count`/fotos do
 * Google de propósito: a política do Google e o guia de coleta pedem que
 * avaliações e imagens sejam próprias (docs/coleta-de-dados.md §4).
 */
export function toBusinessRow(record) {
  const phoneDigits = onlyDigits(record.phone);
  const whatsappDigits = onlyDigits(record.whatsapp) || phoneDigits;
  const toNumber = (value) => (value === "" || value == null ? null : Number(value));

  return {
    name: String(record.name ?? "").trim(),
    category: String(record.category_hint ?? record.search_category ?? "").trim() || "Serviços",
    // category_slug é recalculado pelo trigger set_business_category_slug
    category_slug: "servicos",
    city: String(record.city ?? "").trim() || null,
    neighborhood: String(record.neighborhood ?? "").trim() || "Centro",
    hours: String(record.hours ?? "").trim() || "Consultar horários",
    phone: phoneDigits || null,
    whatsapp: whatsappDigits, // vazio = comerciante ainda sem WhatsApp confirmado
    cover_images: [],
    is_open_now: false,
    is_verified: false,
    description: null,
    address: String(record.address ?? "").trim() || null,
    plan: "free",
    website: String(record.website ?? "").trim() || null,
    google_place_id: String(record.google_place_id ?? "").trim() || null,
    latitude: toNumber(record.lat),
    longitude: toNumber(record.lng),
  };
}

/**
 * Renomeia/descarta campos conforme as colunas que a tabela realmente tem.
 * `columns` nulo (não deu para descobrir) devolve a linha intacta.
 */
export function adaptRowToColumns(row, columns) {
  if (!columns || columns.size === 0) return { row, dropped: [] };

  const adapted = {};
  const dropped = [];

  for (const [key, value] of Object.entries(row)) {
    const candidates = COLUMN_ALIASES[key] ?? [key];
    const target = candidates.find((candidate) => columns.has(candidate));
    if (target) adapted[target] = value;
    else dropped.push(key);
  }

  return { row: adapted, dropped };
}

/**
 * Lê as colunas da tabela pelo spec OpenAPI que o PostgREST publica na raiz da
 * API REST. Devolve null se não der para descobrir — aí o script tenta inserir
 * do jeito canônico e deixa o banco decidir.
 */
export async function fetchTableColumns(supabaseUrl, apiKey, table = "businesses") {
  try {
    const response = await fetch(`${supabaseUrl.replace(/\/+$/, "")}/rest/v1/`, {
      headers: { apikey: apiKey, Authorization: `Bearer ${apiKey}` },
    });
    if (!response.ok) return null;

    return columnsFromOpenApi(await response.json(), table);
  } catch {
    return null;
  }
}

/** Aceita OpenAPI 2 (`definitions`) e 3 (`components.schemas`), conforme a versão do PostgREST. */
export function columnsFromOpenApi(spec, table = "businesses") {
  const properties =
    spec?.definitions?.[table]?.properties ?? spec?.components?.schemas?.[table]?.properties;
  if (!properties) return null;

  const columns = new Set(Object.keys(properties));
  return columns.size > 0 ? columns : null;
}
