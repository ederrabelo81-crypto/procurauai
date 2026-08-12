import { ArrowRight, type LucideIcon } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { GlassIcon, type GlassIconVariant } from '@/components/ui/GlassIcon';

interface SectionHeaderProps {
  title: string;
  /** Linha de apoio em caixa alta acima do título. */
  kicker?: string;
  icon?: LucideIcon;
  iconVariant?: GlassIconVariant;
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

/**
 * Cabeçalho de seção no padrão do almanaque: rótulo mono em caixa alta,
 * título em Fraunces e um filete pontilhado costurando o espaço até a ação.
 */
export function SectionHeader({
  title,
  kicker,
  icon,
  iconVariant = 'primary',
  count,
  previewLimit = 0,
  viewAllType,
  action,
  className,
}: SectionHeaderProps) {
  const [searchParams] = useSearchParams();

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
  const linkTo = action?.to ?? buildViewAllUrl();
  const linkLabel = action?.label ?? 'Ver todos';
  const showLink = Boolean(action || showViewAll);

  return (
    <div className={cn('mb-4', className)}>
      {kicker && (
        <p className="eyebrow mb-1.5 text-primary">{kicker}</p>
      )}

      <div className="flex items-center gap-3">
        {icon && <GlassIcon icon={icon} size="xs" variant={iconVariant} />}

        <h2 className="font-display text-xl font-bold leading-none text-foreground">
          {title}
          {count !== undefined && (
            <span className="ml-2 font-mono text-sm font-medium text-muted-foreground">
              {count}
            </span>
          )}
        </h2>

        <span className="rule-line" />

        {showLink && (
          <Link
            to={linkTo}
            className="group inline-flex flex-shrink-0 items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary transition-colors hover:text-foreground"
          >
            {linkLabel}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
