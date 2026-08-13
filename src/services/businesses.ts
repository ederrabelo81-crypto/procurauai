import { supabase } from "@/lib/supabaseClient";
import { reportError } from "@/lib/errors/errorHandler";
import { resolveListingTypeId } from "@/lib/taxonomy";
import { cache, BUSINESS_CACHE_KEYS } from "@/lib/cache";
import {
  FOOD_KEYWORDS,
  guessBusinessCategorySlug,
} from "@/lib/categoryHeuristics";
import type { CategorySlug } from "@/lib/categoryHeuristics";
import { resolveBusinessPhotos } from "@/lib/businessPhotos";

function buildSlugCandidates(slug: string): string[] {
  const candidates = [slug, slug.replace(/-/g, "_"), slug.replace(/-/g, " ")];
  return Array.from(new Set(candidates.filter(Boolean)));
}

function normalizeCategorySlug(slug: string): string {
  if (!slug) return slug;
  return resolveListingTypeId(slug);
}

export type UiBusiness = {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  neighborhood: string;
  coverImages: string[];
  isOpenNow: boolean;
  hours?: string; // Adicionando o campo hours para verificação de horário
  tags: string[];
  plan?: "free" | "pro" | "destaque";
  isVerified?: boolean;
  /** Coordenadas seguem até o card: alimentam mapa e Street View. */
  latitude?: number | null;
  longitude?: number | null;
};

/**
 * Colunas lidas em toda busca de comércio.
 *
 * `logo_url`, `latitude` e `longitude` entram porque a foto depende delas:
 * sem logo e sem coordenada, um comércio sem `cover_images` não tem como
 * render nada além do placeholder. Os dois schemas em circulação divergem nos
 * nomes (CLAUDE.md §11), por isso o select tem uma variante enxuta de reserva.
 */
const BUSINESS_SELECT =
  "id, name, neighborhood, cover_images, logo_url, latitude, longitude, " +
  "is_open_now, plan, is_verified, category, category_slug, hours, description";

/** Sem as colunas que só existem em um dos schemas. */
const BUSINESS_SELECT_MINIMAL =
  "id, name, neighborhood, cover_images, is_open_now, plan, is_verified, " +
  "category, category_slug, hours, description";

function deriveCategorySlug(
  name?: string,
  category?: string,
  description?: string,
  fallback: CategorySlug = "servicos",
): CategorySlug {
  return guessBusinessCategorySlug({ name, category, description }, fallback);
}

function buildFallbackFilters(
  slug: string,
  fields: string[] = ["category", "name"],
): string | null {
  const activeFields = fields.filter(Boolean);
  if (activeFields.length === 0) return null;

  if (slug === "comer-agora") {
    const slugPhrase = slug.replace(/[-_]/g, " ");
    return FOOD_KEYWORDS.flatMap((keyword) =>
      activeFields.map((field) => `${field}.ilike.%${keyword}%`),
    )
      .concat(activeFields.map((field) => `${field}.ilike.%${slugPhrase}%`))
      .join(",");
  }

  const normalizedSlug = slug.replace(/-/g, " ");
  if (!normalizedSlug) return null;

  return activeFields
    .map((field) => `${field}.ilike.%${normalizedSlug}%`)
    .join(",");
}

const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toUiBusiness(row: any, fallbackSlug: string): UiBusiness {
  const categoryName = row.category ?? row.categories?.name ?? "";
  const categorySlug =
    row.category_slug ??
    row.categories?.slug ??
    deriveCategorySlug(row.name, categoryName, row.description, fallbackSlug);

  return {
    id: row.id,
    name: row.name,
    neighborhood: row.neighborhood || "",
    // `cover_images` é jsonb e nem toda linha guarda um array de strings —
    // `resolveBusinessPhotos` normaliza as formas e completa com logo, acervo
    // curado ou Street View quando a linha vier sem foto.
    coverImages: resolveBusinessPhotos(row, { fallbackToPlaceholder: false }),
    latitude: toNumberOrNull(row.latitude ?? row.lat),
    longitude: toNumberOrNull(row.longitude ?? row.lng),
    isOpenNow: !!row.is_open_now,
    hours: row.hours || "", // Adicionando o campo hours do banco
    plan: row.plan ?? "free",
    isVerified: !!row.is_verified,
    category: categoryName,
    categorySlug,
    tags: [],
  };
}

export async function getBusinessesByCategorySlug(
  slug: string,
  limit = 8,
): Promise<UiBusiness[]> {
  const cacheKey = BUSINESS_CACHE_KEYS.byCategorySlug(slug, limit);
  const cachedResult = cache.get<UiBusiness[]>(cacheKey);
  if (cachedResult) return cachedResult;

  const normalizedSlug = normalizeCategorySlug(slug);
  const slugCandidates = Array.from(
    new Set([
      ...buildSlugCandidates(normalizedSlug),
      ...buildSlugCandidates(slug),
    ]),
  );

  // Simplified query: try with category_slug first
  let { data, error } = await supabase
    .from("businesses")
    .select(BUSINESS_SELECT)
    .in("category_slug", slugCandidates)
    .limit(limit);

  // `logo_url`/`latitude`/`longitude` não existem em todo schema em circulação;
  // quando o PostgREST recusa a coluna, repete sem elas em vez de devolver
  // vazio (o erro é 42703 / "column ... does not exist").
  if (error) {
    const retry = await supabase
      .from("businesses")
      .select(BUSINESS_SELECT_MINIMAL)
      .in("category_slug", slugCandidates)
      .limit(limit);

    if (!retry.error) ({ data, error } = retry);
  }

  if (error) {
    reportError(error, { scope: "getBusinessesByCategorySlug" });

    // Fallback: search by name
    const fallbackFilters = buildFallbackFilters(normalizedSlug, ["name"]);
    if (fallbackFilters) {
      const fallbackResponse = await supabase
        .from("businesses")
        .select(BUSINESS_SELECT_MINIMAL)
        .or(fallbackFilters)
        .limit(limit);

      if (fallbackResponse.error) {
        reportError(fallbackResponse.error, { scope: "fallback businesses" });
        return [];
      }

      const result = (fallbackResponse.data ?? []).map((row) =>
        toUiBusiness(row, normalizedSlug || slug),
      );
      cache.set(cacheKey, result, 5 * 60 * 1000);
      return result;
    }
    return [];
  }

  const result = (data ?? []).map((row) =>
    toUiBusiness(row, normalizedSlug || slug),
  );
  cache.set(cacheKey, result, 5 * 60 * 1000);
  return result;
}
