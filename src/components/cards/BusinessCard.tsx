import { Link } from 'react-router-dom';
import { VerifiedBadge, OpenBadge, ClosedBadge, RatingBadge } from '@/components/ui/BadgePill';
import { TagChip } from '@/components/ui/TagChip';
import { CTAGrid } from '@/components/ui/ActionButtons';
import { MiniMap } from '@/components/maps';
import type { Business } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { getBusinessTags } from '@/lib/businessTags';
import { isOpenNow } from '@/lib/tagUtils';
import { normalizeBusinessData } from '@/lib/dataNormalization';
import { buildPlaceQuery, toLatLng } from '@/lib/maps';

interface BusinessCardProps {
  business: Business & { latitude?: number; longitude?: number };
  variant?: 'default' | 'compact';
  className?: string;
}

export function BusinessCard({ business: rawBusiness, variant = 'default', className }: BusinessCardProps) {
  const business = normalizeBusinessData(rawBusiness);

  const isCompact = variant === 'compact';
  const tags = getBusinessTags(business);
  const open = isOpenNow(business.hours);
  const position = toLatLng(rawBusiness.latitude, rawBusiness.longitude);

  const rating = business.averageRating;
  const reviewCount = business.reviewCount;
  const detailUrl = `/comercio/${business.categorySlug}/${business.id}`;

  return (
    <article className={cn('almanac-card flex flex-col overflow-hidden', className)}>
      {/* Capa: mapa quando há coordenadas, foto quando não há */}
      <Link to={detailUrl} className="block">
        <div className={cn('relative overflow-hidden', isCompact ? 'h-28' : 'h-36')}>
          {position ? (
            <MiniMap
              position={position}
              title={business.name}
              label={business.neighborhood}
              className="h-full"
            />
          ) : (
            <img
              src={business.coverImages[0]}
              alt={business.name}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.06]"
              loading="lazy"
            />
          )}

          <div className="absolute left-2 top-2 flex items-center gap-1.5">
            {open === true && <OpenBadge />}
            {open === false && <ClosedBadge />}
            {typeof rating === 'number' && !Number.isNaN(rating) && (
              <RatingBadge rating={rating} count={reviewCount} />
            )}
          </div>

          {business.isVerified && (
            <div className="absolute right-2 top-2">
              <VerifiedBadge />
            </div>
          )}
        </div>
      </Link>

      {/* Conteúdo */}
      <div className="flex flex-grow flex-col p-3">
        <Link to={detailUrl} className="flex-grow">
          <h3 className="mb-0.5 line-clamp-1 font-display text-base font-bold text-foreground">
            {business.name}
          </h3>
          <p className="eyebrow mb-3 line-clamp-1 text-muted-foreground">
            {business.category}
          </p>
        </Link>

        {!isCompact && tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
              <TagChip key={tag} size="sm" variant="tag">
                {tag}
              </TagChip>
            ))}
          </div>
        )}

        <CTAGrid
          whatsapp={business.whatsapp}
          mapsQuery={
            position
              ? `${position.lat},${position.lng}`
              : buildPlaceQuery(business.name, business.address)
          }
          phone={business.phone}
          size="sm"
        />
      </div>
    </article>
  );
}
