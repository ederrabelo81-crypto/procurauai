import { categories } from '@/data/mockData';
import type React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MonteIcon } from '@/components/icons/MonteIcons';
import type { CategoryIconKey } from '@/data/mockData';

interface CategoryCardProps {
  id: string;
  name: string;
  iconKey: CategoryIconKey;
  className?: string;
  size?: 'sm' | 'md';
  onClickOverride?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function CategoryCard({ id, name, iconKey, className, size = 'md', onClickOverride }: CategoryCardProps) {
  return (
    <Link
      to={`/categoria/${id}`}
      onClick={onClickOverride}
      className={cn(
        "flex flex-col items-center justify-center bg-card rounded-2xl card-shadow hover:card-shadow-hover transition-all active:scale-95 touch-target",
        size === 'md' && "p-4 min-h-[100px]",
        size === 'sm' && "p-3 min-h-[84px]",
        className
      )}
    >
      <span className={cn("mb-2 flex items-center justify-center text-primary", size === 'md' ? "h-10 w-10" : "h-9 w-9")}>
        <MonteIcon name={iconKey} className={cn(size === 'md' ? 'h-9 w-9' : 'h-8 w-8')} />
      </span>

      <span className={cn("font-semibold text-foreground text-center leading-tight", size === 'md' ? 'text-sm' : 'text-[12px]')}>
        {name}
      </span>
    </Link>
  );
}

