import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
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
  filtersByCategory 
} from '@/data/mockData';

export default function Category() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const category = categories.find(c => c.id === categoryId);
  const filters = filtersByCategory[categoryId || ''] || [];

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Categoria não encontrada</p>
      </div>
    );
  }

  // Filtra os dados conforme a categoria
  const getFilteredBusinesses = () => {
    let filtered = businesses.filter(b => b.categorySlug === categoryId);
    if (activeFilters.length > 0) {
      filtered = filtered.filter(b => 
        activeFilters.every(filter => b.tags.includes(filter))
      );
    }
    return filtered;
  };

  const getFilteredListings = () => {
    let filtered = listings;
    if (activeFilters.includes('Doação')) {
      filtered = filtered.filter(l => l.type === 'doacao');
    }
    if (activeFilters.includes('Novo') || activeFilters.includes('Usado')) {
      filtered = filtered.filter(l => l.type === 'venda');
    }
    return filtered;
  };

  const renderContent = () => {
    switch (categoryId) {
  case 'comer-agora':
  case 'servicos':
  case 'negocios':
    const filteredBusinesses = getFilteredBusinesses();
        if (filteredBusinesses.length === 0) {
  return (
    <div className="py-12 text-center">
      <div className="text-4xl mb-2">🏪</div>
      <p className="font-semibold">Ainda não temos negócios aqui.</p>
      <p className="text-muted-foreground">Indique um lugar pra gente adicionar.</p>
    </div>
  );
}
    return (
      <div className="grid grid-cols-1 gap-4">
        {filteredBusinesses.map(business => (
          <BusinessCard key={business.id} business={business} />
        ))}
      </div>
    );

      case 'classificados':
        const filteredListings = getFilteredListings();
        return (
          <div>
            {/* Aviso anti-golpe */}
            <details className="mb-4 bg-secondary/20 rounded-xl p-3">
              <summary className="font-medium text-sm text-foreground cursor-pointer">
                ⚠️ Dicas de segurança
              </summary>
              <p className="text-sm text-muted-foreground mt-2">
                Combine encontros em locais públicos. Desconfie de pedidos de adiantamento. Nunca envie dados pessoais antes de conhecer o vendedor.
              </p>
            </details>
            
            <div className="grid grid-cols-2 gap-3">
              {filteredListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        );

      case 'ofertas':
        // Patrocinados primeiro
        const sponsored = deals.filter(d => d.isSponsored);
        const regular = deals.filter(d => !d.isSponsored);
        return (
          <div className="space-y-4">
            {sponsored.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Patrocinados</h3>
                <div className="space-y-3">
                  {sponsored.map(deal => (
                    <DealCard key={deal.id} deal={deal} />
                  ))}
                </div>
              </section>
            )}
            <section>
              <div className="space-y-3">
                {regular.map(deal => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
            </section>
          </div>
        );

      case 'agenda':
        return (
          <div className="space-y-3">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        );

      case 'noticias':
        return (
          <div className="space-y-3">
            {news.map(n => (
              <NewsCard key={n.id} news={n} />
            ))}
          </div>
        );

      case 'falecimentos':
        const approvedObituaries = obituaries.filter(o => o.status === 'approved');
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Nossos sentimentos às famílias enlutadas.
            </p>
            {approvedObituaries.map(obituary => (
              <ObituaryCard key={obituary.id} obituary={obituary} />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
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
        
        {/* Filtros - scroll horizontal estável */}
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

      <main className="px-4 py-4">
        {renderContent()}
      </main>
    </div>
  );
}
