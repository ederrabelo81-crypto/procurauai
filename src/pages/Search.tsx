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
import { categories, filtersByCategory } from '@/data/mockData'; // Mantemos para filtros e categorias estáticas
import { normalizeText } from '@/lib/tagUtils';
import { useSearch, ContentType } from '@/hooks/useSearch';
import { type Business } from '@/lib/dataNormalization';
import { type Listing, type Deal, type Event, type News } from '@/data/mockData'; // Tipos para renderização
import { Skeleton } from '@/components/ui/skeleton'; // Importa o componente Skeleton

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

// Componente de Loading (esqueleto) para um BusinessCard
function BusinessCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[125px] w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}

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

  // Paginação local (simplificada, pois o hook principal lida com o carregamento inicial)
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeType, query, filtersParam]);

  // Todos os filtros disponíveis
  const allFilters = useMemo(() => {
    const s = new Set<string>();
    Object.values(filtersByCategory).flat().forEach((f) => s.add(f));
    return Array.from(s);
  }, []);

  // Hook de busca centralizado agora retorna `isLoading`
  const { isLoading, ...searchResults } = useSearch(query, activeFilters);

  const setQuery = useCallback(
    (newQuery: string) => {
      const params = new URLSearchParams(searchParams);
      if (newQuery) params.set('q', newQuery); else params.delete('q');
      setSearchParams(params, { replace: true });
    }, [searchParams, setSearchParams]);

  const toggleFilter = useCallback(
    (filter: string) => {
      const params = new URLSearchParams(searchParams);
      const current = params.get('filters')?.split(',').filter(Boolean) || [];
      const newFilters = current.includes(filter) ? current.filter((f) => f !== filter) : [...current, filter];
      if (newFilters.length) params.set('filters', newFilters.join(',')); else params.delete('filters');
      setSearchParams(params, { replace: true });
    }, [searchParams, setSearchParams]);

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete('filters');
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

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
  const isSingleTypeMode = !!activeType;
  const singleTypeItems = activeType ? searchResults[activeType] : [];

  // CONTEÚDO PRINCIPAL: Loading, Vazio, ou Resultados
  const MainContent = () => {
    if (isLoading && !hasActiveSearch && !isSingleTypeMode) {
        // Não mostrar loading na tela inicial de categorias
        return null;
    }
    
    if (isLoading) {
      // Estado de Carregamento: mostra esqueletos
      return (
        <div className="space-y-8">
          <section>
            <SectionHeader title={isSingleTypeMode ? TYPE_LABELS[activeType] : "Comércios e Serviços"} />
            <div className="grid grid-cols-1 gap-4">
              {[...Array(3)].map((_, i) => <BusinessCardSkeleton key={i} />)}
            </div>
          </section>
        </div>
      );
    }

    if (!isLoading && hasActiveSearch && totalResults === 0) {
      // Estado Vazio
      return (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Nenhum resultado encontrado para sua busca.</p>
          <button onClick={clearFilters} className="mt-4 text-primary font-medium">Limpar filtros</button>
        </div>
      );
    }

    // Estado com Resultados
    return (
      <>
        {/* Resultados - Modo Multi-seção */}
        {!isSingleTypeMode && hasActiveSearch && (
           <>
            {searchResults.business.length > 0 && (
              <section>
                <SectionHeader
                  title="Comércios e Serviços"
                  count={searchResults.business.length}
                  previewLimit={PREVIEW_LIMITS.business}
                  viewAllType="business"
                />
                <div className="grid grid-cols-1 gap-4">
                  {searchResults.business.slice(0, PREVIEW_LIMITS.business).map((b: Business) => (
                    <BusinessCard key={b.id} business={b} />
                  ))}
                </div>
              </section>
            )}
            {/* Outras seções de resultados (deals, listings, etc.) foram omitidas por brevidade */}
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
              onLoadMore={() => setCurrentPage(p => p + 1)} // Simplificado
              isLoading={false} // A paginação local não tem loading complexo
              keyExtractor={(item: any) => item.id}
              renderItem={(item: any) => {
                if (activeType === 'business') return <BusinessCard business={item as Business} />;
                // Outros tipos de card omitidos por brevidade
                return null;
              }}
              gridClassName={activeType === 'listing' ? 'grid-cols-2 gap-3' : 'grid-cols-1 gap-4'}
              emptyMessage="Nenhum resultado encontrado nesta categoria."
            />
          </section>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border safe-top">
        {/* O header (barra de busca, filtros) permanece o mesmo */}
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
        <div className="px-4 pb-3 -mx-4">
          <div className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
             {/* A lógica dos filtros permanece a mesma */}
             {allFilters.map((filter) => <Chip key={filter} isActive={activeFilters.includes(filter)} onClick={() => toggleFilter(filter)}>{filter}</Chip>)}
          </div>
        </div>
      </header>

      <main className="p-4">
        {/* Seção de Categorias (mostrada apenas na tela inicial) */}
        {showCategories && (
            <section className="pb-8">
                <SectionHeader title="Categorias" />
                <div className="grid grid-cols-4 gap-2">
                    {categories.map((cat) => (
                        <CategoryCard key={cat.id} id={cat.id} name={cat.name} iconKey={cat.iconKey} size="sm" />
                    ))}
                </div>
            </section>
        )}

        {/* Renderiza o conteúdo principal (Loading, Vazio ou Resultados) */}
        <MainContent />
      </main>
    </div>
  );
}
