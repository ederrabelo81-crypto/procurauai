import type React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getCategoryIcon } from '@/assets/icons/categoryIcons';

interface CategoryCardProps {
  id: string;
  name: string;
  iconKey: string;
  className?: string;
  size?: 'sm' | 'md';
  onClickOverride?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function CategoryCard({ id, name, iconKey, className, size = 'md', onClickOverride }: CategoryCardProps) {
  const iconSrc = getCategoryIcon(iconKey) || getCategoryIcon(id);
  
  // Rotas especiais para novos tipos
  const getRoute = () => {
    const specialRoutes: Record<string, string> = {
      'lugares': '/lugares',
      'carros': '/carros',
      'empregos': '/empregos',
      'imoveis': '/imoveis',
    };
    return specialRoutes[id] || `/categoria/${id}`;
  };
  
  return (
    <Link
      to={getRoute()}
      onClick={onClickOverride}
      className={cn(
        "flex flex-col items-center justify-center bg-card rounded-2xl card-shadow hover:card-shadow-hover transition-all active:scale-95 touch-target",
        size === 'md' && "p-4 min-h-[100px]",
        size === 'sm' && "p-3 min-h-[84px]",
        className
      )}
    >
      <span className={cn(
        "mb-2 flex items-center justify-center",
        size === 'md' ? "h-12 w-12" : "h-11 w-11"
      )}>
        {iconSrc ? (
          <img 
            src={iconSrc} 
            alt={name}
            loading="lazy"
            className={cn(
              "object-contain drop-shadow-md",
              size === 'md' ? 'h-12 w-12' : 'h-11 w-11'
            )}
          />
        ) : (
          <span className="text-2xl">📦</span>
        )}
      </span>

      <span className={cn(
        "font-semibold text-foreground text-center leading-tight",
        size === 'md' ? 'text-sm' : 'text-[12px]'
      )}>
        {name}
      </span>
    </Link>
  );
}
