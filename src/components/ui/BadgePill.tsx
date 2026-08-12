import { cn } from '@/lib/utils';
import { CheckCircle2, Star, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type BadgeVariant = 'verified' | 'open' | 'closed' | 'rating' | 'default' | 'highlight';

interface BadgePillProps {
  variant?: BadgeVariant;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

/**
 * Selo de sobreposição — lido como um carimbo, não como uma pílula genérica.
 * Cantos levemente arredondados, tipografia mono em caixa alta, contorno visível.
 */
const variantConfig: Record<BadgeVariant, { classes: string; defaultIcon?: LucideIcon }> = {
  verified: {
    classes: 'bg-secondary text-secondary-foreground border-secondary',
    defaultIcon: CheckCircle2,
  },
  open: {
    classes: 'bg-card/95 text-status-open border-status-open/40 backdrop-blur-sm',
    defaultIcon: Clock,
  },
  closed: {
    classes: 'bg-card/95 text-muted-foreground border-border backdrop-blur-sm',
    defaultIcon: Clock,
  },
  rating: {
    classes: 'bg-foreground/85 text-background border-transparent backdrop-blur-sm',
    defaultIcon: Star,
  },
  default: {
    classes: 'bg-card/95 text-foreground border-border backdrop-blur-sm',
  },
  highlight: {
    classes: 'bg-accent text-accent-foreground border-accent-foreground/20',
  },
};

export function BadgePill({
  variant = 'default',
  icon,
  children,
  className,
}: BadgePillProps) {
  const config = variantConfig[variant];
  const Icon = icon ?? config.defaultIcon;

  const iconClass =
    variant === 'rating' && Icon === Star
      ? 'w-3 h-3 fill-accent text-accent'
      : 'w-3 h-3';

  const showPulseDot = variant === 'open';

  return (
    <span
      className={cn(
        'stamp inline-flex items-center gap-1.5 px-2 py-[3px] text-[0.625rem] font-bold shadow-sm',
        config.classes,
        className
      )}
    >
      {showPulseDot && (
        <span className="h-1.5 w-1.5 rounded-full bg-status-open pulse-open" />
      )}
      {Icon && !showPulseDot && <Icon className={iconClass} strokeWidth={2.4} />}
      {children}
    </span>
  );
}

// Atalhos para os selos mais usados
export function VerifiedBadge({ className }: { className?: string }) {
  return <BadgePill variant="verified" className={className}>Verificado</BadgePill>;
}

export function OpenBadge({ className }: { className?: string }) {
  return <BadgePill variant="open" className={className}>Aberto</BadgePill>;
}

export function ClosedBadge({ className }: { className?: string }) {
  return <BadgePill variant="closed" className={className}>Fechado</BadgePill>;
}

export function RatingBadge({ rating, count, className }: { rating: number; count?: number; className?: string }) {
  return (
    <BadgePill variant="rating" className={className}>
      {rating.toFixed(1).replace('.', ',')}
      {typeof count === 'number' && count > 0 && (
        <span className="opacity-70">({count})</span>
      )}
    </BadgePill>
  );
}
