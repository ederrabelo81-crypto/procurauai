import { supabase } from "@/lib/supabaseClient";

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

function buildFallbackFilters(slug: string, categoryField = "category"): string | null {
  if (slug === "comer-agora") {
    const slugPhrase = slug.replace(/[-_]/g, " ");
    return FOOD_KEYWORDS.flatMap((keyword) => [
      `${categoryField}.ilike.%${keyword}%`,
      `name.ilike.%${keyword}%`,
    ])
      .concat([`${categoryField}.ilike.%${slugPhrase}%`, `name.ilike.%${slugPhrase}%`])
      .join(",");
  }

  const normalizedSlug = slug.replace(/-/g, " ");
  if (!normalizedSlug) return null;

  return [
    `${categoryField}.ilike.%${normalizedSlug}%`,
    `name.ilike.%${normalizedSlug}%`,
  ].join(",");
}

function isMissingColumnError(error: { message?: string } | null, column: string): boolean {
  if (!error?.message) return false;
  return error.message.includes(`column "${column}" does not exist`);
}

export async function getBusinessesByCategorySlug(slug: string, limit = 8): Promise<UiBusiness[]> {
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

  const slugCandidates = buildSlugCandidates(slug);
  let usedCategoryRelation = false;
  let { data, error } = await supabase
    .from("businesses")
    .select(baseSelect)
    .in("category_slug", slugCandidates)
    .limit(limit);

  // Fallback para schema com category_id/relacionamento de categorias (sem category/category_slug)
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

    const relationResponse = await supabase
      .from("businesses")
      .select(relationSelect)
      .in("categories.slug", slugCandidates)
      .limit(limit);

    data = relationResponse.data ?? [];
    error = relationResponse.error;

    if (error || (data ?? []).length === 0) {
      if (error) {
        console.error("Supabase error (getBusinessesByCategorySlug):", error);
      }

      const fallbackFilters = buildFallbackFilters(slug, "categories.name");

      if (fallbackFilters) {
        const fallbackResponse = await supabase
          .from("businesses")
          .select(relationSelect)
          .or(fallbackFilters)
          .limit(limit);

        if (fallbackResponse.error) {
          console.error("Supabase error (fallback businesses):", fallbackResponse.error);
          throw fallbackResponse.error;
        }

        data = fallbackResponse.data ?? [];
      }
    }
  }

  if (!usedCategoryRelation && (error || (data ?? []).length === 0)) {
    if (error) {
      console.error("Supabase error (getBusinessesByCategorySlug):", error);
    }

    const fallbackFilters = buildFallbackFilters(slug);

    if (fallbackFilters) {
      const fallbackResponse = await supabase
        .from("businesses")
        .select(baseSelect)
        .or(fallbackFilters)
        .limit(limit);

      if (fallbackResponse.error) {
        console.error("Supabase error (fallback businesses):", fallbackResponse.error);
        throw fallbackResponse.error;
      }

      data = fallbackResponse.data ?? [];
    }
  }

  // Converte do formato do banco para o formato do UI
  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    neighborhood: row.neighborhood || "",
    coverImages: Array.isArray(row.cover_images) ? row.cover_images : [],
    isOpenNow: !!row.is_open_now,
    plan: row.plan ?? "free",
    isVerified: !!row.is_verified,
    category: row.category ?? row.categories?.name ?? "",
    categorySlug:
      row.category_slug ??
      row.categories?.slug ??
      deriveCategorySlug(row.name, row.category ?? row.categories?.name, slug),
    category: row.category ?? "",
    categorySlug: row.category_slug ?? deriveCategorySlug(row.name, row.category, slug),
    tags: [], // ainda não temos chips/tags ligados no seed
  }));
}
