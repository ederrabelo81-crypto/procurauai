import { ArrowLeft, Heart, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface StickyNavProps {
  title: string;
  isVisible: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  onShare?: () => void;
  className?: string;
}

/**
 * Airbnb-style sticky navigation that appears on scroll
 */
export function StickyNav({
  title,
  isVisible,
  isFavorite,
  onFavoriteToggle,
  onShare,
  className,
}: StickyNavProps) {
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border transition-transform duration-300',
        isVisible ? 'translate-y-0' : '-translate-y-full',
        className
      )}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Title (truncated) */}
        <h1 className="flex-1 font-semibold text-foreground truncate text-center">
          {title}
        </h1>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {onShare && (
            <button
              onClick={onShare}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
              aria-label="Compartilhar"
            >
              <Share2 className="w-5 h-5" />
            </button>
          )}
          {onFavoriteToggle && (
            <button
              onClick={onFavoriteToggle}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
              aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Heart
                className={cn(
                  'w-5 h-5',
                  isFavorite ? 'fill-destructive text-destructive' : 'text-foreground'
                )}
              />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
