import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SearchBar } from '@/components/ui/SearchBar';
import { Chip } from '@/components/ui/Chip';
import { CategoryCard } from '@/components/cards/CategoryCard';
import { BusinessCard } from '@/components/cards/BusinessCard';
import { ListingCard } from '@/components/cards/ListingCard';
import { DealCard } from '@/components/cards/DealCard';
import { EventCard } from '@/components/cards/EventCard';
import { NewsCard } from '@/components/cards/NewsCard';
import { categories, businesses, listings, deals, events, news, filtersByCategory } from '@/data/mockData';

export default function Search() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const allFilters = useMemo(() => {
    const filters = new Set<string>();
    Object.values(filtersByCategory).flat().forEach(f => filters.add(f));
    return Array.from(filters);
  }, []);

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  // Busca simples full-text
  const searchResults = useMemo(() => {
    if (!query.trim()) return null;

    const lowerQuery = query.toLowerCase();
    
    const filteredBusinesses = businesses.filter(b => 
      b.name.toLowerCase().includes(lowerQuery) ||
      b.category.toLowerCase().includes(lowerQuery) ||
      b.neighborhood.toLowerCase().includes(lowerQuery) ||
      b.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );

    const filteredListings = listings.filter(l =>
      l.title.toLowerCase().includes(lowerQuery) ||
      l.neighborhood.toLowerCase().includes(lowerQuery)
    );

    const filteredDeals = deals.filter(d =>
      d.title.toLowerCase().includes(lowerQuery) ||
      d.businessName?.toLowerCase().includes(lowerQuery)
    );

    const filteredEvents = events.filter(e =>
      e.title.toLowerCase().includes(lowerQuery) ||
      e.location.toLowerCase().includes(lowerQuery)
    );

    const filteredNews = news.filter(n =>
      n.title.toLowerCase().includes(lowerQuery) ||
      n.tag.toLowerCase().includes(lowerQuery)
    );

    return {
      businesses: filteredBusinesses,
      listings: filteredListings,
      deals: filteredDeals,
      events: filteredEvents,
      news: filteredNews,
      total: filteredBusinesses.length + filteredListings.length + filteredDeals.length + filteredEvents.length + filteredNews.length
    };
  }, [query]);

  const hasResults = searchResults && searchResults.total > 0;
  const showCategories = !query.trim();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border safe-top">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-foreground">Buscar</h1>
          </div>
          
          <SearchBar 
            value={query}
            onChange={setQuery}
            size="large"
          />
        </div>
        
        {/* Filtros */}
        <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2">
            {allFilters.slice(0, 6).map((filter) => (
              <Chip
                key={filter}
                isActive={activeFilters.includes(filter)}
                onClick={() => toggleFilter(filter)}
                size="sm"
              >
                {filter}
              </Chip>
            ))}
          </div>
        </div>
      </header>

      <main className="px-4 py-4">
        {/* Categorias (quando não há busca) */}
        {showCategories && (
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">Categorias</h2>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  id={category.id}
                  name={category.name}
                  icon={category.icon}
                />
              ))}
            </div>
          </section>
        )}

        {/* Resultados da busca */}
        {query.trim() && !hasResults && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-lg font-semibold text-foreground mb-1">Nenhum resultado</p>
            <p className="text-muted-foreground">Tente buscar por outro termo</p>
          </div>
        )}

        {hasResults && (
          <div className="space-y-6">
            {searchResults.businesses.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-foreground mb-3">
                  Comércios e Serviços ({searchResults.businesses.length})
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {searchResults.businesses.slice(0, 4).map((business) => (
                    <BusinessCard key={business.id} business={business} variant="compact" />
                  ))}
                </div>
              </section>
            )}

            {searchResults.listings.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-foreground mb-3">
                  Classificados ({searchResults.listings.length})
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {searchResults.listings.slice(0, 4).map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </section>
            )}

            {searchResults.deals.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-foreground mb-3">
                  Ofertas ({searchResults.deals.length})
                </h2>
                <div className="space-y-3">
                  {searchResults.deals.slice(0, 3).map((deal) => (
                    <DealCard key={deal.id} deal={deal} variant="compact" />
                  ))}
                </div>
              </section>
            )}

            {searchResults.events.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-foreground mb-3">
                  Eventos ({searchResults.events.length})
                </h2>
                <div className="space-y-3">
                  {searchResults.events.slice(0, 3).map((event) => (
                    <EventCard key={event.id} event={event} variant="compact" />
                  ))}
                </div>
              </section>
            )}

            {searchResults.news.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-foreground mb-3">
                  Notícias ({searchResults.news.length})
                </h2>
                <div className="space-y-3">
                  {searchResults.news.slice(0, 3).map((n) => (
                    <NewsCard key={n.id} news={n} variant="compact" />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
