/**
 * Coleta de comércios, serviços e atrações via Google Places API (New).
 *
 * Uso:
 *   GOOGLE_MAPS_API_KEY=sua_chave node scripts/collect-places.mjs
 *
 * A chave também pode ficar em `.env.local` (git-ignored) como
 * GOOGLE_MAPS_API_KEY=... — o script carrega esse arquivo sozinho.
 *
 * Opções:
 *   --dry-run                                             (1 requisição de teste; valida chave e mostra amostra, não grava arquivo)
 *   --cities="Monte Santo de Minas - MG,Arceburgo - MG"   (padrão: só Monte Santo de Minas)
 *   --categories="pizzarias,farmácias"                    (padrão: lista completa abaixo)
 *   --out=data/places                                     (pasta de saída; gera .json e .csv)
 *   --max-pages=3                                         (páginas por busca; 1 página = 20 lugares = 1 requisição)
 *   --help                                                (mostra esta ajuda)
 *
 * Saída: data/places/places-YYYY-MM-DD.json e .csv
 * O CSV é feito para ser revisado no Google Sheets ANTES de importar
 * (conferir categoria, preencher WhatsApp, remover duplicados de outra cidade).
 *
 * IMPORTANTE sobre a chave: a chave do front-end (VITE_GOOGLE_MAPS_API_KEY) costuma
 * ser restrita por referenciador HTTP e é rejeitada em chamadas de servidor como esta.
 * Crie uma segunda chave, sem restrição de referenciador (ou restrita por IP),
 * limitada à "Places API (New)". Veja docs/coleta-de-dados.md.
 */

import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

// ─────────────────────────────────────────────────────────────────────────────
// Configuração
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES = [
  "restaurantes",
  "lanchonetes",
  "pizzarias",
  "padarias",
  "sorveterias",
  "açaiterias",
  "bares",
  "cafeterias",
  "supermercados",
  "mercearias",
  "açougues",
  "hortifruti",
  "farmácias",
  "lojas de roupas",
  "lojas de calçados",
  "lojas de móveis",
  "materiais de construção",
  "autopeças",
  "oficinas mecânicas",
  "lava jato",
  "pet shops",
  "clínicas veterinárias",
  "salões de beleza",
  "barbearias",
  "academias",
  "clínicas médicas",
  "dentistas",
  "laboratórios",
  "imobiliárias",
  "escritórios de contabilidade",
  "pousadas e hotéis",
  "postos de combustível",
  "papelarias",
  "óticas",
  "lojas de celulares",
  "floriculturas",
  "gráficas",
  "vidraçarias",
  "serralherias",
  "atrações turísticas",
];

const SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.addressComponents",
  "places.location",
  "places.types",
  "places.primaryTypeDisplayName",
  "places.businessStatus",
  "places.nationalPhoneNumber",
  "places.websiteUri",
  "places.regularOpeningHours.weekdayDescriptions",
  "places.rating",
  "places.userRatingCount",
  "nextPageToken",
].join(",");

/** Máscara mínima (SKU "Text Search ID Only", sem custo) usada só para validar a chave. */
const PREFLIGHT_FIELD_MASK = "places.id";

const VALUE_FLAGS = new Set(["cities", "categories", "out", "max-pages"]);
const BOOLEAN_FLAGS = new Set(["dry-run", "help"]);

const MAX_ATTEMPTS = 3;
const PAUSE_BETWEEN_REQUESTS_MS = 300;

const HELP_TEXT = `
Coleta de lugares via Google Places API (New) — Procura UAI

  GOOGLE_MAPS_API_KEY=sua_chave node scripts/collect-places.mjs [opções]

Opções:
  --dry-run                  faz 1 requisição de teste (grátis), valida a chave e
                             mostra um registro de exemplo; não grava arquivos
  --cities="A - MG,B - MG"   cidades a varrer (padrão: "Monte Santo de Minas - MG")
  --categories="a,b,c"       categorias a buscar (padrão: ${DEFAULT_CATEGORIES.length} categorias)
  --out=data/places          pasta de saída do .json e do .csv
  --max-pages=3              páginas por busca (1 página = até 20 lugares = 1 requisição)
  --help                     mostra esta ajuda

A chave pode vir do ambiente ou de .env.local (GOOGLE_MAPS_API_KEY).
Passo a passo completo: docs/coleta-de-dados.md
`.trim();

