import { Link } from 'react-router-dom';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { places } from '@/data/newListingTypes';
import { MapPin, Star } from 'lucide-react';

// Formata tags em snake_case para exibição humanizada
function formatTag(tag: string): string {
  return tag
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function LugaresBlock() {
  const featuredPlaces = places.slice(0, 8);

  // Se não há lugares, não renderiza o bloco
  if (featuredPlaces.length === 0) {
    return null;
  }

  return (
    <section>
      <SectionHeader
        title="📍 Lugares para Conhecer"
        action={{ label: 'Ver todos', to: '/lugares' }}
      />

      <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
        {featuredPlaces.map((place) => (
          <Link
            key={place.id}
            to={`/lugares/${place.slug}`}
            className="flex-shrink-0 w-[200px] bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all"
          >
            <div className="aspect-[4/3] relative">
              <img
                src={place.coverImage}
                alt={place.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {place.rating}
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-foreground text-sm line-clamp-1 mb-0.5">
                {place.name}
              </h3>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                {place.shortDescription}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
                <MapPin className="w-3 h-3" />
                {place.neighborhood}
              </div>
              {/* Tags leves - máx 2 */}
              {place.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {place.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 bg-muted text-muted-foreground text-[10px] rounded"
                    >
                      {formatTag(tag)}
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
