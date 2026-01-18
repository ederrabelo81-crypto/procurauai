import { ChevronRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  count?: number;
  /** Exibir "Ver todos (X)" quando count > previewLimit */
  previewLimit?: number;
  /** Tipo para construir a URL /buscar?type=... */
  viewAllType?: string;
  /** URL customizada (ignora viewAllType se fornecida) */
  action?: {
    label: string;
    to: string;
  };
  className?: string;
}

export function SectionHeader({
  title,
  count,
  previewLimit = 0,
  viewAllType,
  action,
  className,
}: SectionHeaderProps) {
  const [searchParams] = useSearchParams();

  // Constrói URL preservando q e filters
  const buildViewAllUrl = () => {
    if (!viewAllType) return '';
    const params = new URLSearchParams();
    
    const q = searchParams.get('q');
    const filters = searchParams.get('filters');
    
    params.set('type', viewAllType);
    if (q) params.set('q', q);
    if (filters) params.set('filters', filters);
    
    return `/buscar?${params.toString()}`;
  };

  const showViewAll = viewAllType && count !== undefined && count > previewLimit;
  const displayTitle = count !== undefined ? `${title} (${count})` : title;

  // Se action customizada foi passada, usa ela
  const linkTo = action?.to ?? buildViewAllUrl();
  const linkLabel = action?.label ?? `Ver todos (${count})`;

  const showLink = action || showViewAll;

  return (
    <div className={cn('flex items-center justify-between mb-3', className)}>
      <h2 className="text-lg font-bold text-foreground">{displayTitle}</h2>
      {showLink && (
        <Link
          to={linkTo}
          className="flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors touch-target"
        >
          {linkLabel}
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </Link>
      )}
    </div>
  );
}
