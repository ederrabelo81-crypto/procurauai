import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Clock, MapPin, Utensils } from "lucide-react";
import { getBusinessesByCategorySlug, UiBusiness } from "@/services/businesses";

export function ComerAgoraBlock() {
  const [items, setItems] = useState<UiBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getBusinessesByCategorySlug("comer-agora", 8);

        /**
         * IMPORTANTE:
         * No mock, você filtrava "abertos agora". No banco, isso depende de is_open_now.
         * Como seus dados seed provavelmente NÃO têm is_open_now calculado, pode vir tudo false.
         * Então aqui a gente NÃO filtra por aberto (senão some tudo).
         * Mais pra frente, quando você tiver horários reais, a gente ativa o filtro.
         */
        setItems(data);
      } catch (e) {
        console.error(e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Enquanto carrega, pode esconder ou mostrar placeholder.
  // Vou deixar escondido para não "poluir" a Home.
  if (loading) return null;

  // Se não há nenhum, não renderiza
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

              {/* Se o banco informar que está aberto, mostra a badge */}
              {place.isOpenNow && (
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
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

              {/* Tags ainda não estão conectadas no banco (chips). Mantive compatível. */}
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
