import { guessBusinessCategorySlug } from "@/lib/categoryHeuristics";

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

export interface Business {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  tags: string[];
  neighborhood: string;
  hours: string;
  phone?: string;
  whatsapp: string;
  coverImages: string[];
  isOpenNow: boolean;
  isVerified: boolean;
  description: string;
  address: string;
  averageRating?: number;
  reviewCount?: number;
  reviews?: Review[];
  plan?: "free" | "pro" | "destaque";
  website?: string;
  instagram?: string;
  logo?: string;
}

const DEFAULT_IMAGE = "/placeholder.svg";

const GOOGLE_MAPS_TAG_BLACKLIST = new Set([
  "point_of_interest",
  "establishment",
]);

/**
 * Tenta adivinhar a "lesma" da categoria (categorySlug) com base no nome, categoria e descrição.
 * Esta função é um fallback crucial para garantir que os negócios sejam exibidos nas seções corretas,
 * mesmo que o campo `categorySlug` não esteja explicitamente definido no banco de dados.
 *
 * A descrição só entra quando nome + categoria não decidem nada — ver
 * `guessBusinessCategorySlug()`.
 */
// As funções abaixo recebem a linha crua do Supabase/Google Maps, cujo formato
// varia conforme a origem (colunas do banco, payload do Places, mock). Enquanto
// não houver schema Zod para essa entrada, o `any` fica isolado nas assinaturas
// — ver CLAUDE.md §7.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function guessCategorySlug(rawData: any): string {
  // Aqui o fallback é 'negocios': quem chega sem categorySlug por esta via
  // costuma ser comércio importado de fora, não prestador de serviço.
  return guessBusinessCategorySlug(
    {
      name: rawData.name,
      category: rawData.category,
      description: rawData.description,
    },
    "negocios",
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractGoogleMapsTags(rawData: any): string[] {
  const tags: string[] = [];
  const sources = [
    rawData?.types,
    rawData?.placeTypes,
    rawData?.googleMapsTypes,
    rawData?.googleMaps?.types,
    rawData?.googleMaps?.placeTypes,
    rawData?.googleMaps?.primaryType,
    rawData?.googleMaps?.primaryTypeDisplayName,
    rawData?.primaryType,
    rawData?.primaryTypeDisplayName,
  ];

  sources.forEach((source) => {
    if (Array.isArray(source)) {
      tags.push(...source.filter((value) => typeof value === "string"));
      return;
    }
    if (typeof source === "string") {
      tags.push(source);
    }
  });

  const normalized = new Set<string>();
  tags.forEach((tag) => {
    const cleaned = tag.trim();
    if (!cleaned) return;
    if (GOOGLE_MAPS_TAG_BLACKLIST.has(cleaned)) return;
    normalized.add(cleaned.replace(/\s+/g, " "));
  });

  return Array.from(normalized);
}

function parseRatingFromDescription(description?: string): {
  rating?: number;
  count?: number;
} {
  if (!description) return {};
  // Aceita os dois formatos que existem na base: o antigo "Nota: 4.400000 (46"
  // e o normalizado "Nota 4,4 (46". O regex anterior exigia espaço logo após
  // "Nota" e ponto decimal, então não casava com nenhum dos dois.
  const ratingMatch = description.match(
    /Nota:?\s*(\d+(?:[.,]\d+)?)\s*\((\d+)/i,
  );
  if (!ratingMatch) return {};
  return {
    rating: parseFloat(ratingMatch[1].replace(",", ".")),
    count: parseInt(ratingMatch[2]),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeReviews(rawData: any): Review[] {
  const source =
    rawData?.googleMaps?.reviews ||
    rawData?.googleMapsReviews ||
    rawData?.reviews ||
    [];

  if (!Array.isArray(source)) return [];

  return (
    source
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((review: any, index: number) => {
        const author =
          review?.author_name ||
          review?.authorName ||
          review?.author ||
          "Anônimo";
        const rating = Number(review?.rating ?? review?.score ?? 0);
        const text = review?.text || review?.comment || "";
        const date =
          review?.relative_time_description ||
          review?.relativeTimeDescription ||
          review?.date ||
          "";
        const id = String(review?.time || review?.id || `${author}-${index}`);

        return {
          id,
          author,
          rating,
          text,
          date,
        };
      })
      .filter((review) => review.author || review.text || review.rating)
  );
}

// Função helper para normalizar dados da API
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeBusinessData(rawData: any): Business {
  const googleMapsTags = extractGoogleMapsTags(rawData);
  const combinedTags = new Set<string>([
    ...googleMapsTags,
    ...(rawData.tags || []),
  ]);
  const fallbackRatings = parseRatingFromDescription(rawData.description);
  const averageRating =
    rawData.averageRating ??
    rawData.rating ??
    rawData.googleMaps?.rating ??
    rawData.googleMapsRating ??
    fallbackRatings.rating;
  const reviewCount =
    rawData.reviewCount ??
    rawData.reviewsCount ??
    rawData.googleMaps?.user_ratings_total ??
    rawData.googleMaps?.reviewCount ??
    rawData.googleMaps?.reviewsCount ??
    rawData.googleMapsReviewsCount ??
    fallbackRatings.count;
  const reviews = normalizeReviews(rawData);

  return {
    id: rawData.id || `temp_${Date.now()}`,
    name: rawData.name || "Sem nome",
    category: rawData.category || "Não categorizado",
    // Usa o `categorySlug` do banco de dados, se existir; caso contrário, usa a função para adivinhar.
    categorySlug: rawData.categorySlug || guessCategorySlug(rawData),
    tags: Array.from(combinedTags),
    neighborhood: rawData.neighborhood || "Sem bairro",
    hours: rawData.hours || "Consultar horários",
    phone: rawData.phone || undefined,
    whatsapp: rawData.whatsapp || "5535990000000",
    coverImages: rawData.coverImages?.length
      ? rawData.coverImages
      : [DEFAULT_IMAGE],
    isOpenNow: rawData.isOpenNow ?? false,
    isVerified: rawData.isVerified ?? false, // Corrigido: rawAta -> rawData
    description: rawData.description || "",
    address: rawData.address || "",
    averageRating:
      typeof averageRating === "number" && !Number.isNaN(averageRating)
        ? averageRating
        : undefined,
    reviewCount:
      typeof reviewCount === "number" && !Number.isNaN(reviewCount)
        ? reviewCount
        : undefined,
    reviews,
    plan: rawData.plan,
    website: rawData.website,
    instagram: rawData.instagram,
    logo: rawData.logo,
  };
}
