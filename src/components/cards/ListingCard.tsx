import { Link } from 'react-router-dom';
import { MapPin, Heart } from 'lucide-react';
import { BadgePill } from '@/components/ui/BadgePill';
import type { Listing } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/hooks/useFavorites';

interface ListingCardProps {
  listing: Listing;
  className?: string;
}

export function ListingCard({ listing, className }: ListingCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isLiked = isFavorite('listing', listing.id);

  const formatPrice = (price?: number) => {
    if (!price) return null;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className={cn(
      "bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all",
      className
    )}>
      <Link to={`/anuncio/${listing.id}`} className="block">
        <div className="relative h-36 overflow-hidden">
          <img 
            src={listing.images[0]} 
            alt={listing.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          
          {/* Badges: top-left */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            {listing.type === 'doacao' && (
              <BadgePill variant="open">DOAÇÃO</BadgePill>
            )}
            {listing.isHighlighted && (
              <BadgePill variant="highlight">DESTAQUE</BadgePill>
            )}
          </div>
          
          {/* Favorite button: top-right */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite('listing', listing.id);
            }}
            className="absolute top-2 right-2 w-8 h-8 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-transform active:scale-90"
          >
            <Heart 
              className={cn(
                "w-4 h-4 transition-colors",
                isLiked ? "fill-destructive text-destructive" : "text-muted-foreground"
              )} 
            />
          </button>
        </div>
      </Link>
      
      <div className="p-3">
        <Link to={`/anuncio/${listing.id}`}>
          <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-2 min-h-[2.5rem]">
            {listing.title}
          </h3>
        </Link>
        
        {listing.type === 'venda' && listing.price && (
          <p className="text-lg font-bold text-primary mb-1">
            {formatPrice(listing.price)}
          </p>
        )}
        
        <div className="flex items-center text-xs text-muted-foreground">
          <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
          <span className="truncate">{listing.neighborhood}</span>
        </div>
      </div>
    </div>
  );
}
