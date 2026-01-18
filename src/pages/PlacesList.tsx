import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Clock } from 'lucide-react';
import { SearchBar } from '@/components/ui/SearchBar';
import { Chip } from '@/components/ui/Chip';
import { places } from '@/data/newListingTypes';
import { filtersByCategory } from '@/data/mockData';

export default function PlacesList() {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const filters = filtersByCategory['lugares'] || [];

  const filtered = useMemo(() => {
    return places.filter((place) => {
      const matchesQuery = !query || 
        place.name.toLowerCase().includes(query.toLowerCase()) ||
        place.shortDescription.toLowerCase().includes(query.toLowerCase());
      
      const matchesFilters = activeFilters.length === 0 ||
        activeFilters.some(f => place.tags.some(t => t.toLowerCase().includes(f.toLowerCase())));
      
      return matchesQuery && matchesFilters;
    });
  }, [query, activeFilters]);

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border safe-top">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-muted touch-target">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold">Lugares</h1>
              <p className="text-xs text-muted-foreground">Destinos turísticos da cidade</p>
            </div>
          </div>
          <SearchBar value={query} onChange={setQuery} placeholder="Buscar lugares..." />
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {filters.map((filter) => (
              <Chip
                key={filter}
                label={filter}
                active={activeFilters.includes(filter)}
                onClick={() => toggleFilter(filter)}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="px-4 py-4">
        <p className="text-sm text-muted-foreground mb-4">
          {filtered.length} {filtered.length === 1 ? 'lugar encontrado' : 'lugares encontrados'}
        </p>

        <div className="space-y-4">
          {filtered.map((place) => (
            <Link
              key={place.id}
              to={`/lugares/${place.slug}`}
              className="block bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all"
            >
              <div className="relative aspect-video">
                <img
                  src={place.coverImage}
                  alt={place.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="px-2 py-1 bg-background/90 rounded-full text-xs font-medium">
                    {place.typeTag}
                  </span>
                  <span className="px-2 py-1 bg-background/90 rounded-full text-xs font-medium">
                    {place.priceLevel}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground mb-1">{place.name}</h3>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{place.shortDescription}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    {place.rating} ({place.reviewsCount})
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {place.neighborhood}
                  </span>
                  {place.durationSuggestion && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {place.durationSuggestion}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum lugar encontrado</p>
          </div>
        )}
      </main>
    </div>
  );
}
