import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export type GlassIconSize = 'xs' | 'sm' | 'md' | 'lg';
export type GlassIconVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'muted';

interface GlassIconProps {
  icon: LucideIcon;
  size?: GlassIconSize;
  variant?: GlassIconVariant;
  className?: string;
}

const sizeConfig: Record<GlassIconSize, { container: string; icon: string }> = {
  xs: { container: 'w-8 h-8 rounded-md', icon: 'w-4 h-4' },
  sm: { container: 'w-10 h-10 rounded-md', icon: 'w-5 h-5' },
  md: { container: 'w-12 h-12 rounded-lg', icon: 'w-6 h-6' },
  lg: { container: 'w-14 h-14 rounded-lg', icon: 'w-7 h-7' },
};

/**
 * Ícone em bloco de tinta: fundo chapado na cor da família + contorno de 1px
 * na mesma matiz. Substitui o efeito de vidro (que não pertence a esta paleta)
 * por algo mais próximo de um carimbo de almanaque.
 */
const variantConfig: Record<GlassIconVariant, string> = {
  primary: 'bg-primary/12 border-primary/30 text-primary',
  secondary: 'bg-secondary/12 border-secondary/30 text-secondary',
  accent: 'bg-accent/18 border-accent/40 text-accent-foreground dark:text-accent',
  success: 'bg-status-open/12 border-status-open/30 text-status-open',
  warning: 'bg-category-deals/16 border-category-deals/35 text-category-deals',
  destructive: 'bg-destructive/12 border-destructive/30 text-destructive',
  muted: 'bg-muted border-border text-muted-foreground',
};

export function GlassIcon({
  icon: Icon,
  size = 'md',
  variant = 'primary',
  className,
}: GlassIconProps) {
  const sizeStyles = sizeConfig[size];

  return (
    <span
      className={cn(
        'inline-flex aspect-square items-center justify-center border transition-colors duration-200',
        sizeStyles.container,
        variantConfig[variant],
        className
      )}
    >
      <Icon className={sizeStyles.icon} strokeWidth={2.2} />
    </span>
  );
}

export { GlassIcon as default };
