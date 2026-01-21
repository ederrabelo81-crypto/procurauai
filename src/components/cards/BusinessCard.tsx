import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { BadgePill, VerifiedBadge, OpenBadge, ClosedBadge, RatingBadge } from '@/components/ui/BadgePill';
import { TagChip } from '@/components/ui/TagChip';
import { CTAGrid } from '@/components/ui/ActionButtons';
import type { Business } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { formatHours, parseAndFormatHours } from '@/lib/hoursUtils';
import { getBusinessTags } from '@/lib/businessTags';
import { isOpenNow } from '@/lib/tagUtils';

interface BusinessCardProps {
  business: Business;
  variant?: 'default' | 'compact';
  className?: string;
}

export function BusinessCard({ business, variant = 'default', className }: BusinessCardProps) {
  const isCompact = variant === 'compact';
  const tags = getBusinessTags(business);
  const open = isOpenNow(business.hours);

  // Extract rating from description if exists (ex: "Nota 5.0 (21 avaliações)")
  const ratingMatch = business.description?.match(/Nota\s+(\d+(?:\.\d+)?)\s*\((\d+)/i);
  const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;
  const reviewCount = ratingMatch ? parseInt(ratingMatch[2]) : undefined;

  return (
    <div
      className={cn(
        'bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all',
        className,
      )}
    >
      <Link to={`/comercio/${business.id}`} className="block">
        <div className={cn('relative overflow-hidden', isCompact ? 'h-28' : 'h-36')}>
          <img
            src={business.coverImages[0]}
            alt={business.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* Badges: Status (top-left), Rating (top-left after status), Verified (top-right) */}
          <div className="absolute top-2 left-2 flex gap-1.5 items-center">
            {open === true && <OpenBadge />}
            {open === false && <ClosedBadge />}
            {open === null && (
              <BadgePill variant="default">Horário</BadgePill>
            )}
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

      <div className="p-3">
        <Link to={`/comercio/${business.id}`}>
          <h3 className="font-bold text-foreground text-base mb-0.5 line-clamp-1">{business.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">{business.category}</p>
        </Link>

        <div className="flex items-center text-xs text-muted-foreground mb-3">
          <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
          <span className="truncate">{business.neighborhood}</span>
          <span className="mx-2">•</span>
          <span className="truncate">{formatHours(parseAndFormatHours(business.hours), open === true)}</span>
        </div>

        {/* Tags using unified TagChip */}
        {!isCompact && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.slice(0, 3).map(tag => (
              <TagChip key={tag} size="sm" variant="tag">
                {tag}
              </TagChip>
            ))}
          </div>
        )}

        {/* CTAs using unified grid */}
        <CTAGrid
          whatsapp={business.whatsapp}
          mapsQuery={`${business.name} ${business.address ?? business.neighborhood ?? ''}`}
          phone={business.phone}
          size="sm"
        />
      </div>
    </div>
  );
}
