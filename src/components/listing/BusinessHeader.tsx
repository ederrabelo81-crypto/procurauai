import { CheckCircle2, Star, MapPin, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BusinessPlan } from '@/data/mockData';
import { PLAN_INFO } from '@/lib/planUtils';

interface BusinessHeaderProps {
  title: string;
  category: string;
  neighborhood: string;
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  plan?: BusinessPlan;
  className?: string;
}

/**
 * Airbnb-style business header with title, category, location, and rating
 */
export function BusinessHeader({
  title,
  category,
  neighborhood,
  rating,
  reviewCount,
  isVerified,
  plan,
  className,
}: BusinessHeaderProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
        {title}
      </h1>
      
      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        {/* Rating */}
        {rating && (
          <span className="flex items-center gap-1 font-medium">
            <Star className="w-4 h-4 fill-foreground" />
            {rating.toFixed(1)}
            {reviewCount && (
              <span className="text-muted-foreground">
                · {reviewCount} avaliações
              </span>
            )}
          </span>
        )}
        
        {/* Verified badge */}
        {isVerified && (
          <span className="flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            Verificado
          </span>
        )}
        
        {/* Destaque badge */}
        {plan === 'destaque' && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full">
            <Sparkles className="w-3 h-3" />
            {PLAN_INFO.destaque.label}
          </span>
        )}
        
        {/* Location */}
        <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground underline underline-offset-4 decoration-muted-foreground/50">
          <MapPin className="w-4 h-4" />
          {neighborhood}
        </button>
        
        {/* Category */}
        <span className="text-muted-foreground">
          · {category}
        </span>
      </div>
    </div>
  );
}
