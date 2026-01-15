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

export function SearchBar({ 
  placeholder = "O que você procura agora?", 
  value,
  onChange,
  onFocus,
  className,
  size = 'default'
}: SearchBarProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <Search 
        className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none",
          size === 'large' ? "w-5 h-5" : "w-4 h-4"
        )} 
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={onFocus}
        className={cn(
          "w-full bg-card border border-border rounded-2xl pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm",
          size === 'large' ? "h-14 text-base" : "h-12 text-sm"
        )}
      />
    </div>
  );
}