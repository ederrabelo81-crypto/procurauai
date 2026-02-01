
import { useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useCategoryBusinesses } from '@/hooks/useCategoryBusinesses';
import { ListingTypeHeader } from '@/components/common/ListingTypeHeader';
import { BusinessCard } from '@/components/cards/BusinessCard';
import { TagChip } from '@/components/ui/TagChip';
import { categories, filtersByCategory } from '@/data/mockData';
import { X, Clock, Tag, MapPin, Zap, Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { resolveListingTypeId } from '@/lib/taxonomy';

// --- Helpers e Constantes (mantidos do arquivo original) ---
const FILTER_ICONS: Record<string, LucideIcon> = { 'aberto agora': Clock, 'delivery': Tag, 'oferta': Tag, 'ofertas': Tag, 'perto de mim': MapPin, 'urgente': Zap, 'destaque': Star };
function getFilterIcon(filter: string): LucideIcon | undefined { const normalized = filter.toLowerCase().trim(); for (const [key, icon] of Object.entries(FILTER_ICONS)) { if (normalized.includes(key)) return icon; } return undefined; }
const searchPlaceholders: Record<string, string> = { 'comer-agora': 'Buscar em restaurantes...', negocios: 'Buscar em negócios...', servicos: 'Buscar em serviços...', default: 'Buscar nesta categoria...' };
const categorySubtitles: Record<string, string> = { 'comer-agora': 'Restaurantes e lanchonetes', negocios: 'Lojas e estabelecimentos', servicos: 'Profissionais e prestadores', default: 'Itens nesta categoria' };

// --- Componente de Esqueleto para Loading ---
function BusinessCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3 p-1">
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

// --- Componente de Página Principal ---
export default function Category() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const normalizedCategoryId = useMemo(
    () => (categoryId ? resolveListingTypeId(categoryId) : undefined),
    [categoryId]
  );

  // A fonte da verdade agora é o hook centralizado por categoria
  const { businesses: filteredBusinesses, isLoading } = useCategoryBusinesses({
    query,
    activeFilters,
    categorySlug: normalizedCategoryId,
  });

  // Informações da categoria (buscadas do mockData estático)
  const category = useMemo(
    () => categories.find((c) => c.id === normalizedCategoryId),
    [normalizedCategoryId]
  );
  const filtersForCategory = useMemo(
    () => filtersByCategory[normalizedCategoryId || ''] || [],
    [normalizedCategoryId]
  );

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Categoria não encontrada</p>
      </div>
    );
  }

  const toggleFilter = (filter: string) => setActiveFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]));
  const clearFilters = () => { setActiveFilters([]); setQuery(''); };

  // --- Estados da UI ---
  const showEmptyState = !isLoading && filteredBusinesses.length === 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header (reutilizado e controlado pelo estado local) */}
      <ListingTypeHeader
        title={category.name}
        subtitle={categorySubtitles[normalizedCategoryId || 'default']}
        iconKey={category.iconKey}
        searchPlaceholder={searchPlaceholders[normalizedCategoryId || 'default']}
        searchValue={query}
        onSearchChange={setQuery}
        backTo="back"
      >
        {filtersForCategory.length > 0 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {activeFilters.length > 0 && <TagChip onClick={clearFilters} icon={X} size="sm" variant="filter" className="border-destructive/40 text-destructive">Limpar</TagChip>}
            {filtersForCategory.map((filter) => <TagChip key={filter} icon={getFilterIcon(filter)} isActive={activeFilters.includes(filter)} onClick={() => toggleFilter(filter)} size="sm" variant="filter">{filter}</TagChip>)}
          </div>
        )}
      </ListingTypeHeader>

      {/* Conteúdo Principal (controlado por isLoading) */}
      <main className="px-4 py-4">
        {isLoading && (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(5)].map((_, i) => <BusinessCardSkeleton key={i} />)}
          </div>
        )}

        {!isLoading && !showEmptyState && (
          <div className="grid grid-cols-1 gap-4">
            {filteredBusinesses.map((business) => <BusinessCard key={business.id} business={business} />)}
          </div>
        )}

        {showEmptyState && (
          <div className="py-12 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-semibold text-foreground mb-1">Nenhum negócio encontrado</p>
            <p className="text-muted-foreground text-sm mb-4">Tente ajustar sua busca ou remover filtros.</p>
            {(activeFilters.length > 0 || query) && 
                <button onClick={clearFilters} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                    Limpar busca e filtros
                </button>}
          </div>
        )}
      </main>
    </div>
  );
}
