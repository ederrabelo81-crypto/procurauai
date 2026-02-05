import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Clock, MapPin, Utensils } from "lucide-react";
import { getBusinessesByCategorySlug, UiBusiness } from "@/services/businesses";
import { businesses as mockBusinesses } from "@/data/mockData";

// Keywords para identificar estabelecimentos de comida
const FOOD_KEYWORDS = [
  "restaurante", "lanchonete", "pizzaria", "hamburguer", "hamburgueria",
  "bar", "cafe", "café", "padaria", "panificadora", "confeitaria",
  "gastro", "sorveteria", "açaí", "acai", "sushi", "japonês", "japones",
  "churrasco", "churrascaria", "espetinho", "marmita", "marmitex",
  "pastelaria", "pastel", "food", "delivery", "fast food", "comida"
];

function isFoodBusiness(name: string, category: string): boolean {
  const text = `${name} ${category}`.toLowerCase();
  return FOOD_KEYWORDS.some(keyword => text.includes(keyword));
}

function getMockFoodBusinesses(): UiBusiness[] {
  return mockBusinesses
    .filter(b => 
      b.categorySlug === "comer-agora" || 
      isFoodBusiness(b.name, b.category)
    )
    .slice(0, 8)
    .map(b => ({
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
          const fallbackData = await getBusinessesByCategorySlug("servicos", 30);
          const foodPlaces = fallbackData.filter(place => 
            isFoodBusiness(place.name, place.category)
          );
          
          // Merge sem duplicatas
          const existingIds = new Set(data.map(d => d.id));
          const newItems = foodPlaces.filter(p => !existingIds.has(p.id));
          data = [...data, ...newItems].slice(0, 8);
        }

        // 3. Fallback final: usa mockData se ainda não tiver dados suficientes
        if (data.length < 2) {
          console.log("ComerAgoraBlock: Usando mockData como fallback");
          data = getMockFoodBusinesses();
        }

        setItems(data);
      } catch (e) {
        console.error("Erro ao carregar dados para Comer Agora:", e);
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
        <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-[200px] bg-card rounded-2xl overflow-hidden animate-pulse">
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
        title="Comer Agora"
        icon={Utensils}
        iconVariant="warning"
        action={{ label: "Ver todos", to: "/categoria/comer-agora" }}
      />

      <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
        {items.map((place) => (
          <Link
            key={place.id}
            to={`/comercio/${place.id}`}
            className="flex-shrink-0 w-[200px] bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all"
          >
            <div className="aspect-[4/3] relative">
              <img
                src={place.coverImages?.[0] || "/placeholder.svg"}
                alt={place.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {place.isOpenNow && (
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-emerald-500 text-emerald-50 text-xs font-medium px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" />
                  Aberto
                </div>
              )}
            </div>

            <div className="p-3">
              <h3 className="font-semibold text-foreground text-sm line-clamp-1 mb-0.5">
                {place.name}
              </h3>

              <p className="text-xs text-muted-foreground mb-1.5 line-clamp-1">
                {place.category}
              </p>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {place.neighborhood}
              </div>

              {place.tags?.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {place.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 bg-muted text-muted-foreground text-[10px] rounded"
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
