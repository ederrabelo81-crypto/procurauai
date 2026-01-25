import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  X, 
  Clock, 
  Truck, 
  CreditCard, 
  Dog, 
  Zap, 
  Home as HomeIcon, 
  CheckCircle, 
  Star, 
  Calendar as CalendarIcon,
  Gift,
  Tag as TagIcon
} from 'lucide-react';
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
import { categories, filtersByCategory, Business, Listing, Deal, Event, News } from '@/data/mockData';
import { normalizeText } from '@/lib/tagUtils';
import { useSearch, ContentType } from '@/hooks/useSearch';

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
  const activeFilters = useMemo(() => 
    filtersParam ? filtersParam.split(',').filter(Boolean) : [],
    [filtersParam]
  );

  // Paginação local
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleLoadMore = useCallback(() => {
    setIsLoadingMore(true);
    setCurrentPage((p) => p + 1);
    window.setTimeout(() => setIsLoadingMore(false), 250);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setIsLoadingMore(false);
  }, [activeType, query, filtersParam]);

  // Todos os filtros disponíveis
  const allFilters = useMemo(() => {
    const s = new Set<string>();
    Object.values(filtersByCategory).flat().forEach((f) => s.add(f));
    return Array.from(s);
  }, []);

  // Hook de busca centralizado
  const searchResults = useSearch(query, activeFilters);

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
    },
    [searchParams, setSearchParams]
  );

  // Limpar filtros
  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete('filters');
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  // Limpar tipo (voltar para multi-seção)
  const clearType = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete('type');
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

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
            <h1 className="text-lg font-extrabold text-foreground tracking-tight">
              {isSingleTypeMode ? TYPE_LABELS[activeType] : 'Buscar'}
            </h1>
          </div>

          <SearchBar value={query} onChange={setQuery} placeholder="O que você procura agora?" size="large" />
        </div>

        {/* Filtros */}
        <div className="px-4 pb-3 -mx-4">
          <div className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
            {activeFilters.length > 0 && (
              <Chip
                onClick={clearFilters}
                size="sm"
                variant="outline"
                className="border-destructive/40 text-destructive hover:border-destructive/60 hover:bg-destructive/5 flex-shrink-0"
              >
                <X className="w-3 h-3 mr-1" />
                Limpar
              </Chip>
            )}
            {allFilters.map((filter) => {
              const normalized = normalizeText(filter);
              let Icon = null;
              if (normalized.includes('aberto') || normalized.includes('agora')) Icon = Clock;
              else if (normalized.includes('entrega') || normalized.includes('delivery')) Icon = Truck;
              else if (normalized.includes('cartao') || normalized.includes('cartão')) Icon = CreditCard;
              else if (normalized.includes('pet')) Icon = Dog;
              else if (normalized.includes('24h')) Icon = Zap;
              else if (normalized.includes('domicilio') || normalized.includes('casa')) Icon = HomeIcon;
              else if (normalized.includes('orcamento') || normalized.includes('orçamento')) Icon = CheckCircle;
              else if (normalized.includes('entrada gratuita') || normalized.includes('gratis')) Icon = Star;
              else if (normalized.includes('hoje') || normalized.includes('fim de semana')) Icon = CalendarIcon;
              else if (normalized.includes('doacao') || normalized.includes('doação')) Icon = Gift;
              else if (normalized.includes('oferta') || normalized.includes('promocao')) Icon = TagIcon;

              return (
                <Chip
                  key={filter}
                  isActive={activeFilters.includes(filter)}
                  onClick={() => toggleFilter(filter)}
                  size="sm"
                  className="gap-1.5"
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {filter}
                </Chip>
              );
            })}
          </div>
        </div>
      </header>

      <main className="p-4 space-y-8">
        {/* Categorias (apenas se não houver busca ativa) */}
        {showCategories && (
          <section>
            <SectionHeader title="Categorias" />
            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat) => (
                <CategoryCard key={cat.id} id={cat.id} name={cat.name} iconKey={cat.iconKey} size="sm" />
              ))}
            </div>
          </section>
        )}

        {/* Resultados - Modo Multi-seção */}
        {!isSingleTypeMode && hasActiveSearch && (
          <>
            {totalResults === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Nenhum resultado encontrado para sua busca.</p>
                <button onClick={clearFilters} className="mt-4 text-primary font-medium">
                  Limpar filtros
                </button>
              </div>
            ) : (
              <>
                {/* Comércios */}
                {searchResults.business.length > 0 && (
                  <section>
                    <SectionHeader
                      title="Comércios e Serviços"
                      count={searchResults.business.length}
                      previewLimit={PREVIEW_LIMITS.business}
                      viewAllType="business"
                    />
                    <div className="grid grid-cols-1 gap-4">
                      {searchResults.business.slice(0, PREVIEW_LIMITS.business).map((b) => (
                        <BusinessCard key={b.id} business={b} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Ofertas */}
                {searchResults.deal.length > 0 && (
                  <section>
                    <SectionHeader
                      title="Ofertas"
                      count={searchResults.deal.length}
                      previewLimit={PREVIEW_LIMITS.deal}
                      viewAllType="deal"
                    />
                    <div className="grid grid-cols-1 gap-4">
                      {searchResults.deal.slice(0, PREVIEW_LIMITS.deal).map((d) => (
                        <DealCard key={d.id} deal={d} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Classificados */}
                {searchResults.listing.length > 0 && (
                  <section>
                    <SectionHeader
                      title="Classificados"
                      count={searchResults.listing.length}
                      previewLimit={PREVIEW_LIMITS.listing}
                      viewAllType="listing"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      {searchResults.listing.slice(0, PREVIEW_LIMITS.listing).map((l) => (
                        <ListingCard key={l.id} listing={l} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Eventos */}
                {searchResults.event.length > 0 && (
                  <section>
                    <SectionHeader
                      title="Eventos"
                      count={searchResults.event.length}
                      previewLimit={PREVIEW_LIMITS.event}
                      viewAllType="event"
                    />
                    <div className="grid grid-cols-1 gap-4">
                      {searchResults.event.slice(0, PREVIEW_LIMITS.event).map((e) => (
                        <EventCard key={e.id} event={e} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Notícias */}
                {searchResults.news.length > 0 && (
                  <section>
                    <SectionHeader
                      title="Notícias"
                      count={searchResults.news.length}
                      previewLimit={PREVIEW_LIMITS.news}
                      viewAllType="news"
                    />
                    <div className="grid grid-cols-1 gap-4">
                      {searchResults.news.slice(0, PREVIEW_LIMITS.news).map((n) => (
                        <NewsCard key={n.id} news={n} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </>
        )}

        {/* Resultados - Modo Tipo Único (Paginado) */}
        {isSingleTypeMode && (
          <section>
            <PaginatedList
              items={singleTypeItems}
              totalCount={singleTypeItems.length}
              pageSize={PAGE_SIZE}
              currentPage={currentPage}
              onLoadMore={handleLoadMore}
              isLoading={isLoadingMore}
              keyExtractor={(item: unknown) => (item as { id: string }).id}
              renderItem={(item: unknown) => {
                switch (activeType) {
                  case 'business':
                    return <BusinessCard business={item as Business} />;
                  case 'listing':
                    return <ListingCard listing={item as Listing} />;
                  case 'deal':
                    return <DealCard deal={item as Deal} />;
                  case 'event':
                    return <EventCard event={item as Event} />;
                  case 'news':
                    return <NewsCard news={item as News} />;
                  default:
                    return null;
                }
              }}
              gridClassName={activeType === 'listing' ? 'grid-cols-2 gap-3' : 'grid-cols-1 gap-4'}
              emptyMessage="Nenhum resultado encontrado nesta categoria."
            />
          </section>
        )}
      </main>
    </div>
  );
}
