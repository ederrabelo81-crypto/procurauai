import { Star, MessageCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BusinessPlan } from '@/data/mockData';
import { hasFeature } from '@/lib/planUtils';

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
  className?: string;
}

export function ReviewsSection({
  reviews = [],
  averageRating,
  reviewCount,
  plan = 'free',
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

  // Plano básico: mostrar apenas resumo geral
  if (!hasAccess) {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Rating geral sempre visível */}
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

        {/* Mensagem informativa - sem CTA */}
        <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl">
          <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            As avaliações detalhadas não estão disponíveis para este anúncio.
          </p>
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
