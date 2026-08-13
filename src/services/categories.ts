import { z } from "zod";
import { supabase } from "@/lib/supabaseClient";
import { resolveListingTypeId } from "@/lib/taxonomy";
import { resolveBusinessPhotos } from "@/lib/businessPhotos";
import { reportError } from "@/lib/errors/errorHandler";
import type { Business as UiBusiness, BusinessPlan } from "@/data/mockData";

const businessRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string().nullable().optional(),
  category_slug: z.string().nullable().optional(),
  neighborhood: z.string().nullable().optional(),
  // `cover_images` é jsonb: além de array de strings, a base tem linha com
  // array de objetos e com JSON dentro de uma string. Exigir `array(string)`
  // aqui derrubava a lista inteira por causa de uma linha — a normalização
  // fica com `resolveBusinessPhotos`, que entende as três formas.
  cover_images: z.unknown().nullable().optional(),
  logo_url: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  is_open_now: z.boolean().nullable().optional(),
  // Plano fora do enum (valor novo no banco antes do deploy do front) não pode
  // derrubar a listagem: normaliza para "free" na leitura.
  plan: z.string().nullable().optional(),
  is_verified: z.boolean().nullable().optional(),
  categories: z
    .object({
      name: z.string().nullable().optional(),
      slug: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

type BusinessRow = z.infer<typeof businessRowSchema>;

/**
 * Valida linha a linha e descarta só o que não dá para exibir.
 *
 * Com `z.array(...).parse()` uma única linha inesperada rejeitava o lote
 * inteiro e a página inteira caía no estado de erro.
 */
function parseBusinessRows(rows: unknown): BusinessRow[] {
  if (!Array.isArray(rows)) return [];

  const parsed: BusinessRow[] = [];
  for (const row of rows) {
    const result = businessRowSchema.safeParse(row);
    if (result.success) parsed.push(result.data);
    else reportError(result.error, { scope: "getBusinessesByCategory row" });
  }
  return parsed;
}

const PLANS = new Set<BusinessPlan>(["free", "pro", "destaque"]);

function toPlan(value: unknown): BusinessPlan {
  return PLANS.has(value as BusinessPlan) ? (value as BusinessPlan) : "free";
}

export type Business = UiBusiness;

const ALL_CATEGORIES = [
  "food",
  "classifieds",
  "deals",
  "services",
  "events",
  "obituary",
  "news",
  "store",
  "places",
  "cars",
  "jobs",
  "realestate",
] as const;

export type Category = (typeof ALL_CATEGORIES)[number];

const DEFAULT_WHATSAPP = "5535990000000";
const DEFAULT_HOURS = "Consultar horários";

function normalizeBusinessRow(row: BusinessRow): UiBusiness {
  const categoryName = row.category ?? row.categories?.name ?? "";
  const categorySlug =
    row.category_slug ??
    row.categories?.slug ??
    resolveListingTypeId(categoryName || "services");

  return {
    id: row.id,
    name: row.name,
    category: categoryName,
    categorySlug,
    neighborhood: row.neighborhood ?? "",
    coverImages: resolveBusinessPhotos(row, { fallbackToPlaceholder: false }),
    isOpenNow: Boolean(row.is_open_now),
    plan: toPlan(row.plan),
    isVerified: Boolean(row.is_verified),
    tags: [],
    hours: DEFAULT_HOURS,
    whatsapp: DEFAULT_WHATSAPP,
    phone: undefined,
    description: "",
    address: "",
  };
}

function buildCategoryCandidates(category: string): string[] {
  const normalized = resolveListingTypeId(category);
  return Array.from(new Set([category, normalized].filter(Boolean)));
}

export async function getBusinessesByCategory(
  category: Category,
  limit = 20,
): Promise<UiBusiness[]> {
  const candidates = buildCategoryCandidates(category);
  const filterValues = candidates.map((value) => `"${value}"`).join(",");
  // `logo_url`, `latitude` e `longitude` entram porque a foto depende delas:
  // sem foto gravada, é o que sobra para render algo além do placeholder.
  const baseSelect = [
    "id",
    "name",
    "category",
    "category_slug",
    "neighborhood",
    "cover_images",
    "logo_url",
    "latitude",
    "longitude",
    "is_open_now",
    "plan",
    "is_verified",
    "categories(name, slug)",
  ].join(",");

  const primaryResponse = await supabase
    .from("businesses")
    .select(baseSelect)
    .or(
      `category_slug.in.(${filterValues}),categories.slug.in.(${filterValues})`,
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (primaryResponse.error) {
    const fallbackResponse = await supabase
      .from("businesses")
      .select(baseSelect)
      .in("category_slug", candidates)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (fallbackResponse.error) {
      throw fallbackResponse.error;
    }

    return parseBusinessRows(fallbackResponse.data).map(normalizeBusinessRow);
  }

  return parseBusinessRows(primaryResponse.data).map(normalizeBusinessRow);
}

export const getFood = (limit?: number) =>
  getBusinessesByCategory("food", limit);
export const getPlaces = (limit?: number) =>
  getBusinessesByCategory("places", limit);
export const getCars = (limit?: number) =>
  getBusinessesByCategory("cars", limit);
export const getJobs = (limit?: number) =>
  getBusinessesByCategory("jobs", limit);
export const getDeals = (limit?: number) =>
  getBusinessesByCategory("deals", limit);
export const getServices = (limit?: number) =>
  getBusinessesByCategory("services", limit);
export const getEvents = (limit?: number) =>
  getBusinessesByCategory("events", limit);
export const getNews = (limit?: number) =>
  getBusinessesByCategory("news", limit);
export const getStore = (limit?: number) =>
  getBusinessesByCategory("store", limit);
export const getRealEstate = (limit?: number) =>
  getBusinessesByCategory("realestate", limit);
export const getObituary = (limit?: number) =>
  getBusinessesByCategory("obituary", limit);
export const getClassifieds = (limit?: number) =>
  getBusinessesByCategory("classifieds", limit);
