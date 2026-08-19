import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Clock, MapPin, TrendingUp } from "lucide-react";
import type { UiBusiness } from "@/services/businesses";
import { getBusinessesByCategorySlug } from "@/services/businesses";
import { businesses as mockBusinesses } from "@/data/mockData";
import { SmartImage } from "@/components/ui/SmartImage";
import { resolveBusinessPhotos } from "@/lib/businessPhotos";
import { reportError } from "@/lib/errors/errorHandler";
import { useMostSearchedBusinesses } from "@/hooks/useMostSearchedInsights";

// Mapeamento de categorias do WhatsApp para slugs do app
const CATEGORY_MAPPING: Record<string, string[]> = {
  comida: ["comer-agora", "servicos"],
  saude_medico: ["saude-e-servicos"],
  transporte: ["transporte"],
  aluguel_imovel: ["imoveis"],
  roupa_loja: ["servicos"],
  reparos_casa: ["servicos"],
  pet_veterinario: ["servicos"],
  auto_mecanico: ["servicos"],
  beleza_estetica: ["servicos"],
};

// Keywords para identificar estabelecimentos por categoria
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  comida: [
    "restaurante",
    "lanchonete",
    "pizzaria",
    "hamburguer",
    "bar",
    "cafe",
    "padaria",
    "confeitaria",
    "sorveteria",
    "açaí",
    "sushi",
    "churrasco",
    "marmita",
    "delivery",
  ],
  saude_medico: [
    "farmácia",
    "farmacia",
    "médico",
    "medico",
    "clínica",
    "clinica",
    "laboratório",
    "dentista",
    "saúde",
    "saude",
  ],
  transporte: [
    "taxi",
    "táxi",
    "uber",
    "van",
    "frete",
    "mudança",
    "entregador",
  ],
};

function matchesCategory(
  name: string,
  category: string,
  whatsappCategory: string,
): boolean {
  const text = `${name} ${category}`.toLowerCase();
  const keywords = CATEGORY_KEYWORDS[whatsappCategory] || [];
  return keywords.some((keyword) => text.includes(keyword));
}

interface MostSearchedItem {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  neighborhood: string;
  coverImages?: string[];
  isOpenNow?: boolean;
  hours?: string;
  tags?: string[];
  plan?: string;
  isVerified?: boolean;
  searchCount: number;
  whatsappCategory: string;
}

export function MaisProcuradosBlock() {
  const [items, setItems] = useState<MostSearchedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: mostSearched = [] } = useMostSearchedBusinesses();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        // Ordena os mais buscados do WhatsApp por quantidade de pedidos
        const sortedByDemand = [...mostSearched].sort(
          (a, b) => b.vezes_pedido - a.vezes_pedido,
        );

        // Pega os top 12 mais buscados das categorias de comida e saúde
        const topFoodAndHealth = sortedByDemand.filter(
          (item) =>
            item.categoria === "comida" || item.categoria === "saude_medico",
        ).slice(0, 12);

        // Busca os negócios correspondentes no banco
        const mappedItems: MostSearchedItem[] = [];

        for (const searched of topFoodAndHealth) {
          const slugs = CATEGORY_MAPPING[searched.categoria] || [];
          
          for (const slug of slugs) {
            const businesses = await getBusinessesByCategorySlug(slug, 50);
            
            const match = businesses.find((b) =>
              matchesCategory(b.name, b.category, searched.categoria),
            );

            if (match) {
              mappedItems.push({
                id: match.id,
                name: searched.negocio_normalizado,
                category: match.category,
                categorySlug: match.categorySlug || slug,
                neighborhood: match.neighborhood,
                coverImages: match.coverImages || [],
                isOpenNow: match.isOpenNow,
                hours: match.hours,
                tags: match.tags || [],
                plan: match.plan,
                isVerified: match.isVerified,
                searchCount: searched.vezes_pedido,
                whatsappCategory: searched.categoria,
              });
              break;
            }
          }
        }

        // Se não tiver dados suficientes, usa fallback
        if (mappedItems.length < 4) {
          const fallbackData = mockBusinesses
            .filter(
              (b) =>
                b.categorySlug === "comer-agora" ||
                CATEGORY_KEYWORDS.comida.some((k) =>
                  `${b.name} ${b.category}`.toLowerCase().includes(k),
                ),
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
              searchCount: 0,
              whatsappCategory: "comida",
            }));
          
          setItems(fallbackData);
        } else {
          setItems(mappedItems);
        }
      } catch (e) {
        reportError(e, { scope: "MaisProcuradosBlock" });
        // Fallback em caso de erro
        const fallbackData = mockBusinesses
          .filter((b) => b.categorySlug === "comer-agora")
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
            searchCount: 0,
            whatsappCategory: "comida",
          }));
        setItems(fallbackData);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [mostSearched]);

  if (loading) {
    return (
      <section>
        <SectionHeader
          kicker="O que a cidade busca"
          title="Mais Procurados"
          icon={TrendingUp}
          iconVariant="primary"
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

  if (items.length === 0) return null;

  return (
    <section>
      <SectionHeader
        kicker="O que a cidade busca"
        title="Mais Procurados"
        icon={TrendingUp}
        iconVariant="primary"
        action={{ label: "Ver todos", to: "/painel/mais-buscados" }}
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

              {place.searchCount > 0 && (
                <span className="stamp absolute left-2 top-2 inline-flex items-center gap-1 border-primary/40 bg-card/95 px-2 py-[3px] text-[0.625rem] font-bold text-primary backdrop-blur-sm">
                  <TrendingUp className="h-3 w-3" />
                  {place.searchCount}x
                </span>
              )}

              {place.isOpenNow && (
                <span className="stamp absolute bottom-2 right-2 inline-flex items-center gap-1 border-status-open/40 bg-card/95 px-2 py-[3px] text-[0.625rem] font-bold text-status-open backdrop-blur-sm">
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
