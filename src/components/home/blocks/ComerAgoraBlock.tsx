import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Clock, MapPin, Utensils } from "lucide-react";
import type { UiBusiness } from "@/services/businesses";
import { getBusinessesByCategorySlug } from "@/services/businesses";
import { businesses as mockBusinesses } from "@/data/mockData";
import { SmartImage } from "@/components/ui/SmartImage";
import { resolveBusinessPhotos } from "@/lib/businessPhotos";
import { reportError } from "@/lib/errors/errorHandler";

// Keywords para identificar estabelecimentos de comida
const FOOD_KEYWORDS = [
  "restaurante",
  "lanchonete",
  "pizzaria",
  "hamburguer",
  "hamburgueria",
  "bar",
  "cafe",
  "café",
  "padaria",
  "panificadora",
  "confeitaria",
  "gastro",
  "sorveteria",
  "açaí",
  "acai",
  "sushi",
  "japonês",
  "japones",
  "churrasco",
  "churrascaria",
  "espetinho",
  "marmita",
  "marmitex",
  "pastelaria",
  "pastel",
  "food",
  "delivery",
  "fast food",
  "comida",
];

function isFoodBusiness(name: string, category: string): boolean {
  const text = `${name} ${category}`.toLowerCase();
  return FOOD_KEYWORDS.some((keyword) => text.includes(keyword));
}

function getMockFoodBusinesses(): UiBusiness[] {
  return mockBusinesses
    .filter(
      (b) =>
        b.categorySlug === "comer-agora" || isFoodBusiness(b.name, b.category),
    )
    .slice(0, 8)
    .map((b) => ({
      id: b.id,
      name: b.name,
      category: b.category,
      categorySlug: b.categorySlug || "comer-agora",
      neighborhood: b.neighborhood,
      coverImages: b.coverImages || [],
      isOpenNow: b.isOpenNow,
      hours: b.hours,
      tags: b.tags || [],
      plan: b.plan,
      isVerified: b.isVerified,
    }));
}

export function ComerAgoraBlock() {
  const [items, setItems] = useState<UiBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        // 1. Tenta buscar pela categoria "comer-agora"
        let data = await getBusinessesByCategorySlug("comer-agora", 8);

        // 2. Se poucos resultados, busca em "servicos" e filtra por keywords de comida
        if (data.length < 4) {
          const fallbackData = await getBusinessesByCategorySlug(
            "servicos",
            30,
          );
          const foodPlaces = fallbackData.filter((place) =>
            isFoodBusiness(place.name, place.category),
          );

          // Merge sem duplicatas
          const existingIds = new Set(data.map((d) => d.id));
          const newItems = foodPlaces.filter((p) => !existingIds.has(p.id));
          data = [...data, ...newItems].slice(0, 8);
        }

        // 3. Fallback final: usa mockData se ainda não tiver dados suficientes
        if (data.length < 2) {
          data = getMockFoodBusinesses();
        }

        setItems(data);
      } catch (e) {
        reportError(e, { scope: "ComerAgoraBlock" });
        // Em caso de erro, usa mockData
        setItems(getMockFoodBusinesses());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <section>
        <SectionHeader
          title="Comer Agora"
          icon={Utensils}
          iconVariant="warning"
        />
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide fade-edges">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-[13rem] flex-shrink-0 overflow-hidden rounded-lg border border-border bg-card skeleton-pulse"
            >
              <div className="aspect-[4/3] bg-muted" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Se não há nenhum item, não renderiza a seção
  if (items.length === 0) return null;

  return (
    <section>
      <SectionHeader
        kicker="Fome agora"
        title="Comer Agora"
        icon={Utensils}
        iconVariant="warning"
        action={{ label: "Ver todos", to: "/categoria/comer-agora" }}
      />

      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide fade-edges">
        {items.map((place) => (
          <Link
            key={place.id}
            to={`/comercio/${place.id}`}
            className="almanac-card group w-[13rem] flex-shrink-0 overflow-hidden"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <SmartImage
                sources={resolveBusinessPhotos(place)}
                alt={place.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.07]"
                loading="lazy"
              />

              {place.isOpenNow && (
                <span className="stamp absolute left-2 top-2 inline-flex items-center gap-1 border-status-open/40 bg-card/95 px-2 py-[3px] text-[0.625rem] font-bold text-status-open backdrop-blur-sm">
                  <Clock className="h-3 w-3" />
                  Aberto
                </span>
              )}
            </div>

            <div className="p-3">
              <h3 className="mb-1 line-clamp-1 font-display text-[0.95rem] font-bold leading-snug text-foreground">
                {place.name}
              </h3>

              <p className="eyebrow mb-2 line-clamp-1 text-muted-foreground">
                {place.category}
              </p>

              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 flex-shrink-0 text-primary" />
                {place.neighborhood}
              </p>

              {place.tags?.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {place.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded border border-border bg-muted/60 px-1.5 py-0.5 text-2xs font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
