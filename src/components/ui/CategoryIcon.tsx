import { cn } from '@/lib/utils';
import { getCategoryIcon } from '@/assets/icons/categoryIcons';

interface CategoryIconProps {
  categoryId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-7 w-7',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
};

export function CategoryIcon({ categoryId, size = 'md', className }: CategoryIconProps) {
  const iconSrc = getCategoryIcon(categoryId);
  
  if (!iconSrc) {
    return <span className={cn(sizeClasses[size], "flex items-center justify-center text-lg", className)}>📦</span>;
  }
  
  return (
    <img 
      src={iconSrc} 
      alt=""
      loading="lazy"
      className={cn(
        "object-contain drop-shadow-md",
        sizeClasses[size],
        className
      )}
    />
  );
}
