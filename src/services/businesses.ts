import { supabase } from "@/lib/supabaseClient";
import { reportError } from "@/lib/errors/errorHandler";
import { executeSupabase } from "@/services/supabaseRequest";
import { resolveListingTypeId } from "@/lib/taxonomy";
import { cache, BUSINESS_CACHE_KEYS } from "@/lib/cache";

const FOOD_KEYWORDS = [
  "restaurante",
  "lanchonete",
  "pizzaria",
  "hamburguer",
  "bar",
  "cafe",
  "café",
  "padaria",
  "panificadora",
  "confeitaria",
  "gastro",
  "sorveteria",
];

const BUSINESS_KEYWORDS = [
  "madeireira",
  "material de construcao",
  "materiais de construção",
  "construcao",
  "construção",
  "loja",
  "mercado",
  "farmacia",
  "farmácia",
  "autopecas",
  "autopeças",
  "pet shop",
  "boutique",
];

const FOOD_REGEX = new RegExp(FOOD_KEYWORDS.join("|"), "i");
const BUSINESS_REGEX = new RegExp(BUSINESS_KEYWORDS.join("|"), "i");

function buildSlugCandidates(slug: string): string[] {
  const candidates = [
    slug,
    slug.replace(/-/g, "_"),
    slug.replace(/-/g, " "),
  ];

  return Array.from(new Set(candidates.filter(Boolean)));
}

function normalizeCategorySlug(slug: string): string {
  if (!slug) return slug;
  return resolveListingTypeId(slug);
}

// Formato que o bloco da Home precisa (parecido com o mock)
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

function isMissingColumnError(error: { message?: string } | null, column: string): boolean {
  if (!error?.message) return false;
  return error.message.includes(`column "${column}" does not exist`);
}

function isMissingRelationError(error: { message?: string } | null, relation: string): boolean {
  if (!error?.message) return false;
  return (
    error.message.includes(`relationship`) &&
    error.message.includes(relation) &&
    error.message.includes(`schema cache`)
  );
}

// Helper para converter qualquer resultado do Supabase para UiBusiness
type BusinessRow = {
  id: string;
  name: string;
  neighborhood?: string | null;
  cover_images?: string[] | null;
  is_open_now?: boolean | null;
  plan?: "free" | "pro" | "destaque" | null;
  is_verified?: boolean | null;
  category?: string | null;
  category_slug?: string | null;
  categories?: {
    name?: string | null;
    slug?: string | null;
  } | null;
};

