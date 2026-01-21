// Category.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Clock, Tag, MapPin, Zap, Star } from 'lucide-react';
import { useState, useMemo } from 'react';
import { TagChip } from '@/components/ui/TagChip';
import { SearchBar } from '@/components/ui/SearchBar';
import { BusinessCard } from '@/components/cards/BusinessCard';
import { ListingCard } from '@/components/cards/ListingCard';
import { DealCard } from '@/components/cards/DealCard';
import { EventCard } from '@/components/cards/EventCard';
import { NewsCard } from '@/components/cards/NewsCard';
import { ObituaryCard } from '@/components/cards/ObituaryCard';
import { GlassCategoryIcon } from '@/components/ui/GlassCategoryIcon';
import {
  categories,
  businesses,
  listings,
  deals,
  events,
  news,
  obituaries,
  filtersByCategory,
} from '@/data/mockData';
import { matchesAllFilters, matchesListingFilter, normalizeText } from '@/lib/tagUtils';
import { getBusinessTags } from '@/lib/businessTags';
import type { LucideIcon } from 'lucide-react';

// Icon mapping for filter chips
const FILTER_ICONS: Record<string, LucideIcon> = {
  'aberto agora': Clock,
  'delivery': Tag,
  'oferta': Tag,
  'ofertas': Tag,
  'perto de mim': MapPin,
  'urgente': Zap,
  'destaque': Star,
};

function getFilterIcon(filter: string): LucideIcon | undefined {
  const normalized = filter.toLowerCase().trim();
  for (const [key, icon] of Object.entries(FILTER_ICONS)) {
    if (normalized.includes(key)) return icon;
  }
  return undefined;
}

// Placeholder dinâmico por categoria
const searchPlaceholders: Record<string, string> = {
  'comer-agora': 'Buscar restaurantes...',
  negocios: 'Buscar negócios...',
  servicos: 'Buscar serviços...',
  classificados: 'Buscar classificados...',
  ofertas: 'Buscar ofertas...',
  agenda: 'Buscar eventos...',
  noticias: 'Buscar notícias...',
  falecimentos: 'Buscar...',
};

