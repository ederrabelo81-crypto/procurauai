import type React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { CategoryIcon } from '@/components/ui/CategoryIcon';

interface CategoryCardProps {
  id: string;
  name: string;
  iconKey: string;
  className?: string;
  size?: 'sm' | 'md';
  onClickOverride?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function CategoryCard({ id, name, iconKey, className, size = 'md', onClickOverride }: CategoryCardProps) {
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
        "almanac-card flex flex-col items-center justify-center active:scale-95 touch-target",
        size === 'md' && "p-4 min-h-[120px]",
        size === 'sm' && "p-3 min-h-[100px]",
        className
      )}
    >
      <CategoryIcon 
        categoryId={iconKey || id} 
        size={size === 'md' ? 'md' : 'sm'} 
        className="mb-3"
      />

      <span className={cn(
        "font-bold text-foreground text-center leading-tight line-clamp-2 break-words",
        size === 'md' ? 'text-sm' : 'text-[12px]'
      )}>
        {name}
      </span>
    </Link>
  );
}