function toUiBusiness(row: BusinessRow, fallbackSlug: string): UiBusiness {
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
  // Check cache first
  const cacheKey = BUSINESS_CACHE_KEYS.byCategorySlug(slug, limit);
  const cachedResult = cache.get<UiBusiness[]>(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  const normalizedSlug = normalizeCategorySlug(slug);
  const slugCandidates = Array.from(
    new Set([...buildSlugCandidates(normalizedSlug), ...buildSlugCandidates(slug)])
  );
  const baseSelect = `
    id,
    name,
    neighborhood,
    cover_images,
    is_open_now,
    plan,
    is_verified,
    category,
    category_slug
  `;
  const baseSelectWithoutCategory = `
    id,
    name,
    neighborhood,
    cover_images,
    is_open_now,
    plan,
    is_verified,
    category_slug
  `;
  const baseSelectMinimal = `
    id,
    name,
    neighborhood,
    cover_images,
    is_open_now,
    plan,
    is_verified
  `;

  let usedCategoryRelation = false;
  let data: BusinessRow[] | null = null;
  let error: { message?: string } | null = null;

  // Primeira tentativa: buscar com category e category_slug
  const result1 = await executeSupabase(() =>
    supabase
      .from("businesses")
      .select(baseSelect)
      .in("category_slug", slugCandidates)
      .limit(limit)
  );
  
  data = result1.data;
  error = result1.error;

  // Se category não existe mas category_slug existe
  if (isMissingColumnError(error, "category") && !isMissingColumnError(error, "category_slug")) {
    const result2 = await executeSupabase(() =>
      supabase
        .from("businesses")
        .select(baseSelectWithoutCategory)
        .in("category_slug", slugCandidates)
        .limit(limit)
    );
    
    data = result2.data;
    error = result2.error;
  }

  // Fallback para schema com category_id/relacionamento de categorias
  if (isMissingColumnError(error, "category_slug") || isMissingColumnError(error, "category")) {
    usedCategoryRelation = true;
    const relationSelect = `
      id,
      name,
      neighborhood,
      cover_images,
      is_open_now,
      plan,
      is_verified,
      category_id,
      categories:categories!inner (
        name,
        slug
      )
    `;

    const relationResponse = await executeSupabase(() =>
      supabase
        .from("businesses")
        .select(relationSelect)
        .in("categories.slug", slugCandidates)
        .limit(limit)
    );

    data = relationResponse.data ?? [];
    error = relationResponse.error;

    if (error || (data ?? []).length === 0) {
      if (error) {
        reportError(error, { scope: "getBusinessesByCategorySlug" });
      }

      if (isMissingRelationError(error, "categories")) {
        const fallbackFilters = buildFallbackFilters(normalizedSlug, ["name"]);
        if (fallbackFilters) {
          const fallbackResponse = await executeSupabase(() =>
            supabase
              .from("businesses")
              .select(baseSelectMinimal)
              .or(fallbackFilters)
              .limit(limit)
          );

          if (fallbackResponse.error) {
            reportError(fallbackResponse.error, { scope: "fallback businesses" });
            throw fallbackResponse.error;
          }

          data = fallbackResponse.data ?? [];
        }
        error = null;
      }
    }

    if ((!data || data.length === 0) && !isMissingRelationError(error, "categories")) {
      const fallbackFilters = buildFallbackFilters(normalizedSlug, ["categories.name", "name"]);

      if (fallbackFilters) {
        const fallbackResponse = await executeSupabase(() =>
          supabase
            .from("businesses")
            .select(relationSelect)
            .or(fallbackFilters)
            .limit(limit)
        );

        if (fallbackResponse.error) {
          reportError(fallbackResponse.error, { scope: "fallback businesses" });
          throw fallbackResponse.error;
        }

        data = fallbackResponse.data ?? [];
      }
    }
  }

  if (!usedCategoryRelation && (error || (data ?? []).length === 0)) {
    if (error) {
      reportError(error, { scope: "getBusinessesByCategorySlug" });
    }

    const fallbackFilters = buildFallbackFilters(normalizedSlug, ["category", "name"]);
    const fallbackSelect = isMissingColumnError(error, "category")
      ? baseSelectWithoutCategory
      : baseSelect;

    if (fallbackFilters) {
      const fallbackResponse = await executeSupabase(() =>
        supabase
          .from("businesses")
          .select(fallbackSelect)
          .or(fallbackFilters)
          .limit(limit)
      );

      if (fallbackResponse.error) {
        reportError(fallbackResponse.error, { scope: "fallback businesses" });
        throw fallbackResponse.error;
      }

      data = fallbackResponse.data ?? [];
    }
  }

  if (
    !usedCategoryRelation &&
    isMissingColumnError(error, "category_slug") &&
    !isMissingColumnError(error, "category")
  ) {
    const fallbackFilters = buildFallbackFilters(normalizedSlug, ["name"]);

    if (fallbackFilters) {
      const fallbackResponse = await executeSupabase(() =>
        supabase
          .from("businesses")
          .select(baseSelectMinimal)
          .or(fallbackFilters)
          .limit(limit)
      );

      if (fallbackResponse.error) {
        reportError(fallbackResponse.error, { scope: "fallback businesses" });
        throw fallbackResponse.error;
      }

      data = fallbackResponse.data ?? [];
    }
  }

  // Converte do formato do banco para o formato do UI usando helper
  const result = (data ?? []).map((row) => toUiBusiness(row, normalizedSlug || slug));
  
  // Cache the result for 5 minutes
  cache.set(cacheKey, result, 5 * 60 * 1000);
  
  return result;
}
