import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  className?: string;
  size?: 'default' | 'large';
}

/**
 * Campo de busca com peso de objeto físico: borda de 2px, sombra dura embaixo
 * e a lupa dentro de um bloco de tinta terracota que "acende" no foco.
 */
export function SearchBar({
  placeholder = 'Procure na sua cidade…',
  value,
  onChange,
  onFocus,
  className,
  size = 'default',
}: SearchBarProps) {
  const isLarge = size === 'large';

  return (
    <div
      className={cn(
        'group relative w-full',
        className
      )}
    >
      <span
        className={cn(
          'pointer-events-none absolute left-2 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-md bg-primary text-primary-foreground transition-transform duration-200 group-focus-within:scale-105',
          isLarge ? 'h-10 w-10' : 'h-8 w-8'
        )}
      >
        <Search className={isLarge ? 'h-5 w-5' : 'h-4 w-4'} strokeWidth={2.4} />
      </span>

      <input
        type="search"
        inputMode="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={onFocus}
        className={cn(
          'w-full rounded-lg border-2 border-border bg-card font-medium text-foreground shadow-[0_2px_0_0_hsl(var(--border))] outline-none transition-all',
          'placeholder:font-normal placeholder:text-muted-foreground',
          'focus:border-primary focus:shadow-[0_2px_0_0_hsl(var(--primary))]',
          '[&::-webkit-search-cancel-button]:appearance-none',
          isLarge ? 'h-14 pl-14 pr-4 text-base' : 'h-12 pl-12 pr-3 text-sm'
        )}
      />
    </div>
  );
}
