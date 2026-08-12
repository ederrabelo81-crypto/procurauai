import { Link } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import { BadgePill } from '@/components/ui/BadgePill';
import { MiniMap } from '@/components/maps';
import type { Listing } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/hooks/useFavorites';
import { toLatLng } from '@/lib/maps';

interface ListingCardProps {
  listing: Listing & { latitude?: number; longitude?: number };
  className?: string;
}

export function ListingCard({ listing, className }: ListingCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isLiked = isFavorite('listing', listing.id);
  const position = toLatLng(listing.latitude, listing.longitude);

  const formatPrice = (price?: number) => {
    if (!price) return null;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const badges = (
    <div className="absolute left-2 top-2 flex gap-1.5">
      {listing.type === 'doacao' && <BadgePill variant="open">DOAÇÃO</BadgePill>}
      {listing.isHighlighted && <BadgePill variant="highlight">DESTAQUE</BadgePill>}
    </div>
  );

  const favoriteButton = (
    <button
      type="button"
      aria-label={isLiked ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
      onClick={(e) => {
        e.preventDefault();
        toggleFavorite('listing', listing.id);
      }}
      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-card/90 backdrop-blur-sm transition-transform active:scale-90"
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-colors',
          isLiked ? 'fill-destructive text-destructive' : 'text-muted-foreground'
        )}
      />
    </button>
  );

  return (
    <article className={cn('almanac-card flex flex-col overflow-hidden', className)}>
      <Link to={`/anuncio/${listing.id}`} className="block">
        <div className="relative h-36 overflow-hidden">
          {position ? (
            <MiniMap
              position={position}
              title={listing.title}
              label={listing.neighborhood}
              className="h-full"
            />
          ) : (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          )}
          {badges}
          {favoriteButton}
        </div>
      </Link>

      <div className="flex flex-grow flex-col p-3">
        <Link to={`/anuncio/${listing.id}`} className="flex-grow">
          <h3 className="mb-1 line-clamp-2 min-h-[2.5rem] font-display text-[0.95rem] font-bold leading-snug text-foreground">
            {listing.title}
          </h3>
        </Link>

        {listing.type === 'venda' && listing.price && (
          <p className="font-mono text-lg font-bold tracking-tight text-primary">
            {formatPrice(listing.price)}
          </p>
        )}

        {listing.neighborhood && (
          <p className="mt-1 flex items-center gap-1 truncate text-2xs text-muted-foreground">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            {listing.neighborhood}
          </p>
        )}
      </div>
    </article>
  );
}
