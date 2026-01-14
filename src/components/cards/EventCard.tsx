import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import type { Event } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'compact';
  className?: string;
}

export function EventCard({ event, variant = 'default', className }: EventCardProps) {
  const isCompact = variant === 'compact';
  
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return { day: day.replace('.', ''), time };
  };

  const { day, time } = formatDateTime(event.dateTime);

  return (
    <Link 
      to={`/evento/${event.id}`}
      className={cn(
        "bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all block",
        isCompact ? "flex" : "",
        className
      )}
    >
      <div className={cn(
        "relative overflow-hidden",
        isCompact ? "w-20 h-20 flex-shrink-0" : "h-32"
      )}>
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {!isCompact && event.priceText === 'Entrada gratuita' && (
          <div className="absolute top-2 left-2 bg-status-open text-white px-2 py-1 rounded-lg text-xs font-bold">
            GRÁTIS
          </div>
        )}
      </div>
      
      <div className={cn("p-3", isCompact && "flex-1 flex flex-col justify-center")}>
        <h3 className={cn(
          "font-bold text-foreground line-clamp-2",
          isCompact ? "text-sm mb-1" : "text-base mb-2"
        )}>
          {event.title}
        </h3>
        
        {!isCompact && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {event.tags.slice(0, 2).map((tag) => (
              <span 
                key={tag}
                className="px-2 py-0.5 bg-accent text-accent-foreground text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className={cn(
          "flex items-center text-muted-foreground",
          isCompact ? "text-xs gap-2" : "text-sm gap-3"
        )}>
          <span className="flex items-center">
            <Calendar className={cn("mr-1", isCompact ? "w-3 h-3" : "w-4 h-4")} />
            {day} • {time}
          </span>
        </div>
        
        {!isCompact && (
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        )}
        
        {!isCompact && (
          <p className="text-base font-semibold text-primary mt-2">
            {event.priceText}
          </p>
        )}
      </div>
    </Link>
  );
}
