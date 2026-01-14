import { Link } from 'react-router-dom';
import type { News } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface NewsCardProps {
  news: News;
  variant?: 'default' | 'compact';
  className?: string;
}

const tagColors: Record<string, string> = {
  'Prefeitura': 'bg-primary/10 text-primary',
  'Saúde': 'bg-status-open/10 text-status-open',
  'Esportes': 'bg-category-events/10 text-category-events',
  'Trânsito': 'bg-secondary/80 text-secondary-foreground',
  'Comunidade': 'bg-category-services/10 text-category-services',
};

export function NewsCard({ news, variant = 'default', className }: NewsCardProps) {
  const isCompact = variant === 'compact';
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) return 'Hoje';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <Link 
      to={`/noticia/${news.id}`}
      className={cn(
        "bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all block",
        isCompact ? "flex gap-3 p-3" : "",
        className
      )}
    >
      {news.image && (
        <div className={cn(
          "relative overflow-hidden",
          isCompact ? "w-20 h-20 rounded-xl flex-shrink-0" : "h-36"
        )}>
          <img 
            src={news.image} 
            alt={news.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      
      <div className={cn(!isCompact && "p-3", isCompact && "flex-1 flex flex-col justify-center")}>
        <div className="flex items-center gap-2 mb-1.5">
          <span className={cn(
            "px-2 py-0.5 rounded-full text-xs font-medium",
            tagColors[news.tag] || 'bg-muted text-muted-foreground'
          )}>
            {news.tag}
          </span>
          <span className="text-xs text-muted-foreground">{formatDate(news.date)}</span>
        </div>
        
        <h3 className={cn(
          "font-bold text-foreground",
          isCompact ? "text-sm line-clamp-2" : "text-base mb-1 line-clamp-2"
        )}>
          {news.title}
        </h3>
        
        {!isCompact && (
          <p className="text-sm text-muted-foreground line-clamp-2">{news.snippet}</p>
        )}
      </div>
    </Link>
  );
}
