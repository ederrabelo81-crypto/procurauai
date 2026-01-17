// Category.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Chip } from '@/components/ui/Chip';
import { BusinessCard } from '@/components/cards/BusinessCard';
import { ListingCard } from '@/components/cards/ListingCard';
import { DealCard } from '@/components/cards/DealCard';
import { EventCard } from '@/components/cards/EventCard';
import { NewsCard } from '@/components/cards/NewsCard';
import { ObituaryCard } from '@/components/cards/ObituaryCard';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
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

export default function Category() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const category = categories.find((c) => c.id === categoryId);
  const filters = filtersByCategory[categoryId || ''] || [];

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]));
  };

  const clearFilters = () => setActiveFilters([]);

  const filteredBusinesses = useMemo(() => {
    let filtered = businesses.filter((b) => b.categorySlug === categoryId);

    if (activeFilters.length > 0) {
      filtered = filtered.filter((business) =>
        matchesAllFilters(getBusinessTags(business), activeFilters, {
          hours: business.hours,
          checkOpenNow: true,
        })
      );
    }

    return filtered;
  }, [categoryId, activeFilters]);

  const filteredListings = useMemo(() => {
    if (activeFilters.length === 0) return listings;
    return listings.filter((listing) => matchesListingFilter(listing, activeFilters));
  }, [activeFilters]);

  const filteredDeals = useMemo(() => {
    if (activeFilters.length === 0) return deals;

    const normalizedFilters = activeFilters.map((f) => normalizeText(f));

    return deals.filter((deal) => {
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
  }, [activeFilters]);

  const filteredEvents = useMemo(() => {
    if (activeFilters.length === 0) return events;

    const normalizedFilters = activeFilters.map((f) => normalizeText(f));

    return events.filter((event) => {
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
  }, [activeFilters]);

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
        return (
          <div className="space-y-3">
            {news.map((n) => (
              <NewsCard key={n.id} news={n} />
            ))}
          </div>
        );

      case 'falecimentos': {
        const approvedObituaries = obituaries.filter((o) => o.status === 'approved');
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Nossos sentimentos às famílias enlutadas.
            </p>
            {approvedObituaries.map((obituary) => (
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <CategoryIcon categoryId={category.iconKey} size="sm" />
              <h1 className="text-lg font-bold text-foreground">{category.name}</h1>
            </div>
          </div>
        </div>

        {filters.length > 0 && (
          <div className="pb-3 -mx-4">
            <div className="flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide">
              {filters.map((filter) => (
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
        )}
      </header>

      <main className="px-4 py-4">{renderContent()}</main>
    </div>
  );
}
