import { Star, MessageCircle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BusinessPlan } from '@/data/mockData';
import { hasFeature, PLAN_INFO } from '@/lib/planUtils';

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

interface ReviewsSectionProps {
  reviews?: Review[];
  averageRating?: number;
  reviewCount?: number;
  plan?: BusinessPlan;
  onUpgrade?: () => void;
  className?: string;
}

export function ReviewsSection({
  reviews = [],
  averageRating,
  reviewCount,
  plan = 'free',
  onUpgrade,
  className,
}: ReviewsSectionProps) {
  const hasAccess = hasFeature(plan, 'reviews');

  // Estado vazio - novo no Tudo Junto
  if (reviews.length === 0 && !averageRating) {
    return (
      <div className={cn('text-center py-8', className)}>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full mb-3">
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Novo no Tudo Junto</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Este negócio ainda não possui avaliações
        </p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className={cn('relative', className)}>
        {/* Preview com blur */}
        <div className="filter blur-sm pointer-events-none space-y-4">
          {/* Rating geral */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{averageRating?.toFixed(1) || '4.5'}</div>
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'w-4 h-4',
                      star <= (averageRating || 4.5) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{reviewCount || 12} avaliações</p>
            </div>
          </div>

          {/* Reviews fake */}
          {[1, 2].map((i) => (
            <div key={i} className="p-4 border border-border rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-muted" />
                <div className="h-4 w-24 bg-muted rounded" />
              </div>
              <div className="h-3 w-full bg-muted rounded mb-1" />
              <div className="h-3 w-3/4 bg-muted rounded" />
            </div>
          ))}
        </div>

        {/* Overlay de bloqueio */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-[2px] rounded-xl cursor-pointer"
          onClick={onUpgrade}
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">
            Avaliações bloqueadas
          </p>
          <p className="text-xs text-muted-foreground mb-3 text-center px-4">
            Exiba avaliações e aumente sua credibilidade
          </p>
          <span className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm">
            Ativar {PLAN_INFO.pro.label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Rating geral */}
      {averageRating && (
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">{averageRating.toFixed(1)}</div>
            <div className="flex gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'w-4 h-4',
                    star <= averageRating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{reviewCount} avaliações</p>
          </div>
        </div>
      )}

      {/* Lista de reviews */}
      {reviews.map((review) => (
        <div key={review.id} className="p-4 border border-border rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {review.author.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">{review.author}</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'w-3 h-3',
                      star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                    )}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-1">{review.date}</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{review.text}</p>
        </div>
      ))}
    </div>
  );
}
