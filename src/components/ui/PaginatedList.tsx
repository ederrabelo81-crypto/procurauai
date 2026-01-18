import { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface PaginatedListProps<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  onLoadMore: () => void;
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  className?: string;
  gridClassName?: string;
  emptyMessage?: string;
  onClearFilters?: () => void;
}

export function PaginatedList<T>({
  items,
  totalCount,
  pageSize,
  currentPage,
  onLoadMore,
  renderItem,
  keyExtractor,
  isLoading = false,
  className,
  gridClassName = 'grid grid-cols-1 gap-3',
  emptyMessage = 'Nenhum resultado encontrado',
  onClearFilters,
}: PaginatedListProps<T>) {
  const displayedCount = Math.min(currentPage * pageSize, totalCount);
  const hasMore = displayedCount < totalCount;

  if (!isLoading && items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-lg font-semibold text-foreground mb-1">{emptyMessage}</p>
        <p className="text-muted-foreground mb-4">Tente buscar por outro termo ou remover filtros</p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Limpar filtros
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Contador */}
      <p className="text-sm text-muted-foreground">
        Mostrando <span className="font-medium text-foreground">{displayedCount}</span> de{' '}
        <span className="font-medium text-foreground">{totalCount}</span> resultados
      </p>

      {/* Grid de itens */}
      <div className={gridClassName}>
        {items.slice(0, displayedCount).map((item, index) => (
          <div key={keyExtractor(item)}>{renderItem(item, index)}</div>
        ))}

        {/* Skeletons durante loading */}
        {isLoading &&
          Array.from({ length: pageSize }).map((_, i) => (
            <Skeleton key={`skeleton-${i}`} className="h-24 w-full rounded-xl" />
          ))}
      </div>

      {/* Botão carregar mais */}
      {hasMore && !isLoading && (
        <div className="flex justify-center pt-2">
          <button
            onClick={onLoadMore}
            className="px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-sm font-medium transition-colors touch-target"
          >
            Carregar mais ({totalCount - displayedCount} restantes)
          </button>
        </div>
      )}
    </div>
  );
}