// ─────────────────────────────────────────────────────────────────────────────
// Env e argumentos
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lê a chave do ambiente; se não achar, carrega .env.local / .env e tenta de novo.
 * A variável já exportada no shell sempre tem precedência sobre o arquivo.
 */
export function resolveApiKey(env = process.env, loadEnvFiles = defaultLoadEnvFiles) {
  const fromShell = env.GOOGLE_MAPS_API_KEY || env.VITE_GOOGLE_MAPS_API_KEY;
  if (fromShell) {
    return { key: fromShell, source: "ambiente", isFrontendKey: !env.GOOGLE_MAPS_API_KEY };
  }

  loadEnvFiles();

  const fromFile = env.GOOGLE_MAPS_API_KEY || env.VITE_GOOGLE_MAPS_API_KEY;
  if (fromFile) {
    return { key: fromFile, source: ".env.local", isFrontendKey: !env.GOOGLE_MAPS_API_KEY };
  }

  return { key: "", source: "", isFrontendKey: false };
}

function defaultLoadEnvFiles() {
  for (const file of [".env.local", ".env"]) {
    if (!existsSync(file)) continue;
    try {
      process.loadEnvFile(file);
    } catch {
      // arquivo malformado não deve derrubar o script — a chave ainda pode vir do shell
    }
  }
}

