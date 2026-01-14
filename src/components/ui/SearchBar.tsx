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
  placeholder = "Pizzaria, pedreiro, farmácia…", 
  value,
  onChange,
  onFocus,
  className,
  size = 'default'
}: SearchBarProps) {
  return (
    <div className={cn(
      "relative w-full",
      className
    )}>
      <Search 
        className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground",
          size === 'large' ? "w-6 h-6" : "w-5 h-5"
        )} 
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={onFocus}
        className={cn(
          "w-full bg-card border border-border rounded-2xl pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all card-shadow",
          size === 'large' ? "h-14 text-lg" : "h-12 text-base"
        )}
      />
    </div>
  );
}
