import { Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapsButtonProps {
  query: string; // ex: "Barka Gastronomia Monte Santo de Minas MG"
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'default' | 'outline';
}

export function MapsButton({
  query,
  label = 'Maps',
  size = 'md',
  className,
  variant = 'outline'
}: MapsButtonProps) {
  const handleClick = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };

  const sizeStyles = {
    sm: 'h-9 px-3 text-sm gap-1.5',
    md: 'h-11 px-4 text-base gap-2',
    lg: 'h-14 px-6 text-lg gap-2.5'
  };

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center font-semibold rounded-xl transition-all active:scale-95 touch-target",
        variant === 'default'
          ? "bg-primary text-primary-foreground hover:bg-primary/90 button-shadow"
          : "border-2 border-primary text-primary hover:bg-primary/10",
        sizeStyles[size],
        className
      )}
    >
      <Navigation className={iconSize[size]} />
      {label}
    </button>
  );
}