/** Converte argv em opções, recusando flags desconhecidas (evita varrer a cidade errada por typo). */
export function parseArgs(argv) {
  const errors = [];
  const raw = new Map();
  let help = false;
  let dryRun = false;

  for (const arg of argv) {
    if (!arg.startsWith("--")) {
      errors.push(`Argumento inesperado: "${arg}". Use --opcao=valor.`);
      continue;
    }
    const [name, ...rest] = arg.slice(2).split("=");
    const hasValue = rest.length > 0;

    if (!hasValue && BOOLEAN_FLAGS.has(name)) {
      if (name === "help") help = true;
      if (name === "dry-run") dryRun = true;
      continue;
    }
    if (hasValue && VALUE_FLAGS.has(name)) {
      raw.set(name, rest.join("="));
      continue;
    }
    if (VALUE_FLAGS.has(name)) {
      errors.push(`A opção --${name} precisa de valor (ex.: --${name}=valor).`);
      continue;
    }
    errors.push(
      `Opção desconhecida: "--${name}". Conhecidas: ` +
        [...VALUE_FLAGS].map((f) => `--${f}=`).concat([...BOOLEAN_FLAGS].map((f) => `--${f}`)).join(", "),
    );
  }

  const splitList = (value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const cities = splitList(raw.get("cities") ?? "Monte Santo de Minas - MG");
  const categories = splitList(raw.get("categories") ?? DEFAULT_CATEGORIES.join(","));
  const outDir = (raw.get("out") ?? "data/places").trim() || "data/places";

  const maxPagesRaw = raw.get("max-pages") ?? "3";
  const maxPages = Number(maxPagesRaw);
  if (!Number.isInteger(maxPages) || maxPages < 1 || maxPages > 3) {
    errors.push(
      `--max-pages precisa ser um inteiro de 1 a 3 (recebido: "${maxPagesRaw}"). ` +
        "A Places API devolve no máximo 3 páginas (60 resultados) por busca.",
    );
  }
  if (cities.length === 0) errors.push("--cities ficou vazio.");
  if (categories.length === 0) errors.push("--categories ficou vazio.");

  return { cities, categories, outDir, maxPages, dryRun, help, errors };
}

// ─────────────────────────────────────────────────────────────────────────────
// Chamadas à API
// ─────────────────────────────────────────────────────────────────────────────

export class PlacesApiError extends Error {
  constructor(message, { httpStatus = 0, googleStatus = "", retryable = false, fatal = false, hint = "" } = {}) {
    super(message);
    this.name = "PlacesApiError";
    this.httpStatus = httpStatus;
    this.googleStatus = googleStatus;
    this.retryable = retryable;
    this.fatal = fatal; // fatal = não adianta tentar as outras categorias
    this.hint = hint;
  }
}

/**
 * Traduz a resposta de erro do Google para algo acionável.
 * `fatal` significa "abortar a varredura inteira" — sem isso, uma chave inválida
 * imprimia o mesmo erro 40 vezes e terminava com "Concluído: 0 lugares".
 */
export function classifyError(httpStatus, bodyText) {
  let payload;
  try {
    payload = JSON.parse(bodyText);
  } catch {
    payload = null;
  }

  const apiError = payload?.error ?? {};
  const message = apiError.message || bodyText.slice(0, 300) || `HTTP ${httpStatus}`;
  const googleStatus = apiError.status || "";
  const haystack = `${message} ${googleStatus}`.toLowerCase();

  const build = (options) =>
    new PlacesApiError(message, { httpStatus, googleStatus, ...options });

  if (haystack.includes("api key not valid") || haystack.includes("api_key_invalid")) {
    return build({
      fatal: true,
      hint:
        "A chave é inválida ou está incompleta. Confira o valor de GOOGLE_MAPS_API_KEY " +
        "(sem espaços/quebras) no shell ou em .env.local.",
    });
  }
  if (haystack.includes("referer") || haystack.includes("referrer")) {
    return build({
      fatal: true,
      hint:
        "A chave está restrita por referenciador HTTP e por isso não funciona fora do navegador. " +
        "Crie no Google Cloud uma segunda chave só para scripts, sem restrição de referenciador " +
        "(ou restrita por IP), limitada à Places API (New).",
    });
  }
  if (
    haystack.includes("has not been used") ||
    haystack.includes("service_disabled") ||
    haystack.includes("is disabled")
  ) {
    return build({
      fatal: true,
      hint:
        "A Places API (New) não está ativada neste projeto do Google Cloud. " +
        "Ative em APIs e serviços → Biblioteca → \"Places API (New)\" e rode de novo em 1–2 minutos.",
    });
  }
  if (haystack.includes("billing")) {
    return build({
      fatal: true,
      hint:
        "O projeto do Google Cloud está sem faturamento ativo (exigido mesmo dentro da cota grátis). " +
        "Ative o faturamento e configure um alerta de orçamento de US$ 5.",
    });
  }
  if (httpStatus === 401 || httpStatus === 403) {
    return build({
      fatal: true,
      hint:
        "Permissão negada. Verifique em Credenciais → sua chave → \"Restrições de API\" se a " +
        "Places API (New) está na lista de APIs permitidas.",
    });
  }
  if (httpStatus === 429) {
    return build({
      retryable: true,
      hint: "Limite de requisições atingido; o script vai esperar e tentar de novo.",
    });
  }
  if (httpStatus >= 500) {
    return build({ retryable: true, hint: "Instabilidade no lado do Google; tentando de novo." });
  }
  return build({});
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function requestPlaces({ apiKey, textQuery, pageToken, fieldMask = FIELD_MASK }) {
  // Na paginação, os demais parâmetros precisam ser idênticos aos da primeira chamada.
  const body = { textQuery, languageCode: "pt-BR", regionCode: "BR", pageSize: 20 };
  if (pageToken) body.pageToken = pageToken;

  let response;
  try {
    response = await fetch(SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": fieldMask,
      },
      body: JSON.stringify(body),
    });
  } catch (networkError) {
    throw new PlacesApiError(`Falha de rede: ${networkError.message}`, {
      retryable: true,
      hint: "Confira a conexão/proxy e tente de novo.",
    });
  }

  if (!response.ok) {
    throw classifyError(response.status, await response.text());
  }

  return response.json();
}

/** Repete requisições retryáveis (429, 5xx, rede) com backoff exponencial. */
async function requestWithRetry(options) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      return await requestPlaces(options);
    } catch (error) {
      lastError = error;
      if (error.fatal || !error.retryable || attempt === MAX_ATTEMPTS) throw error;
      const waitMs = 1000 * 2 ** (attempt - 1);
      console.log(`    tentativa ${attempt} falhou (${error.message}); nova tentativa em ${waitMs / 1000}s`);
      await sleep(waitMs);
    }
  }
  throw lastError;
}

// ─────────────────────────────────────────────────────────────────────────────
// Transformação dos dados
// ─────────────────────────────────────────────────────────────────────────────

function getComponent(place, type) {
  const component = (place.addressComponents ?? []).find((c) => (c.types ?? []).includes(type));
  return component?.longText ?? "";
}

export function normalizeCityName(name) {
  return String(name ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s*-\s*mg$/i, "")
    .trim();
}

