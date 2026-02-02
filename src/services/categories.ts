import { z } from "zod";
import { supabase } from "@/lib/supabaseClient";
import { resolveListingTypeId } from "@/lib/taxonomy";
import type { Business as UiBusiness, BusinessPlan } from "@/data/mockData";

const businessRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string().nullable().optional(),
  category_slug: z.string().nullable().optional(),
  neighborhood: z.string().nullable().optional(),
  cover_images: z.array(z.string()).nullable().optional(),
  is_open_now: z.boolean().nullable().optional(),
  plan: z.enum(["free", "pro", "destaque"]).nullable().optional(),
  is_verified: z.boolean().nullable().optional(),
  categories: z
    .object({
      name: z.string().nullable().optional(),
      slug: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

const businessRowsSchema = z.array(businessRowSchema);

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

function normalizeBusinessRow(row: z.infer<typeof businessRowSchema>): UiBusiness {
  const categoryName = row.category ?? row.categories?.name ?? "";
  const categorySlug =
    row.category_slug ?? row.categories?.slug ?? resolveListingTypeId(categoryName || "services");

  return {
    id: row.id,
    name: row.name,
    category: categoryName,
    categorySlug,
    neighborhood: row.neighborhood ?? "",
    coverImages: row.cover_images ?? [],
    isOpenNow: Boolean(row.is_open_now),
    plan: (row.plan ?? "free") as BusinessPlan,
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
  const baseSelect = [
    "id",
    "name",
    "category",
    "category_slug",
    "neighborhood",
    "cover_images",
    "is_open_now",
    "plan",
    "is_verified",
    "categories(name, slug)",
  ].join(",");

  const primaryResponse = await supabase
    .from("businesses")
    .select(baseSelect)
    .or(`category_slug.in.(${filterValues}),categories.slug.in.(${filterValues})`)
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

    return businessRowsSchema
      .parse(fallbackResponse.data ?? [])
      .map(normalizeBusinessRow);
  }

  return businessRowsSchema
    .parse(primaryResponse.data ?? [])
    .map(normalizeBusinessRow);
}

export const getFood = (limit?: number) => getBusinessesByCategory("food", limit);
export const getPlaces = (limit?: number) => getBusinessesByCategory("places", limit);
export const getCars = (limit?: number) => getBusinessesByCategory("cars", limit);
export const getJobs = (limit?: number) => getBusinessesByCategory("jobs", limit);
export const getDeals = (limit?: number) => getBusinessesByCategory("deals", limit);
export const getServices = (limit?: number) => getBusinessesByCategory("services", limit);
export const getEvents = (limit?: number) => getBusinessesByCategory("events", limit);
export const getNews = (limit?: number) => getBusinessesByCategory("news", limit);
export const getStore = (limit?: number) => getBusinessesByCategory("store", limit);
export const getRealEstate = (limit?: number) => getBusinessesByCategory("realestate", limit);
export const getObituary = (limit?: number) => getBusinessesByCategory("obituary", limit);
export const getClassifieds = (limit?: number) =>
  getBusinessesByCategory("classifieds", limit);
