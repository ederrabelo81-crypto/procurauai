import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock } from 'lucide-react';
import type { Obituary } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface ObituaryCardProps {
  obituary: Obituary;
  className?: string;
}

export function ObituaryCard({ obituary, className }: ObituaryCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long',
      year: 'numeric'
    });
  };

  const formatBurialDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${day} às ${time}`;
  };

  return (
    <Link 
      to={`/falecimento/${obituary.id}`}
      className={cn(
        "bg-card rounded-2xl p-4 card-shadow hover:card-shadow-hover transition-all block border-l-4 border-muted-foreground/30",
        className
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-bold text-foreground text-lg">
            {obituary.name}
          </h3>
          {obituary.age && (
            <p className="text-sm text-muted-foreground">{obituary.age} anos</p>
          )}
        </div>
        {obituary.status === 'pending' && (
          <span className="px-2 py-1 bg-status-pending/10 text-status-pending text-xs font-medium rounded-full">
            Pendente
          </span>
        )}
      </div>
      
      <div className="space-y-1.5 text-sm text-muted-foreground">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>Falecimento: {formatDate(obituary.date)}</span>
        </div>
        
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">Velório: {obituary.wakeLocation}</span>
        </div>
        
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>Sepultamento: {formatBurialDateTime(obituary.burialDateTime)}</span>
        </div>
      </div>
      
      {obituary.message && (
        <p className="mt-3 text-sm text-muted-foreground italic border-t border-border pt-3 line-clamp-2">
          "{obituary.message}"
        </p>
      )}
    </Link>
  );
}
