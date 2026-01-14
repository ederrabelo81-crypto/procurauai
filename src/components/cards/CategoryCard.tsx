import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  id: string;
  name: string;
  icon: string;
  className?: string;
}

export function CategoryCard({ id, name, icon, className }: CategoryCardProps) {
  return (
    <Link
      to={`/categoria/${id}`}
      className={cn(
        "flex flex-col items-center justify-center p-4 bg-card rounded-2xl card-shadow hover:card-shadow-hover transition-all active:scale-95 touch-target min-h-[100px]",
        className
      )}
    >
      <span className="text-3xl mb-2">{icon}</span>
      <span className="text-sm font-semibold text-foreground text-center leading-tight">
        {name}
      </span>
    </Link>
  );
}