export default function Category() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [query, setQuery] = useState('');

  const category = categories.find((c) => c.id === categoryId);
  const filters = filtersByCategory[categoryId || ''] || [];
  const placeholder = searchPlaceholders[categoryId || ''] || 'Buscar...';

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]));
  };

  const clearFilters = () => {
    setActiveFilters([]);
    setQuery('');
  };

  const filteredBusinesses = useMemo(() => {
    let filtered = businesses.filter((b) => b.categorySlug === categoryId);

    // Filtro por busca
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter((b) => 
        b.name.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.neighborhood.toLowerCase().includes(q)
      );
    }

    if (activeFilters.length > 0) {
      filtered = filtered.filter((business) =>
        matchesAllFilters(getBusinessTags(business), activeFilters, {
          hours: business.hours,
          checkOpenNow: true,
        })
      );
    }

    return filtered;
  }, [categoryId, activeFilters, query]);

  const filteredListings = useMemo(() => {
    let filtered = listings;
    
    // Filtro por busca
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter((l) => 
        l.title.toLowerCase().includes(q) ||
        l.neighborhood.toLowerCase().includes(q)
      );
    }
    
    if (activeFilters.length > 0) {
      filtered = filtered.filter((listing) => matchesListingFilter(listing, activeFilters));
    }
    
    return filtered;
  }, [activeFilters, query]);

  const filteredDeals = useMemo(() => {
    let filtered = deals;
    
    // Filtro por busca
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter((d) => 
        d.title.toLowerCase().includes(q) ||
        (d.subtitle?.toLowerCase().includes(q)) ||
        (d.businessName?.toLowerCase().includes(q))
      );
    }

    if (activeFilters.length > 0) {
      const normalizedFilters = activeFilters.map((f) => normalizeText(f));

      filtered = filtered.filter((deal) => {
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
    
    return filtered;
  }, [activeFilters, query]);

  const filteredEvents = useMemo(() => {
    let filtered = events;
    
    // Filtro por busca
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter((e) => 
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
      );
    }

    if (activeFilters.length > 0) {
      const normalizedFilters = activeFilters.map((f) => normalizeText(f));

      filtered = filtered.filter((event) => {
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

        // Mantém só os filtros que não são "regras especiais"
        const remainingFilters = activeFilters.filter((f) =>
          !['entrada gratuita', 'hoje', 'fim de semana'].includes(normalizeText(f))
        );

        return matchesAllFilters(event.tags, remainingFilters, {});
      });
    }
    
    return filtered;
  }, [activeFilters, query]);
  
  // Filtro de notícias por busca
  const filteredNews = useMemo(() => {
    if (!query) return news;
    const q = query.toLowerCase();
    return news.filter((n) => 
      n.title.toLowerCase().includes(q) ||
      n.snippet.toLowerCase().includes(q)
    );
  }, [query]);
  
  // Filtro de obituários por busca
  const filteredObituaries = useMemo(() => {
    const approved = obituaries.filter((o) => o.status === 'approved');
    if (!query) return approved;
    const q = query.toLowerCase();
    return approved.filter((o) => 
      o.name.toLowerCase().includes(q) ||
      o.wakeLocation.toLowerCase().includes(q) ||
      o.burialLocation.toLowerCase().includes(q)
    );
  }, [query]);

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Categoria não encontrada</p>
      </div>
    );
  }

  const EmptyState = ({ message, subMessage }: { message: string; subMessage: string }) => (
    <div className="py-12 text-center">
      <div className="text-4xl mb-3">🔍</div>
      <p className="font-semibold text-foreground mb-1">{message}</p>
      <p className="text-muted-foreground text-sm mb-4">{subMessage}</p>
      {activeFilters.length > 0 && (
        <button
          onClick={clearFilters}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );

  const renderContent = () => {
    switch (categoryId) {
      case 'comer-agora':
      case 'servicos':
      case 'negocios': {
        if (filteredBusinesses.length === 0) {
          return activeFilters.length > 0 ? (
            <EmptyState
              message="Nada encontrado com esses filtros"
              subMessage="Tente remover algum filtro ou limpar todos"
            />
          ) : (
            <div className="py-12 text-center">
              <div className="text-4xl mb-2">🏪</div>
              <p className="font-semibold">Ainda não temos negócios aqui.</p>
              <p className="text-muted-foreground">Indique um lugar pra gente adicionar.</p>
            </div>
          );
        }

        return (
          <div className="grid grid-cols-1 gap-4">
            {filteredBusinesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        );
      }

      case 'classificados':
        return (
          <div>
            <details className="mb-4 bg-secondary/20 rounded-xl p-3">
              <summary className="font-medium text-sm text-foreground cursor-pointer">
                ⚠️ Dicas de segurança
              </summary>
              <p className="text-sm text-muted-foreground mt-2">
                Combine encontros em locais públicos. Desconfie de pedidos de adiantamento. Nunca envie dados
                pessoais antes de conhecer o vendedor.
              </p>
            </details>

            {filteredListings.length === 0 ? (
              <EmptyState message="Nada encontrado com esses filtros" subMessage="Tente remover algum filtro" />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        );

      case 'ofertas': {
        const sponsored = filteredDeals.filter((d) => d.isSponsored);
        const regular = filteredDeals.filter((d) => !d.isSponsored);

        if (filteredDeals.length === 0) {
          return <EmptyState message="Nenhuma oferta encontrada" subMessage="Tente outros filtros" />;
        }

        return (
          <div className="space-y-4">
            {sponsored.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Patrocinados</h3>
                <div className="space-y-3">
                  {sponsored.map((deal) => (
                    <DealCard key={deal.id} deal={deal} />
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="space-y-3">
                {regular.map((deal) => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
            </section>
          </div>
        );
      }

      case 'agenda':
        if (filteredEvents.length === 0) {
          return <EmptyState message="Nenhum evento encontrado" subMessage="Tente outros filtros" />;
        }
        return (
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        );

      case 'noticias':
        if (filteredNews.length === 0) {
          return <EmptyState message="Nenhuma notícia encontrada" subMessage="Tente outra busca" />;
        }
        return (
          <div className="space-y-3">
            {filteredNews.map((n) => (
              <NewsCard key={n.id} news={n} />
            ))}
          </div>
        );

      case 'falecimentos': {
        if (filteredObituaries.length === 0) {
          return <EmptyState message="Nenhum resultado encontrado" subMessage="Tente outra busca" />;
        }
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Nossos sentimentos às famílias enlutadas.
            </p>
            {filteredObituaries.map((obituary) => (
              <ObituaryCard key={obituary.id} obituary={obituary} />
            ))}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border safe-top">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors touch-target"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <GlassCategoryIcon categoryId={category.iconKey} size="xs" />
              <h1 className="text-lg font-bold text-foreground">{category.name}</h1>
            </div>
          </div>
          
          {/* Barra de busca */}
          <SearchBar 
            value={query} 
            onChange={setQuery} 
            placeholder={placeholder} 
          />

          {/* Chips de filtro - unified TagChip with icons */}
          {filters.length > 0 && (
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
              {filters.map((filter) => (
                <TagChip
                  key={filter}
                  icon={getFilterIcon(filter)}
                  isActive={activeFilters.includes(filter)}
                  onClick={() => toggleFilter(filter)}
                  size="sm"
                  variant="filter"
                >
                  {filter}
                </TagChip>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="px-4 py-4">{renderContent()}</main>
    </div>
  );
}
