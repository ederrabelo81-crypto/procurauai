import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import type { Deal } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface DealCardProps {
  deal: Deal;
  variant?: 'default' | 'compact';
  className?: string;
}

export function DealCard({ deal, variant = 'default', className }: DealCardProps) {
  const isCompact = variant === 'compact';
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className={cn(
      "bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all",
      isCompact ? "flex" : "",
      className
    )}>
      <Link 
        to={`/oferta/${deal.id}`} 
        className={cn("block", isCompact ? "flex-shrink-0" : "")}
      >
        <div className={cn(
          "relative overflow-hidden",
          isCompact ? "w-24 h-24" : "h-32"
        )}>
          <img 
            src={deal.image} 
            alt={deal.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {deal.isSponsored && (
            <div className="absolute top-2 left-2 bg-foreground/70 text-background px-2 py-0.5 rounded text-2xs font-medium">
              Patrocinado
            </div>
          )}
        </div>
      </Link>
      
      <div className={cn("p-3 flex-1", isCompact && "flex flex-col justify-center")}>
        <Link to={`/oferta/${deal.id}`}>
          <h3 className={cn(
            "font-bold text-foreground line-clamp-1",
            isCompact ? "text-sm mb-0.5" : "text-base mb-1"
          )}>
            {deal.title}
          </h3>
          {deal.subtitle && !isCompact && (
            <p className="text-sm text-muted-foreground mb-1 line-clamp-1">{deal.subtitle}</p>
          )}
        </Link>
        
        <p className={cn(
          "font-bold text-primary",
          isCompact ? "text-base mb-1" : "text-xl mb-2"
        )}>
          {deal.priceText}
        </p>
        
        {!isCompact && (
          <>
            <div className="flex items-center text-xs text-muted-foreground mb-3">
              <Clock className="w-3.5 h-3.5 mr-1" />
              <span>Válido até {formatDate(deal.validUntil)}</span>
              {deal.businessName && (
                <>
                  <span className="mx-1.5">•</span>
                  <span className="truncate">{deal.businessName}</span>
                </>
              )}
            </div>
            
            <WhatsAppButton 
              whatsapp={deal.whatsapp} 
              size="sm"
              className="w-full"
            />
          </>
        )}
        
        {isCompact && deal.businessName && (
          <p className="text-xs text-muted-foreground truncate">{deal.businessName}</p>
        )}
      </div>
    </div>
  );
}
