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
  Package
} from 'lucide-react';

interface CategoryIconProps {
  categoryId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const iconMap: Record<string, any> = {
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

const colorMap: Record<string, string> = {
  food: 'text-orange-500 bg-orange-500/12 border-orange-500/20',
  classifieds: 'text-purple-500 bg-purple-500/12 border-purple-500/20',
  deals: 'text-green-500 bg-green-500/12 border-green-500/20',
  services: 'text-sky-500 bg-sky-500/12 border-sky-500/20',
  events: 'text-pink-500 bg-pink-500/12 border-pink-500/20',
  obituary: 'text-slate-500 bg-slate-500/12 border-slate-500/20',
  news: 'text-blue-500 bg-blue-500/12 border-blue-500/20',
  store: 'text-indigo-500 bg-indigo-500/12 border-indigo-500/20',
  places: 'text-emerald-500 bg-emerald-500/12 border-emerald-500/20',
  cars: 'text-red-500 bg-red-500/12 border-red-500/20',
  jobs: 'text-amber-500 bg-amber-500/12 border-amber-500/20',
  realestate: 'text-cyan-500 bg-cyan-500/12 border-cyan-500/20',
};

const sizeClasses = {
  sm: 'h-10 w-10 rounded-xl',
  md: 'h-14 w-14 rounded-2xl',
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
      "flex items-center justify-center border backdrop-blur-md transition-all duration-300",
      sizeClasses[size],
      colorClasses,
      className
    )}>
      <IconComponent 
        size={iconSizes[size]} 
        strokeWidth={2.2}
        className="drop-shadow-sm"
      />
    </div>
  );
}
