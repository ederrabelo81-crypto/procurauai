import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface TagChipProps {
  children: React.ReactNode;
  icon?: LucideIcon;
  isActive?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
  variant?: 'default' | 'filter' | 'tag';
  className?: string;
}

/**
 * Unified Chip component for:
 * - Filter chips (in search/category headers)
 * - Tag chips (inside cards)
 * 
 * Standardized: 32-36px height, pill radius, 1px border, ellipsis for long text
 */
export function TagChip({ 
  children, 
  icon: Icon,
  isActive = false, 
  onClick, 
  size = 'sm',
  variant = 'default',
  className 
}: TagChipProps) {
  const isClickable = !!onClick;
  
  const sizeStyles = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-9 px-3.5 text-sm gap-2'
  };

  const variantStyles = {
    default: cn(
      'border',
      isActive 
        ? 'bg-primary text-primary-foreground border-primary' 
        : 'bg-card text-foreground border-border hover:border-primary/50'
    ),
    filter: cn(
      'border',
      isActive 
        ? 'bg-primary/10 text-primary border-primary/30' 
        : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
    ),
    tag: 'bg-accent/50 text-accent-foreground border-transparent'
  };

  const Component = isClickable ? 'button' : 'span';

  return (
    <Component
      type={isClickable ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-full transition-all whitespace-nowrap max-w-[150px]',
        sizeStyles[size],
        variantStyles[variant],
        isClickable && 'cursor-pointer active:scale-95',
        className
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />}
      <span className="truncate">{children}</span>
    </Component>
  );
}
