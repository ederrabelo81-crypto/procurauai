import { ArrowLeft, Heart, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface FloatingActionsProps {
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  onShare?: () => void;
  className?: string;
}

/**
 * Floating action buttons for back, share, and favorite
 * Positioned over the gallery on mobile
 */
export function FloatingActions({
  isFavorite,
  onFavoriteToggle,
  onShare,
  className,
}: FloatingActionsProps) {
  const navigate = useNavigate();

  return (
    <div className={cn('absolute top-0 left-0 right-0 z-10 p-4 flex justify-between safe-top', className)}>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
        aria-label="Voltar"
      >
        <ArrowLeft className="w-5 h-5 text-foreground" />
      </button>

      {/* Right actions */}
      <div className="flex gap-2">
        {onShare && (
          <button
            onClick={onShare}
            className="w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
            aria-label="Compartilhar"
          >
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
        )}
        {onFavoriteToggle && (
          <button
            onClick={onFavoriteToggle}
            className="w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
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
  );
}
