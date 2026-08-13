import { beforeEach, describe, expect, test, vi } from "vitest";
import { getBusinessesByCategorySlug } from "../businesses";
import { PHOTO_PLACEHOLDER } from "@/lib/businessPhotos";
import { cache } from "@/lib/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let rows: any[] = [];

const chain = {
  select: () => chain,
  in: () => chain,
  or: () => chain,
  limit: () => Promise.resolve({ data: rows, error: null }),
};

vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    from: () => chain,
  },
}));

vi.mock("../supabaseRequest", () => ({
  executeSupabase: (operation: () => Promise<{ data: [] }>) => operation(),
}));

describe("getBusinessesByCategorySlug", () => {
  beforeEach(() => {
    rows = [];
    // O service memoiza por slug+limit; sem limpar, um teste veria o resultado
    // do anterior.
    cache.clear();
  });

  test("handles empty data", async () => {
    const result = await getBusinessesByCategorySlug("comer-agora");
    expect(result).toEqual([]);
  });

  test("recupera a foto curada de linha importada sem cover_images", async () => {
    // Formato exato do que `scripts/import-businesses.mjs` grava: sem foto
    // (política do Google), mas com nome e coordenadas.
    rows = [
      {
        id: "uuid-1",
        name: "Haru Sushi",
        category: "Restaurante Japonês",
        category_slug: "comer-agora",
        neighborhood: "Centro",
        cover_images: [],
        latitude: -20.8903,
        longitude: -46.7029,
      },
    ];

    const [business] = await getBusinessesByCategorySlug("comer-agora");

    expect(business.coverImages.length).toBeGreaterThan(0);
    expect(business.coverImages[0]).toMatch(/^https:\/\//);
    expect(business.coverImages[0]).not.toBe(PHOTO_PLACEHOLDER);
    expect(business.latitude).toBe(-20.8903);
  });

  test("aceita cover_images gravado como string de JSON (jsonb)", async () => {
    rows = [
      {
        id: "uuid-2",
        name: "Comércio Sem Acervo XPTO",
        category_slug: "negocios",
        cover_images: '["https://exemplo.com/fachada.jpg"]',
      },
    ];

    const [business] = await getBusinessesByCategorySlug("negocios");

    expect(business.coverImages).toEqual(["https://exemplo.com/fachada.jpg"]);
  });

  test("cai no logo quando não há capa nem foto curada", async () => {
    rows = [
      {
        id: "uuid-3",
        name: "Comércio Sem Acervo XPTO",
        category_slug: "negocios",
        cover_images: null,
        logo_url: "https://exemplo.com/logo.png",
      },
    ];

    const [business] = await getBusinessesByCategorySlug("negocios");

    expect(business.coverImages).toEqual(["https://exemplo.com/logo.png"]);
  });

  test('descarta string vazia — nunca devolve <img src="">', async () => {
    rows = [
      {
        id: "uuid-4",
        name: "Comércio Sem Acervo XPTO",
        category_slug: "negocios",
        cover_images: ["", "   "],
      },
    ];

    const [business] = await getBusinessesByCategorySlug("negocios");

    expect(business.coverImages).toEqual([]);
  });
});
