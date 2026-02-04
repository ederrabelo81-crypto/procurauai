import { Star, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

interface AirbnbReviewsProps {
  reviews: Review[];
  averageRating?: number;
  reviewCount?: number;
  className?: string;
}

/**
 * Airbnb-style reviews section with overall rating display
 */
export function AirbnbReviews({
  reviews = [],
  averageRating,
  reviewCount = 0,
  className,
}: AirbnbReviewsProps) {
  // New business - no reviews yet
  if (reviews.length === 0 && !averageRating) {
    return (
      <div className={cn('py-8', className)}>
        <div className="flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-muted-foreground" />
          <div>
            <h3 className="font-semibold text-lg text-foreground">Novo no Procura UAI</h3>
            <p className="text-sm text-muted-foreground">
              Este negócio ainda não possui avaliações
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('py-8 space-y-6', className)}>
      {/* Overall rating header - Airbnb style */}
      {averageRating && (
        <div className="flex items-center gap-3">
          <Star className="w-8 h-8 fill-foreground text-foreground" />
          <span className="text-2xl font-bold text-foreground">{averageRating.toFixed(1)}</span>
          <span className="text-lg text-muted-foreground">·</span>
          <span className="text-lg text-foreground font-medium">{reviewCount} avaliações</span>
        </div>
      )}

      {/* Reviews grid */}
      {reviews.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {reviews.slice(0, 6).map((review) => (
            <div key={review.id} className="space-y-3">
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-foreground">
                    {review.author.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{review.author}</p>
                  <p className="text-xs text-muted-foreground">{review.date}</p>
                </div>
              </div>
              
              {/* Rating stars */}
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'w-3 h-3',
                      star <= review.rating 
                        ? 'fill-foreground text-foreground' 
                        : 'text-muted-foreground/30'
                    )}
                  />
                ))}
              </div>
              
              {/* Review text */}
              <p className="text-sm text-foreground leading-relaxed line-clamp-3">
                {review.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Show more button */}
      {reviews.length > 6 && (
        <button className="w-full py-3 border border-foreground rounded-lg font-semibold text-foreground hover:bg-muted transition-colors">
          Mostrar todas as {reviewCount} avaliações
        </button>
      )}
    </div>
  );
}
