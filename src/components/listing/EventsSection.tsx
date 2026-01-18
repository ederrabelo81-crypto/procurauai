import { CalendarDays, Lock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BusinessPlan, Deal, Event } from '@/data/mockData';
import { hasFeature, PLAN_INFO } from '@/lib/planUtils';

interface EventsSectionProps {
  events?: Event[];
  deals?: Deal[];
  plan?: BusinessPlan;
  onUpgrade?: () => void;
  className?: string;
}

export function EventsSection({
  events = [],
  deals = [],
  plan = 'free',
  onUpgrade,
  className,
}: EventsSectionProps) {
  const hasAccess = hasFeature(plan, 'events');
  const allItems = [...events.map(e => ({ ...e, type: 'event' as const })), ...deals.map(d => ({ ...d, type: 'deal' as const }))];

  // Limitar eventos baseado no plano
  const maxEvents = plan === 'destaque' ? 3 : plan === 'pro' ? 1 : 0;
  const visibleItems = allItems.slice(0, maxEvents);
  const hasMore = allItems.length > maxEvents;

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

  if (!hasAccess) {
    return (
      <div className={cn('relative', className)}>
        {/* Preview com blur */}
        <div className="filter blur-sm pointer-events-none">
          {allItems.slice(0, 2).map((item, idx) => (
            <div key={idx} className="p-4 border border-border rounded-xl mb-3 bg-card">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg bg-muted" />
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-muted rounded mb-2" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overlay de bloqueio */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-[2px] rounded-xl cursor-pointer"
          onClick={onUpgrade}
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">
            Eventos bloqueados
          </p>
          <p className="text-xs text-muted-foreground mb-3 text-center px-4">
            Divulgue promoções e eventos para atrair clientes
          </p>
          <span className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm">
            Ativar {PLAN_INFO.pro.label}
          </span>
        </div>
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

      {hasMore && plan !== 'destaque' && (
        <button
          onClick={onUpgrade}
          className="w-full p-3 border border-dashed border-primary/30 rounded-xl text-center text-sm text-primary hover:bg-primary/5 transition-colors"
        >
          +{allItems.length - maxEvents} eventos disponíveis no {PLAN_INFO.destaque.label}
        </button>
      )}
    </div>
  );
}
