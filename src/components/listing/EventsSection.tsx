import { CalendarDays, Info, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BusinessPlan, Deal, Event } from '@/data/mockData';
import { hasFeature } from '@/lib/planUtils';

interface EventsSectionProps {
  events?: Event[];
  deals?: Deal[];
  plan?: BusinessPlan;
  className?: string;
}

export function EventsSection({
  events = [],
  deals = [],
  plan = 'free',
  className,
}: EventsSectionProps) {
  const hasAccess = hasFeature(plan, 'events');
  const allItems = [...events.map(e => ({ ...e, type: 'event' as const })), ...deals.map(d => ({ ...d, type: 'deal' as const }))];

  // Limitar eventos baseado no plano
  const maxEvents = plan === 'destaque' ? 3 : plan === 'pro' ? 1 : 0;
  const visibleItems = hasAccess ? allItems.slice(0, maxEvents) : [];
  const hiddenCount = allItems.length;

  if (allItems.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
          <CalendarDays className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Nenhum evento ou promoção ativa</p>
      </div>
    );
  }

  // Plano básico: mensagem informativa sem conteúdo
  if (!hasAccess) {
    return (
      <div className={cn('text-center py-8', className)}>
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
          <Info className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground mb-1">
          Este anúncio possui {hiddenCount} {hiddenCount === 1 ? 'evento/promoção' : 'eventos/promoções'}
        </p>
        <p className="text-xs text-muted-foreground">
          Informações detalhadas não disponíveis neste anúncio
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {visibleItems.map((item, idx) => (
        <div
          key={idx}
          className="p-4 border border-border rounded-xl bg-card hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {'image' in item && item.image && (
              <img
                src={item.image}
                alt={item.title}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground truncate">{item.title}</h4>
              {'dateTime' in item && (
                <p className="text-sm text-muted-foreground">{item.dateTime}</p>
              )}
              {'validUntil' in item && (
                <p className="text-sm text-primary font-medium">{item.priceText}</p>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </div>
        </div>
      ))}

      {/* Mensagem informativa se há mais eventos */}
      {allItems.length > visibleItems.length && (
        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl">
          <Info className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            +{allItems.length - visibleItems.length} {allItems.length - visibleItems.length === 1 ? 'evento não exibido' : 'eventos não exibidos'} neste anúncio
          </p>
        </div>
      )}
    </div>
  );
}
