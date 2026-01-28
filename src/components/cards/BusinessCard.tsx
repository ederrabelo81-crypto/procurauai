
import { Link } from 'react-router-dom';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { BadgePill, VerifiedBadge, OpenBadge, ClosedBadge, RatingBadge } from '@/components/ui/BadgePill';
import { TagChip } from '@/components/ui/TagChip';
import { CTAGrid } from '@/components/ui/ActionButtons';
import type { Business } from '@/data/mockData'; // Mantemos para tipagem se necessário
import { cn } from '@/lib/utils';
import { getBusinessTags } from '@/lib/businessTags';
import { isOpenNow } from '@/lib/tagUtils';
import { normalizeBusinessData } from '@/lib/dataNormalization'; // Importa a função de normalização

interface BusinessCardProps {
  business: Business & { latitude?: number; longitude?: number };
  variant?: 'default' | 'compact';
  className?: string;
}

// Usar a variável de ambiente segura para a chave da API
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export function BusinessCard({ business: rawBusiness, variant = 'default', className }: BusinessCardProps) {
  // Normaliza os dados do negócio para garantir que todos os campos existam
  const business = normalizeBusinessData(rawBusiness);

  const isCompact = variant === 'compact';
  const tags = getBusinessTags(business);
  const open = isOpenNow(business.hours);
  const position = rawBusiness.latitude && rawBusiness.longitude ? { lat: rawBusiness.latitude, lng: rawBusiness.longitude } : null;

  const rating = business.averageRating;
  const reviewCount = business.reviewCount;

  return (
    <div
      className={cn(
        'bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all flex flex-col',
        className
      )}
    >
      {/* Seção do Mapa ou da Imagem */}
      {position ? (
        <APIProvider apiKey={API_KEY}>
          <div className={cn('relative h-36 w-full')}>
            <Map
              mapId={`map-${business.id}`}
              defaultCenter={position}
              defaultZoom={15}
              gestureHandling={'none'}
              disableDefaultUI={true}
            >
              <AdvancedMarker position={position} />
            </Map>
            <div className="absolute top-2 right-2">
              {business.isVerified && <VerifiedBadge />}
            </div>
             <div className="absolute top-2 left-2 flex gap-1.5 items-center">
              {open === true && <OpenBadge />}
              {open === false && <ClosedBadge />}
              {typeof rating === 'number' && !Number.isNaN(rating) && (
                <RatingBadge rating={rating} count={reviewCount} />
              )}
            </div>
          </div>
        </APIProvider>
      ) : (
        <Link to={`/comercio/${business.categorySlug}/${business.id}`} className="block">
          <div className={cn('relative overflow-hidden', isCompact ? 'h-28' : 'h-36')}>
            <img
              src={business.coverImages[0]}
              alt={business.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute top-2 left-2 flex gap-1.5 items-center">
              {open === true && <OpenBadge />}
              {open === false && <ClosedBadge />}
              {typeof rating === 'number' && !Number.isNaN(rating) && (
                <RatingBadge rating={rating} count={reviewCount} />
              )}
            </div>
            {business.isVerified && (
              <div className="absolute top-2 right-2">
                <VerifiedBadge />
              </div>
            )}
          </div>
        </Link>
      )}

      {/* Seção de Conteúdo */}
      <div className="p-3 flex-grow flex flex-col">
        <Link to={`/comercio/${business.categorySlug}/${business.id}`} className="flex-grow">
          <h3 className="font-bold text-foreground text-base mb-0.5 line-clamp-1">{business.name}</h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{business.category}</p>
        </Link>

        {!isCompact && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.slice(0, 3).map(tag => (
              <TagChip key={tag} size="sm" variant="tag">
                {tag}
              </TagChip>
            ))}
          </div>
        )}

        {/* Os CTAs são sempre renderizados com os dados disponíveis */}
        <CTAGrid
          whatsapp={business.whatsapp}
          mapsQuery={position ? `${position.lat},${position.lng}` : `${business.name} ${business.address ?? ''}`}
          phone={business.phone}
          size="sm"
        />
      </div>
    </div>
  );
}
