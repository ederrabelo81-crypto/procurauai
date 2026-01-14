import { Link } from 'react-router-dom';
import { MapPin, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import type { Business } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface BusinessCardProps {
  business: Business;
  variant?: 'default' | 'compact';
  className?: string;
}

export function BusinessCard({ business, variant = 'default', className }: BusinessCardProps) {
  const isCompact = variant === 'compact';

  return (
    <div className={cn(
      "bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all",
      className
    )}>
      <Link to={`/comercio/${business.id}`} className="block">
        <div className={cn(
          "relative overflow-hidden",
          isCompact ? "h-28" : "h-36"
        )}>
          <img 
            src={business.coverImages[0]} 
            alt={business.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute top-2 left-2">
            <StatusBadge isOpen={business.isOpenNow} />
          </div>
          {business.isVerified && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-3">
        <Link to={`/comercio/${business.id}`}>
          <h3 className="font-bold text-foreground text-base mb-0.5 line-clamp-1">
            {business.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">{business.category}</p>
        </Link>
        
        <div className="flex items-center text-xs text-muted-foreground mb-3">
          <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
          <span className="truncate">{business.neighborhood}</span>
          <span className="mx-2">•</span>
          <span className="truncate">{business.hours}</span>
        </div>

        {!isCompact && business.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {business.tags.slice(0, 3).map((tag) => (
              <span 
                key={tag}
                className="px-2 py-0.5 bg-accent text-accent-foreground text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <WhatsAppButton 
          whatsapp={business.whatsapp} 
          size="sm"
          className="w-full"
        />
      </div>
    </div>
  );
}
