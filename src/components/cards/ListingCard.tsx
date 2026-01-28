import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { BadgePill } from '@/components/ui/BadgePill';
import type { Listing } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/hooks/useFavorites';

interface ListingCardProps {
  listing: Listing & { latitude?: number; longitude?: number };
  className?: string;
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export function ListingCard({ listing, className }: ListingCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isLiked = isFavorite('listing', listing.id);
  const position = listing.latitude && listing.longitude ? { lat: listing.latitude, lng: listing.longitude } : null;

  const formatPrice = (price?: number) => {
    if (!price) return null;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      className={cn(
        'bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all flex flex-col',
        className
      )}
    >
      {/* Map or Image Section */}
      {position ? (
        <APIProvider apiKey={API_KEY}>
          <div className="relative h-36 w-full">
            <Map
              mapId={`map-listing-${listing.id}`}
              defaultCenter={position}
              defaultZoom={15}
              gestureHandling={'none'}
              disableDefaultUI={true}
            >
              <AdvancedMarker position={position} />
            </Map>
            <div className="absolute top-2 left-2 flex gap-1.5">
              {listing.type === 'doacao' && <BadgePill variant="open">DOAÇÃO</BadgePill>}
              {listing.isHighlighted && <BadgePill variant="highlight">DESTAQUE</BadgePill>}
            </div>
            <button
              onClick={(e) => { e.preventDefault(); toggleFavorite('listing', listing.id); }}
              className="absolute top-2 right-2 w-8 h-8 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-transform active:scale-90"
            >
              <Heart className={cn("w-4 h-4 transition-colors", isLiked ? "fill-destructive text-destructive" : "text-muted-foreground")} />
            </button>
          </div>
        </APIProvider>
      ) : (
        <Link to={`/anuncio/${listing.id}`} className="block">
          <div className="relative h-36 overflow-hidden">
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute top-2 left-2 flex gap-1.5">
              {listing.type === 'doacao' && <BadgePill variant="open">DOAÇÃO</BadgePill>}
              {listing.isHighlighted && <BadgePill variant="highlight">DESTAQUE</BadgePill>}
            </div>
            <button
              onClick={(e) => { e.preventDefault(); toggleFavorite('listing', listing.id); }}
              className="absolute top-2 right-2 w-8 h-8 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-transform active:scale-90"
            >
              <Heart className={cn("w-4 h-4 transition-colors", isLiked ? "fill-destructive text-destructive" : "text-muted-foreground")} />
            </button>
          </div>
        </Link>
      )}

      {/* Content Section */}
      <div className="p-3 flex-grow flex flex-col">
        <Link to={`/anuncio/${listing.id}`} className="flex-grow">
          <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-2 min-h-[2.5rem]">
            {listing.title}
          </h3>
        </Link>

        {listing.type === 'venda' && listing.price && (
          <p className="text-lg font-bold text-primary mb-1">
            {formatPrice(listing.price)}
          </p>
        )}

        {/* If there's no map, you might want to show neighborhood text as a fallback */}
        {!position && listing.neighborhood && (
            <p className="text-xs text-muted-foreground truncate">{listing.neighborhood}</p>
        )}
      </div>
    </div>
  );
}
