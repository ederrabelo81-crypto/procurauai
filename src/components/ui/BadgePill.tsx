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

const variantConfig: Record<BadgeVariant, { bg: string; text: string; defaultIcon?: LucideIcon }> = {
  verified: {
    bg: 'bg-primary/90 backdrop-blur-sm',
    text: 'text-primary-foreground',
    defaultIcon: CheckCircle2,
  },
  open: {
    bg: 'bg-status-open/15',
    text: 'text-status-open',
    defaultIcon: Clock,
  },
  closed: {
    bg: 'bg-status-closed/15',
    text: 'text-status-closed',
    defaultIcon: Clock,
  },
  rating: {
    bg: 'bg-black/60 backdrop-blur-sm',
    text: 'text-white',
    defaultIcon: Star,
  },
  default: {
    bg: 'bg-black/60 backdrop-blur-sm',
    text: 'text-white',
  },
  highlight: {
    bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
    text: 'text-white',
  },
};

/**
 * Unified Badge Pill for overlay status indicators:
 * - Verified (top-right)
 * - Open/Closed (top-left) 
 * - Rating (with star)
 * - Generic highlight
 */
export function BadgePill({ 
  variant = 'default',
  icon,
  children,
  className 
}: BadgePillProps) {
  const config = variantConfig[variant];
  const Icon = icon ?? config.defaultIcon;
  
  // Special styling for rating star
  const iconClass = variant === 'rating' && Icon === Star 
    ? 'w-3.5 h-3.5 fill-yellow-400 text-yellow-400' 
    : 'w-3.5 h-3.5';

  // Pulse dot for open status
  const showPulseDot = variant === 'open';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm',
        config.bg,
        config.text,
        className
      )}
    >
      {showPulseDot && (
        <span className="w-1.5 h-1.5 rounded-full bg-status-open pulse-open" />
      )}
      {Icon && !showPulseDot && <Icon className={iconClass} strokeWidth={2} />}
      {children}
    </span>
  );
}

// Convenience exports for common badge types
export function VerifiedBadge({ className }: { className?: string }) {
  return <BadgePill variant="verified" className={className}>Verificado</BadgePill>;
}

export function OpenBadge({ className }: { className?: string }) {
  return <BadgePill variant="open" className={className}>Aberto agora</BadgePill>;
}

export function ClosedBadge({ className }: { className?: string }) {
  return <BadgePill variant="closed" className={className}>Fechado</BadgePill>;
}

export function RatingBadge({ rating, count, className }: { rating: number; count?: number; className?: string }) {
  return (
    <BadgePill variant="rating" className={className}>
      {rating.toFixed(1)}
      {typeof count === 'number' && count > 0 && (
        <span className="opacity-80">({count})</span>
      )}
    </BadgePill>
  );
}
