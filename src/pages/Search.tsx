import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { SearchBar } from '@/components/ui/SearchBar';
import { Chip } from '@/components/ui/Chip';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { PaginatedList } from '@/components/ui/PaginatedList';
import { CategoryCard } from '@/components/cards/CategoryCard';
import { BusinessCard } from '@/components/cards/BusinessCard';
import { ListingCard } from '@/components/cards/ListingCard';
import { DealCard } from '@/components/cards/DealCard';
import { EventCard } from '@/components/cards/EventCard';
import { NewsCard } from '@/components/cards/NewsCard';
import { categories, businesses, listings, deals, events, news, filtersByCategory } from '@/data/mockData';
import { matchesAllFilters, normalizeText, matchesListingFilter } from '@/lib/tagUtils';
import { getBusinessTags } from '@/lib/businessTags';

// Tipos de conteúdo suportados
type ContentType = 'business' | 'listing' | 'deal' | 'event' | 'news';

// Limites de preview por seção
const PREVIEW_LIMITS: Record<ContentType, number> = {
  business: 4,
  listing: 4,
  deal: 3,
  event: 3,
  news: 3,
};

const PAGE_SIZE = 12;

// Labels amigáveis
const TYPE_LABELS: Record<ContentType, string> = {
  business: 'Comércios e Serviços',
  listing: 'Classificados',
  deal: 'Ofertas',
  event: 'Eventos',
  news: 'Notícias',
};

