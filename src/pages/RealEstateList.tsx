import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Bed, Bath, Car, Maximize, X, ChevronDown } from 'lucide-react';
import { SearchBar } from '@/components/ui/SearchBar';
import { Chip } from '@/components/ui/Chip';
import { realEstate } from '@/data/newListingTypes';
import { filtersByCategory } from '@/data/mockData';
import { 
  createFilterOptions, 
  formatTag, 
  matchesAnyFilter, 
  sortItems,
  SORT_OPTIONS 
} from '@/lib/tags';

export default function RealEstateList() {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  
  const filterOptions = useMemo(
    () => createFilterOptions(filtersByCategory['imoveis'] || []),
    []
  );
  const sortOptions = SORT_OPTIONS['imoveis'] || [];

  const filtered = useMemo(() => {
    let result = realEstate.filter((item) => {
      const matchesQuery = !query || 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.neighborhood.toLowerCase().includes(query.toLowerCase());
      
      const matchesFiltersResult = matchesAnyFilter(item, activeFilters, 'imoveis');
      
      return matchesQuery && matchesFiltersResult;
    });
    
    if (sortKey) {
      result = sortItems(result, sortKey, 'imoveis');
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  const currentSort = sortOptions.find(s => s.key === sortKey);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border safe-top">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-muted touch-target">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold">Imóveis</h1>
              <p className="text-xs text-muted-foreground">Compra e aluguel</p>
            </div>
          </div>
          <SearchBar value={query} onChange={setQuery} placeholder="Buscar imóveis..." />
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {filterOptions.map((filter) => (
              <Chip
                key={filter.key}
                isActive={activeFilters.includes(filter.key)}
                onClick={() => toggleFilter(filter.key)}
              >
                {filter.label}
              </Chip>
            ))}
            {activeFilters.length > 0 && (
              <Chip
                onClick={clearFilters}
                variant="outline"
                className="border-destructive/40 text-destructive hover:border-destructive/60 hover:bg-destructive/5"
              >
                <X className="w-3 h-3 mr-1" /> Limpar
              </Chip>
            )}
          </div>
        </div>
      </header>

      <main className="px-4 py-4">
        {/* Sort & Results */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {filtered.length} de {realEstate.length} imóveis
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
          {filtered.map((item) => (
            <Link
              key={item.id}
              to={`/imoveis/${item.id}`}
              className="block bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all"
            >
              <div className="relative aspect-video">
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                    {formatTag(item.transactionType)}
                  </span>
                  <span className="px-2 py-1 bg-background/90 rounded-full text-xs font-medium">
                    {formatTag(item.propertyType)}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-lg font-bold text-primary mb-2">
                  {item.transactionType === 'alugar' 
                    ? `${formatPrice(item.rentPrice || 0)}/mês`
                    : formatPrice(item.price || 0)
                  }
                  {item.condoFee && item.condoFee > 0 && (
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      + {formatPrice(item.condoFee)} cond.
                    </span>
                  )}
                </p>
                
                {/* Tags - formatted */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-muted rounded-full text-xs text-muted-foreground">
                        {formatTag(tag)}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {item.bedrooms > 0 && (
                    <span className="flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5" />
                      {item.bedrooms}
                    </span>
                  )}
                  {item.bathrooms > 0 && (
                    <span className="flex items-center gap-1">
                      <Bath className="w-3.5 h-3.5" />
                      {item.bathrooms}
                    </span>
                  )}
                  {item.parkingSpots > 0 && (
                    <span className="flex items-center gap-1">
                      <Car className="w-3.5 h-3.5" />
                      {item.parkingSpots}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Maximize className="w-3.5 h-3.5" />
                    {item.areaM2}m²
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {item.neighborhood}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum imóvel encontrado</p>
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
