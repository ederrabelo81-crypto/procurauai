import { cn } from '@/lib/utils';
import { 
  Utensils, 
  ShoppingBag, 
  Tag, 
  Wrench, 
  Calendar, 
  Cross, 
  Newspaper, 
  Store, 
  MapPin, 
  Car, 
  Briefcase, 
  Home,
  Package,
  type LucideIcon,
} from 'lucide-react';

interface CategoryIconProps {
  categoryId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  food: Utensils,
  classifieds: ShoppingBag,
  deals: Tag,
  services: Wrench,
  events: Calendar,
  obituary: Cross,
  news: Newspaper,
  store: Store,
  places: MapPin,
  cars: Car,
  jobs: Briefcase,
  realestate: Home,
};

/**
 * Cada família de categoria puxa o seu token do design system — nada de cores
 * cruas do Tailwind, para o conjunto continuar lendo como uma paleta só.
 */
const colorMap: Record<string, string> = {
  food: 'text-category-food bg-category-food/12 border-category-food/30',
  classifieds: 'text-category-classifieds bg-category-classifieds/12 border-category-classifieds/30',
  deals: 'text-category-deals bg-category-deals/14 border-category-deals/30',
  services: 'text-category-services bg-category-services/12 border-category-services/30',
  events: 'text-category-events bg-category-events/12 border-category-events/30',
  obituary: 'text-category-obituary bg-category-obituary/12 border-category-obituary/30',
  news: 'text-category-news bg-category-news/12 border-category-news/30',
  store: 'text-primary bg-primary/12 border-primary/30',
  places: 'text-secondary bg-secondary/12 border-secondary/30',
  cars: 'text-destructive bg-destructive/12 border-destructive/30',
  jobs: 'text-category-deals bg-category-deals/14 border-category-deals/30',
  realestate: 'text-category-services bg-category-services/12 border-category-services/30',
};

const sizeClasses = {
  sm: 'h-10 w-10 rounded-lg',
  md: 'h-14 w-14 rounded-lg',
  lg: 'h-20 w-20 rounded-3xl',
};

const iconSizes = {
  sm: 20,
  md: 28,
  lg: 40,
};

export function CategoryIcon({ categoryId, size = 'md', className }: CategoryIconProps) {
  const IconComponent = iconMap[categoryId] || Package;
  const colorClasses = colorMap[categoryId] || 'text-primary bg-primary/12 border-primary/20';
  
  return (
    <div className={cn(
      "flex items-center justify-center border transition-all duration-300",
      sizeClasses[size],
      colorClasses,
      className
    )}>
      <IconComponent 
        size={iconSizes[size]} 
        strokeWidth={2.2}
        
      />
    </div>
  );
}