export default function Search() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Estado da URL
  const query = searchParams.get('q') || '';
  const activeType = searchParams.get('type') as ContentType | null;
  const filtersParam = searchParams.get('filters') || '';
  const activeFilters = filtersParam ? filtersParam.split(',').filter(Boolean) : [];

  // Paginação local
  const [currentPage, setCurrentPage] = useState(1);

  // Todos os filtros disponíveis
  const allFilters = useMemo(() => {
    const s = new Set<string>();
    Object.values(filtersByCategory).flat().forEach((f) => s.add(f));
    return Array.from(s);
  }, []);

  // Atualiza query na URL
  const setQuery = useCallback(
    (newQuery: string) => {
      const params = new URLSearchParams(searchParams);
      if (newQuery) {
        params.set('q', newQuery);
      } else {
        params.delete('q');
      }
      setSearchParams(params, { replace: true });
      setCurrentPage(1);
    },
    [searchParams, setSearchParams]
  );

  // Toggle filtro na URL
  const toggleFilter = useCallback(
    (filter: string) => {
      const params = new URLSearchParams(searchParams);
      const current = params.get('filters')?.split(',').filter(Boolean) || [];

      let newFilters: string[];
      if (current.includes(filter)) {
        newFilters = current.filter((f) => f !== filter);
      } else {
        newFilters = [...current, filter];
      }

      if (newFilters.length > 0) {
        params.set('filters', newFilters.join(','));
      } else {
        params.delete('filters');
      }

      setSearchParams(params, { replace: true });
      setCurrentPage(1);
    },
    [searchParams, setSearchParams]
  );

  // Limpar filtros
  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete('filters');
    setSearchParams(params, { replace: true });
    setCurrentPage(1);
  }, [searchParams, setSearchParams]);

  // Limpar tipo (voltar para multi-seção)
  const clearType = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete('type');
    setSearchParams(params, { replace: true });
    setCurrentPage(1);
  }, [searchParams, setSearchParams]);

  // Filtragem de dados
  const searchResults = useMemo(() => {
    const hasQuery = !!query.trim();
    const hasFilters = activeFilters.length > 0;
    const lowerQuery = query.toLowerCase().trim();

    // Businesses
    let filteredBusinesses = businesses;
    if (hasQuery) {
      filteredBusinesses = filteredBusinesses.filter((b) => {
        const tagHit = getBusinessTags(b).some((t) => t.toLowerCase().includes(lowerQuery));
        return (
          b.name.toLowerCase().includes(lowerQuery) ||
          b.category.toLowerCase().includes(lowerQuery) ||
          b.neighborhood.toLowerCase().includes(lowerQuery) ||
          tagHit
        );
      });
    }
    if (hasFilters) {
      filteredBusinesses = filteredBusinesses.filter((business) =>
        matchesAllFilters(getBusinessTags(business), activeFilters, { hours: business.hours, checkOpenNow: true })
      );
    }

    // Listings
    let filteredListings = listings;
    if (hasQuery) {
      filteredListings = filteredListings.filter(
        (l) => l.title.toLowerCase().includes(lowerQuery) || l.neighborhood.toLowerCase().includes(lowerQuery)
      );
    }
    if (hasFilters) {
      filteredListings = filteredListings.filter((listing) => matchesListingFilter(listing, activeFilters));
    }

    // Deals
    let filteredDeals = deals;
    if (hasQuery) {
      filteredDeals = filteredDeals.filter(
        (d) => d.title.toLowerCase().includes(lowerQuery) || d.businessName?.toLowerCase().includes(lowerQuery)
      );
    }
    if (hasFilters) {
      const normalizedFilters = activeFilters.map((f) => normalizeText(f));
      filteredDeals = filteredDeals.filter((deal) => {
        if (normalizedFilters.includes('valido hoje')) {
          const today = new Date().toISOString().split('T')[0];
          if (deal.validUntil < today) return false;
        }
        if (normalizedFilters.includes('entrega')) {
          const text = `${deal.title} ${deal.subtitle || ''}`.toLowerCase();
          if (!text.includes('entrega') && !text.includes('delivery')) return false;
        }
        return true;
      });
    }

    // Events
    let filteredEvents = events;
    if (hasQuery) {
      filteredEvents = filteredEvents.filter(
        (e) =>
          e.title.toLowerCase().includes(lowerQuery) ||
          e.location.toLowerCase().includes(lowerQuery) ||
          e.tags.some((t) => t.toLowerCase().includes(lowerQuery))
      );
    }
    if (hasFilters) {
      const normalizedFilters = activeFilters.map((f) => normalizeText(f));
      filteredEvents = filteredEvents.filter((event) => {
        if (normalizedFilters.includes('entrada gratuita')) {
          const price = event.priceText.toLowerCase();
          const ok =
            price.includes('grátis') ||
            price.includes('gratuito') ||
            price.includes('free') ||
            price === 'entrada livre';
          if (!ok) return false;
        }
        if (normalizedFilters.includes('hoje')) {
          const today = new Date().toISOString().split('T')[0];
          if (!event.dateTime.startsWith(today)) return false;
        }
        if (normalizedFilters.includes('fim de semana')) {
          const eventDate = new Date(event.dateTime);
          const day = eventDate.getDay();
          if (day !== 0 && day !== 6) return false;
        }
        const remainingFilters = activeFilters.filter(
          (f) => !['entrada gratuita', 'hoje', 'fim de semana'].includes(normalizeText(f))
        );
        return matchesAllFilters(event.tags, remainingFilters, {});
      });
    }

    // News
    let filteredNews = news;
    if (hasQuery) {
      filteredNews = filteredNews.filter(
        (n) =>
          n.title.toLowerCase().includes(lowerQuery) ||
          n.tag.toLowerCase().includes(lowerQuery) ||
          n.snippet.toLowerCase().includes(lowerQuery)
      );
    }

    return {
      business: filteredBusinesses,
      listing: filteredListings,
      deal: filteredDeals,
      event: filteredEvents,
      news: filteredNews,
    };
  }, [query, activeFilters]);

  const totalResults =
    searchResults.business.length +
    searchResults.listing.length +
    searchResults.deal.length +
    searchResults.event.length +
    searchResults.news.length;

  const hasActiveSearch = query.trim() || activeFilters.length > 0;
  const showCategories = !hasActiveSearch && !activeType;

  // Modo tipo único (paginado)
  const isSingleTypeMode = !!activeType;
  const singleTypeItems = activeType ? searchResults[activeType] : [];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border safe-top">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => (isSingleTypeMode ? clearType() : navigate(-1))}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors flex-shrink-0"
              aria-label={isSingleTypeMode ? 'Voltar para busca' : 'Voltar'}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-foreground">
              {isSingleTypeMode ? TYPE_LABELS[activeType] : 'Buscar'}
            </h1>
          </div>

          <SearchBar value={query} onChange={setQuery} placeholder="O que você procura agora?" size="large" />
        </div>

        {/* Filtros */}
        <div className="px-4 pb-3 -mx-4">
          <div className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
            {activeFilters.length > 0 && (
              <Chip onClick={clearFilters} size="sm" className="bg-destructive/10 text-destructive flex-shrink-0">
                <X className="w-3 h-3 mr-1" />
                Limpar
              </Chip>
            )}
            {allFilters.map((filter) => (
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
        {/* Categorias (estado inicial) */}
        {showCategories && (
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">Categorias</h2>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <CategoryCard key={category.id} id={category.id} name={category.name} iconKey={category.iconKey} size="sm" />
              ))}
            </div>
          </section>
        )}

        {/* Modo tipo único - Paginado */}
        {isSingleTypeMode && (
          <PaginatedList
            items={singleTypeItems}
            totalCount={singleTypeItems.length}
            pageSize={PAGE_SIZE}
            currentPage={currentPage}
            onLoadMore={() => setCurrentPage((p) => p + 1)}
            onClearFilters={activeFilters.length > 0 ? clearFilters : undefined}
            keyExtractor={(item: any) => item.id}
            gridClassName={activeType === 'listing' ? 'grid grid-cols-2 sm:grid-cols-3 gap-3' : 'grid grid-cols-1 gap-3'}
            renderItem={(item: any) => {
              switch (activeType) {
                case 'business':
                  return <BusinessCard business={item} variant="compact" />;
                case 'listing':
                  return <ListingCard listing={item} />;
                case 'deal':
                  return <DealCard deal={item} variant="compact" />;
                case 'event':
                  return <EventCard event={item} variant="compact" />;
                case 'news':
                  return <NewsCard news={item} variant="compact" />;
                default:
                  return null;
              }
            }}
          />
        )}

        {/* Modo multi-seção - Preview */}
        {!isSingleTypeMode && hasActiveSearch && totalResults === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-lg font-semibold text-foreground mb-1">Nenhum resultado</p>
            <p className="text-muted-foreground mb-4">Tente buscar por outro termo ou remover filtros</p>
            {activeFilters.length > 0 && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}

        {!isSingleTypeMode && hasActiveSearch && totalResults > 0 && (
          <div className="space-y-6">
            {/* Businesses */}
            {searchResults.business.length > 0 && (
              <section>
                <SectionHeader
                  title="Comércios e Serviços"
                  count={searchResults.business.length}
                  previewLimit={PREVIEW_LIMITS.business}
                  viewAllType="business"
                />
                <div className="grid grid-cols-1 gap-3">
                  {searchResults.business.slice(0, PREVIEW_LIMITS.business).map((business) => (
                    <BusinessCard key={business.id} business={business} variant="compact" />
                  ))}
                </div>
              </section>
            )}

            {/* Listings */}
            {searchResults.listing.length > 0 && (
              <section>
                <SectionHeader
                  title="Classificados"
                  count={searchResults.listing.length}
                  previewLimit={PREVIEW_LIMITS.listing}
                  viewAllType="listing"
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {searchResults.listing.slice(0, PREVIEW_LIMITS.listing).map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </section>
            )}

            {/* Deals */}
            {searchResults.deal.length > 0 && (
              <section>
                <SectionHeader
                  title="Ofertas"
                  count={searchResults.deal.length}
                  previewLimit={PREVIEW_LIMITS.deal}
                  viewAllType="deal"
                />
                <div className="space-y-3">
                  {searchResults.deal.slice(0, PREVIEW_LIMITS.deal).map((deal) => (
                    <DealCard key={deal.id} deal={deal} variant="compact" />
                  ))}
                </div>
              </section>
            )}

            {/* Events */}
            {searchResults.event.length > 0 && (
              <section>
                <SectionHeader
                  title="Eventos"
                  count={searchResults.event.length}
                  previewLimit={PREVIEW_LIMITS.event}
                  viewAllType="event"
                />
                <div className="space-y-3">
                  {searchResults.event.slice(0, PREVIEW_LIMITS.event).map((event) => (
                    <EventCard key={event.id} event={event} variant="compact" />
                  ))}
                </div>
              </section>
            )}

            {/* News */}
            {searchResults.news.length > 0 && (
              <section>
                <SectionHeader
                  title="Notícias"
                  count={searchResults.news.length}
                  previewLimit={PREVIEW_LIMITS.news}
                  viewAllType="news"
                />
                <div className="space-y-3">
                  {searchResults.news.slice(0, PREVIEW_LIMITS.news).map((n) => (
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
