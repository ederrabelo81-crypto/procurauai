/**
 * Coleta de comércios, serviços e atrações via Google Places API (New).
 *
 * Uso:
 *   GOOGLE_MAPS_API_KEY=sua_chave node scripts/collect-places.mjs
 *
 * Opções:
 *   --cities="Monte Santo de Minas - MG,Arceburgo - MG"  (padrão: só Monte Santo de Minas)
 *   --categories="pizzarias,farmácias"                    (padrão: lista completa abaixo)
 *   --out=data/places                                     (pasta de saída; gera .json e .csv)
 *   --max-pages=3                                         (páginas por busca; 1 página = 20 lugares = 1 requisição)
 *
 * Saída: data/places/places-YYYY-MM-DD.json e .csv
 * O CSV é feito para ser revisado no Google Sheets ANTES de importar
 * (conferir categoria, preencher WhatsApp, remover duplicados de outra cidade).
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!API_KEY) {
  console.error("Env faltando. Defina GOOGLE_MAPS_API_KEY.");
  process.exit(1);
}

const args = process.argv.slice(2);
const readArg = (name, fallback) => {
  const arg = args.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.replace(`--${name}=`, "") : fallback;
};

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

const cities = readArg("cities", "Monte Santo de Minas - MG")
  .split(",")
  .map((c) => c.trim())
  .filter(Boolean);

const categories = readArg("categories", DEFAULT_CATEGORIES.join(","))
  .split(",")
  .map((c) => c.trim())
  .filter(Boolean);

const outDir = readArg("out", "data/places");
const maxPages = Number(readArg("max-pages", "3"));

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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function searchText(query, pageToken) {
  const body = { languageCode: "pt-BR", regionCode: "BR" };
  if (pageToken) {
    body.pageToken = pageToken;
    body.textQuery = query; // obrigatório repetir a mesma query na paginação
  } else {
    body.textQuery = query;
  }

  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Places API ${response.status}: ${errorText}`);
  }

  return response.json();
}

function getComponent(place, type) {
  const component = (place.addressComponents ?? []).find((c) =>
    (c.types ?? []).includes(type),
  );
  return component?.longText ?? "";
}

function normalizeCityName(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s*-\s*mg$/i, "")
    .trim();
}

function toRecord(place, city, categoryHint) {
  const locality =
    getComponent(place, "locality") ||
    getComponent(place, "administrative_area_level_2");
  const neighborhood =
    getComponent(place, "sublocality_level_1") ||
    getComponent(place, "sublocality") ||
    "Centro";

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

function toCsv(records) {
  if (records.length === 0) return "";
  const headers = Object.keys(records[0]);
  const escape = (value) => {
    const text = String(value ?? "");
    return /[",;\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const lines = records.map((r) => headers.map((h) => escape(r[h])).join(";"));
  return [headers.join(";"), ...lines].join("\n");
}

const run = async () => {
  const byPlaceId = new Map();
  let requestCount = 0;

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
          data = await searchText(query, pageToken);
          requestCount += 1;
        } catch (error) {
          console.error(`  ERRO em "${query}" (página ${page}): ${error.message}`);
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
        await sleep(300);
      } while (pageToken && page < maxPages);

      console.log(`  ${category}: +${foundInQuery} novos (total ${byPlaceId.size})`);
    }
  }

  const records = Array.from(byPlaceId.values()).sort((a, b) =>
    `${a.city}${a.name}`.localeCompare(`${b.city}${b.name}`),
  );

  const today = new Date().toISOString().slice(0, 10);
  await mkdir(outDir, { recursive: true });
  const jsonPath = path.join(outDir, `places-${today}.json`);
  const csvPath = path.join(outDir, `places-${today}.csv`);
  await writeFile(jsonPath, JSON.stringify(records, null, 2), "utf8");
  await writeFile(csvPath, "﻿" + toCsv(records), "utf8"); // BOM para abrir certo no Excel/Sheets

  console.log(`\nConcluído: ${records.length} lugares únicos, ${requestCount} requisições à API.`);
  console.log(`Arquivos gerados:\n  ${jsonPath}\n  ${csvPath}`);
  console.log("\nPróximo passo: revisar o CSV no Google Sheets (categoria, WhatsApp, duplicados)");
  console.log("e depois importar com: node scripts/import-businesses.mjs --file=" + jsonPath);
};

run().catch((error) => {
  console.error("Falha no script:", error);
  process.exit(1);
});
