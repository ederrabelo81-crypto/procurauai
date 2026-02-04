import { supabase } from "@/lib/supabaseClient";
import { reportError } from "@/lib/errors/errorHandler";
import { resolveListingTypeId } from "@/lib/taxonomy";
import { cache, BUSINESS_CACHE_KEYS } from "@/lib/cache";

const FOOD_KEYWORDS = [
  "restaurante", "lanchonete", "pizzaria", "hamburguer", "bar",
  "cafe", "café", "padaria", "panificadora", "confeitaria", "gastro", "sorveteria",
];

const BUSINESS_KEYWORDS = [
  "madeireira", "material de construcao", "materiais de construção",
  "construcao", "construção", "loja", "mercado", "farmacia", "farmácia",
  "autopecas", "autopeças", "pet shop", "boutique",
];

const FOOD_REGEX = new RegExp(FOOD_KEYWORDS.join("|"), "i");
const BUSINESS_REGEX = new RegExp(BUSINESS_KEYWORDS.join("|"), "i");

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
  tags: string[];
  plan?: "free" | "pro" | "destaque";
  isVerified?: boolean;
};

function deriveCategorySlug(name?: string, category?: string, fallback = "servicos"): string {
  const inputText = `${name ?? ""} ${category ?? ""}`.toLowerCase();
  if (FOOD_REGEX.test(inputText)) return "comer-agora";
  if (BUSINESS_REGEX.test(inputText)) return "negocios";
  return fallback;
}

function buildFallbackFilters(slug: string, fields: string[] = ["category", "name"]): string | null {
  const activeFields = fields.filter(Boolean);
  if (activeFields.length === 0) return null;

  if (slug === "comer-agora") {
    const slugPhrase = slug.replace(/[-_]/g, " ");
    return FOOD_KEYWORDS.flatMap((keyword) =>
      activeFields.map((field) => `${field}.ilike.%${keyword}%`)
    )
      .concat(activeFields.map((field) => `${field}.ilike.%${slugPhrase}%`))
      .join(",");
  }

  const normalizedSlug = slug.replace(/-/g, " ");
  if (!normalizedSlug) return null;

  return activeFields.map((field) => `${field}.ilike.%${normalizedSlug}%`).join(",");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toUiBusiness(row: any, fallbackSlug: string): UiBusiness {
  const categoryName = row.category ?? row.categories?.name ?? "";
  const categorySlug =
    row.category_slug ??
    row.categories?.slug ??
    deriveCategorySlug(row.name, categoryName, fallbackSlug);

  return {
    id: row.id,
    name: row.name,
    neighborhood: row.neighborhood || "",
    coverImages: Array.isArray(row.cover_images) ? row.cover_images : [],
    isOpenNow: !!row.is_open_now,
    plan: row.plan ?? "free",
    isVerified: !!row.is_verified,
    category: categoryName,
    categorySlug,
    tags: [],
  };
}

export async function getBusinessesByCategorySlug(slug: string, limit = 8): Promise<UiBusiness[]> {
  const cacheKey = BUSINESS_CACHE_KEYS.byCategorySlug(slug, limit);
  const cachedResult = cache.get<UiBusiness[]>(cacheKey);
  if (cachedResult) return cachedResult;

  const normalizedSlug = normalizeCategorySlug(slug);
  const slugCandidates = Array.from(
    new Set([...buildSlugCandidates(normalizedSlug), ...buildSlugCandidates(slug)])
  );

  // Simplified query: try with category_slug first
  const { data, error } = await supabase
    .from("businesses")
    .select("id, name, neighborhood, cover_images, is_open_now, plan, is_verified, category, category_slug")
    .in("category_slug", slugCandidates)
    .limit(limit);

  if (error) {
    reportError(error, { scope: "getBusinessesByCategorySlug" });
    
    // Fallback: search by name
    const fallbackFilters = buildFallbackFilters(normalizedSlug, ["name"]);
    if (fallbackFilters) {
      const fallbackResponse = await supabase
        .from("businesses")
        .select("id, name, neighborhood, cover_images, is_open_now, plan, is_verified")
        .or(fallbackFilters)
        .limit(limit);

      if (fallbackResponse.error) {
        reportError(fallbackResponse.error, { scope: "fallback businesses" });
        return [];
      }

      const result = (fallbackResponse.data ?? []).map((row) => 
        toUiBusiness(row, normalizedSlug || slug)
      );
      cache.set(cacheKey, result, 5 * 60 * 1000);
      return result;
    }
    return [];
  }

  const result = (data ?? []).map((row) => toUiBusiness(row, normalizedSlug || slug));
  cache.set(cacheKey, result, 5 * 60 * 1000);
  return result;
}
