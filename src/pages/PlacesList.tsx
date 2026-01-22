import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Clock, X, ChevronDown } from 'lucide-react';
import { ListingTypeHeader } from '@/components/common/ListingTypeHeader';
import { TagChip } from '@/components/ui/TagChip';
import { places } from '@/data/newListingTypes';
import { filtersByCategory } from '@/data/mockData';
import { 
  createFilterOptions, 
  formatTag, 
  matchesAnyFilter, 
  sortItems,
  SORT_OPTIONS 
} from '@/lib/tags';

export default function PlacesList() {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  
  const filterOptions = useMemo(
    () => createFilterOptions(filtersByCategory['lugares'] || []),
    []
  );
  const sortOptions = SORT_OPTIONS['lugares'] || [];

  const filtered = useMemo(() => {
    let result = places.filter((place) => {
      const matchesQuery = !query || 
        place.name.toLowerCase().includes(query.toLowerCase()) ||
        place.shortDescription.toLowerCase().includes(query.toLowerCase());
      
      const matchesFiltersResult = matchesAnyFilter(place, activeFilters, 'lugares');
      
      return matchesQuery && matchesFiltersResult;
    });
    
    if (sortKey) {
      result = sortItems(result, sortKey, 'lugares');
    }
    
    return result;
  }, [query, activeFilters, sortKey]);

  const toggleFilter = (filterKey: string) => {
    setActiveFilters(prev => 
      prev.includes(filterKey) ? prev.filter(f => f !== filterKey) : [...prev, filterKey]
    );
  };

  const clearFilters = () => {
    setActiveFilters([]);
    setSortKey('');
  };

  const currentSort = sortOptions.find(s => s.key === sortKey);

  return (
    <div className="min-h-screen bg-background pb-24">
      <ListingTypeHeader
        title="Lugares"
        subtitle="Destinos turísticos da cidade"
        iconKey="lugares"
        searchPlaceholder="Buscar lugares..."
        searchValue={query}
        onSearchChange={setQuery}
      >
        {filterOptions.length > 0 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {activeFilters.length > 0 && (
              <TagChip
                onClick={clearFilters}
                icon={X}
                size="sm"
                variant="filter"
                className="border-destructive/40 text-destructive"
              >
                Limpar
              </TagChip>
            )}
            {filterOptions.map((filter) => (
              <TagChip
                key={filter.key}
                isActive={activeFilters.includes(filter.key)}
                onClick={() => toggleFilter(filter.key)}
                size="sm"
                variant="filter"
              >
                {filter.label}
              </TagChip>
            ))}
          </div>
        )}
      </ListingTypeHeader>

      <main className="px-4 py-4">
        {/* Sort & Results */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {filtered.length} de {places.length} lugares
          </p>
          
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              {currentSort?.label || 'Ordenar'} <ChevronDown className="w-4 h-4" />
            </button>
            {showSortMenu && (
              <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-50 min-w-[150px]">
                {sortOptions.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => { setSortKey(opt.key); setShowSortMenu(false); }}
                    className={`block w-full text-left px-3 py-2 text-sm hover:bg-muted ${sortKey === opt.key ? 'text-primary' : ''}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>


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
                
                {/* Tags - formatted */}
                {place.tags && place.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {place.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-muted rounded-full text-xs text-muted-foreground">
                        {formatTag(tag)}
                      </span>
                    ))}
                  </div>
                )}
                
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
            {activeFilters.length > 0 && (
              <button onClick={clearFilters} className="text-primary text-sm mt-2 hover:underline">
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