export function toRecord(place, city, categoryHint) {
  const locality =
    getComponent(place, "locality") || getComponent(place, "administrative_area_level_2");
  const neighborhood =
    getComponent(place, "sublocality_level_1") || getComponent(place, "sublocality") || "Centro";

  return {
    google_place_id: place.id,
    name: place.displayName?.text ?? "",
    category_hint: place.primaryTypeDisplayName?.text ?? categoryHint,
    search_category: categoryHint,
    city: locality || city.replace(/\s*-\s*MG$/i, ""),
    neighborhood,
    address: place.formattedAddress ?? "",
    lat: place.location?.latitude ?? "",
    lng: place.location?.longitude ?? "",
    phone: place.nationalPhoneNumber ?? "",
    whatsapp: "", // preencher manualmente na revisão — nenhuma API fornece isso
    website: place.websiteUri ?? "",
    hours: (place.regularOpeningHours?.weekdayDescriptions ?? []).join("; "),
    rating: place.rating ?? "",
    reviews_count: place.userRatingCount ?? "",
    business_status: place.businessStatus ?? "",
    types: (place.types ?? []).join("|"),
  };
}

export function toCsv(records) {
  if (records.length === 0) return "";
  const headers = Object.keys(records[0]);
  const escape = (value) => {
    const text = String(value ?? "");
    return /[",;\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const lines = records.map((r) => headers.map((h) => escape(r[h])).join(";"));
  return [headers.join(";"), ...lines].join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// Execução
// ─────────────────────────────────────────────────────────────────────────────

function printFatal(error) {
  console.error(`\n✖ ${error.message}`);
  if (error.googleStatus) console.error(`  (status do Google: ${error.googleStatus})`);
  if (error.hint) console.error(`\n  Como resolver: ${error.hint}`);
  console.error("\n  Passo a passo completo em docs/coleta-de-dados.md");
}

const run = async () => {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    console.log(HELP_TEXT);
    return 0;
  }
  if (options.errors.length > 0) {
    for (const message of options.errors) console.error(`✖ ${message}`);
    console.error("\nUse --help para ver as opções.");
    return 1;
  }

  const { key: apiKey, source, isFrontendKey } = resolveApiKey();
  if (!apiKey) {
    console.error("✖ Chave da API não encontrada.");
    console.error(
      "\n  Defina GOOGLE_MAPS_API_KEY de uma destas formas:\n" +
        "    GOOGLE_MAPS_API_KEY=sua_chave node scripts/collect-places.mjs\n" +
        "  ou acrescente a linha em .env.local (git-ignored):\n" +
        "    GOOGLE_MAPS_API_KEY=sua_chave\n" +
        "\n  A chave precisa ter a Places API (New) ativada e NÃO pode ser restrita\n" +
        "  por referenciador HTTP (isso vale só para o front-end).\n" +
        "\n  Passo a passo completo em docs/coleta-de-dados.md",
    );
    return 1;
  }

  console.log(`Chave carregada de: ${source}`);
  if (isFrontendKey) {
    console.log(
      "⚠ Usando VITE_GOOGLE_MAPS_API_KEY (chave do front-end). Se ela estiver restrita\n" +
        "  por referenciador HTTP, o Google vai recusar as chamadas deste script.",
    );
  }

  const { cities, categories, outDir, maxPages, dryRun } = options;

  // Pré-checagem: 1 requisição com máscara mínima (SKU sem custo) só para validar a chave.
  process.stdout.write("Validando a chave... ");
  try {
    await requestPlaces({
      apiKey,
      textQuery: `${categories[0]} em ${cities[0]}`,
      fieldMask: PREFLIGHT_FIELD_MASK,
    });
    console.log("ok");
  } catch (error) {
    console.log("falhou");
    printFatal(error);
    return 1;
  }

  if (dryRun) {
    console.log("\n(dry-run) Buscando 1 página de 1 categoria para conferir o formato...");
    const data = await requestWithRetry({
      apiKey,
      textQuery: `${categories[0]} em ${cities[0]}`,
    });
    const sample = (data.places ?? []).map((place) => toRecord(place, cities[0], categories[0]));
    console.log(`  "${categories[0]} em ${cities[0]}" → ${sample.length} lugares.`);
    console.log("\n  Primeiro registro:");
    console.log(JSON.stringify(sample[0] ?? null, null, 2));
    console.log(
      `\n(dry-run) Nada foi gravado. A varredura completa faria até ` +
        `${cities.length * categories.length * maxPages} requisições ` +
        `(${cities.length} cidade(s) × ${categories.length} categorias × ${maxPages} páginas).`,
    );
    console.log("Rode sem --dry-run para gerar o JSON e o CSV.");
    return 0;
  }

  const byPlaceId = new Map();
  const failures = [];
  let requestCount = 0;

  console.log(
    `\nVarredura: ${cities.length} cidade(s) × ${categories.length} categorias × até ${maxPages} páginas ` +
      `(máximo de ${cities.length * categories.length * maxPages} requisições).`,
  );

  for (const city of cities) {
    const cityNormalized = normalizeCityName(city);
    console.log(`\n=== ${city} ===`);

    for (const category of categories) {
      const query = `${category} em ${city}`;
      let pageToken;
      let page = 0;
      let foundInQuery = 0;

      do {
        page += 1;
        let data;
        try {
          data = await requestWithRetry({ apiKey, textQuery: query, pageToken });
          requestCount += 1;
        } catch (error) {
          if (error.fatal) {
            printFatal(error);
            return 1;
          }
          console.error(`  ERRO em "${query}" (página ${page}): ${error.message}`);
          failures.push({ query, page, message: error.message });
          break;
        }

        for (const place of data.places ?? []) {
          const record = toRecord(place, city, category);

          // descarta resultados de outras cidades que o Google mistura
          if (
            record.city &&
            normalizeCityName(record.city) !== cityNormalized &&
            !cities.some((c) => normalizeCityName(c) === normalizeCityName(record.city))
          ) {
            continue;
          }
          // descarta lugares fechados permanentemente
          if (record.business_status === "CLOSED_PERMANENTLY") continue;

          if (!byPlaceId.has(record.google_place_id)) {
            byPlaceId.set(record.google_place_id, record);
            foundInQuery += 1;
          }
        }

        pageToken = data.nextPageToken;
        await sleep(PAUSE_BETWEEN_REQUESTS_MS);
      } while (pageToken && page < maxPages);

      console.log(`  ${category}: +${foundInQuery} novos (total ${byPlaceId.size})`);
    }
  }

  const records = Array.from(byPlaceId.values()).sort((a, b) =>
    `${a.city}${a.name}`.localeCompare(`${b.city}${b.name}`),
  );

  if (records.length === 0) {
    console.error("\n✖ Nenhum lugar coletado — nada foi gravado.");
    if (failures.length > 0) {
      console.error(`  ${failures.length} busca(s) falharam. Última: ${failures.at(-1).message}`);
    } else {
      console.error("  As buscas responderam, mas sem resultados. Confira o nome da cidade em --cities.");
    }
    return 1;
  }

  const today = new Date().toISOString().slice(0, 10);
  await mkdir(outDir, { recursive: true });
  const jsonPath = path.join(outDir, `places-${today}.json`);
  const csvPath = path.join(outDir, `places-${today}.csv`);
  await writeFile(jsonPath, JSON.stringify(records, null, 2), "utf8");
  await writeFile(csvPath, "﻿" + toCsv(records), "utf8"); // BOM para abrir certo no Excel/Sheets

  console.log(`\nConcluído: ${records.length} lugares únicos, ${requestCount} requisições à API.`);
  if (failures.length > 0) {
    console.log(`\n⚠ ${failures.length} busca(s) falharam e podem ter deixado lugares de fora:`);
    for (const failure of failures.slice(0, 10)) {
      console.log(`  - "${failure.query}" (página ${failure.page}): ${failure.message}`);
    }
    if (failures.length > 10) console.log(`  ... e mais ${failures.length - 10}.`);
    console.log("  Rode de novo com --categories=\"...\" só para essas categorias e junte os arquivos.");
  }
  console.log(`Arquivos gerados:\n  ${jsonPath}\n  ${csvPath}`);
  console.log("\nPróximo passo: revisar o CSV no Google Sheets (categoria, WhatsApp, duplicados)");
  console.log("e depois importar com: node scripts/import-businesses.mjs --file=" + jsonPath);
  return failures.length > 0 ? 2 : 0;
};

const isMainModule =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  run()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      if (error instanceof PlacesApiError) {
        printFatal(error);
      } else {
        console.error("Falha no script:", error);
      }
      process.exitCode = 1;
    });
}
