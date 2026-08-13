import { describe, expect, it } from "vitest";

import { adaptRowToColumns, columnsFromOpenApi, toBusinessRow } from "../lib/businessRow.mjs";

const record = {
  google_place_id: "ChIJexemplo",
  name: "  Padaria Central  ",
  category_hint: "Padaria",
  search_category: "padarias",
  city: "Monte Santo de Minas",
  neighborhood: "",
  address: "Rua A, 100",
  lat: -21.19,
  lng: -46.99,
  phone: "(35) 3591-0000",
  whatsapp: "",
  website: "",
  hours: "segunda-feira: 08:00–18:00",
  rating: 4.5,
  reviews_count: 12,
};

// Colunas reais do projeto de produção (docs/database/schema.sql, com PostGIS).
const PROD_COLUMNS = new Set([
  "id", "name", "description", "category_id", "neighborhood", "address", "city", "state",
  "phone", "whatsapp", "website", "instagram", "logo_url", "cover_images", "hours_text",
  "is_open_now", "is_verified", "plan", "google_place_id", "maps_url", "latitude",
  "longitude", "location", "created_at", "updated_at", "rating", "reviews_count",
  "category", "category_slug", "tags", "hours", "logo",
]);

// Colunas de supabase/schema.sql (a versão mais enxuta do repo).
const REPO_COLUMNS = new Set([
  "id", "slug", "name", "category", "category_slug", "tags", "neighborhood", "hours",
  "phone", "whatsapp", "cover_images", "is_open_now", "is_verified", "description",
  "address", "plan", "website", "instagram", "logo", "google_place_id", "lat", "lng",
]);

describe("toBusinessRow", () => {
  it("normaliza os campos do registro coletado", () => {
    const row = toBusinessRow(record);
    expect(row).toMatchObject({
      name: "Padaria Central",
      category: "Padaria",
      city: "Monte Santo de Minas",
      neighborhood: "Centro",
      phone: "3535910000",
      whatsapp: "3535910000", // sem WhatsApp confirmado, reaproveita o telefone
      address: "Rua A, 100",
      plan: "free",
      latitude: -21.19,
      longitude: -46.99,
      website: null,
    });
  });

  it("não importa avaliações nem fotos do Google", () => {
    const row = toBusinessRow(record);
    expect(row).not.toHaveProperty("rating");
    expect(row).not.toHaveProperty("reviews_count");
    expect(row.cover_images).toEqual([]);
  });

  it("usa fallbacks quando o Google não informou", () => {
    const row = toBusinessRow({ google_place_id: "x", name: "Loja", lat: "", lng: null });
    expect(row).toMatchObject({
      category: "Serviços",
      neighborhood: "Centro",
      hours: "Consultar horários",
      city: null,
      phone: null,
      latitude: null,
      longitude: null,
    });
  });
});

describe("adaptRowToColumns", () => {
  it("usa latitude/longitude no schema de produção", () => {
    const { row, dropped } = adaptRowToColumns(toBusinessRow(record), PROD_COLUMNS);
    expect(row).toMatchObject({ latitude: -21.19, longitude: -46.99, city: "Monte Santo de Minas" });
    expect(row).not.toHaveProperty("lat");
    expect(dropped).toEqual([]);
  });

  it("cai para lat/lng e descarta city no schema do repo", () => {
    const { row, dropped } = adaptRowToColumns(toBusinessRow(record), REPO_COLUMNS);
    expect(row).toMatchObject({ lat: -21.19, lng: -46.99 });
    expect(row).not.toHaveProperty("latitude");
    expect(dropped).toEqual(["city"]);
  });

  it("prefere hours a hours_text quando as duas existem", () => {
    const { row } = adaptRowToColumns({ hours: "8h-18h" }, PROD_COLUMNS);
    expect(row).toEqual({ hours: "8h-18h" });
  });

  it("usa hours_text quando é a única disponível", () => {
    const { row } = adaptRowToColumns({ hours: "8h-18h" }, new Set(["hours_text"]));
    expect(row).toEqual({ hours_text: "8h-18h" });
  });

  it("devolve a linha intacta quando não deu para descobrir as colunas", () => {
    const original = toBusinessRow(record);
    expect(adaptRowToColumns(original, null)).toEqual({ row: original, dropped: [] });
    expect(adaptRowToColumns(original, new Set())).toEqual({ row: original, dropped: [] });
  });
});

describe("columnsFromOpenApi", () => {
  const properties = { name: {}, latitude: {}, longitude: {} };

  it("lê o formato OpenAPI 2 do PostgREST (definitions)", () => {
    const columns = columnsFromOpenApi({ definitions: { businesses: { properties } } });
    expect([...columns].sort()).toEqual(["latitude", "longitude", "name"]);
  });

  it("lê o formato OpenAPI 3 (components.schemas)", () => {
    const columns = columnsFromOpenApi({ components: { schemas: { businesses: { properties } } } });
    expect(columns.has("latitude")).toBe(true);
  });

  it("devolve null quando a tabela não está no spec", () => {
    expect(columnsFromOpenApi({ definitions: { outra: { properties } } })).toBeNull();
    expect(columnsFromOpenApi({})).toBeNull();
    expect(columnsFromOpenApi(null)).toBeNull();
  });
});
