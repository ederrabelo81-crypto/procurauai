import { Link } from 'react-router-dom';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { businesses } from '@/data/mockData';
import { isOpenNow } from '@/lib/tagUtils';
import { Clock, MapPin, Utensils } from 'lucide-react';

export function ComerAgoraBlock() {
  // Apenas listings do tipo "comer-agora" que estão ABERTOS agora
  const openFoodPlaces = businesses
    .filter((b) => b.categorySlug === 'comer-agora')
    .filter((b) => {
      const open = isOpenNow(b.hours);
      return open === true; // Apenas os que estão abertos
    })
    .slice(0, 8);

  // Se não há nenhum aberto, não renderiza o bloco
  if (openFoodPlaces.length === 0) {
    return null;
  }

  return (
    <section>
      <SectionHeader
        title="Comer Agora"
        icon={Utensils}
        iconVariant="warning"
        action={{ label: 'Ver todos', to: '/categoria/comer-agora' }}
      />

      <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
        {openFoodPlaces.map((place) => (
          <Link
            key={place.id}
            to={`/comercio/${place.id}`}
            className="flex-shrink-0 w-[200px] bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all"
          >
            <div className="aspect-[4/3] relative">
              <img
                src={place.coverImages[0]}
                alt={place.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3" />
                Aberto
              </div>
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
              {place.tags.length > 0 && (
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
