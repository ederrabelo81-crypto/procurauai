import { Link } from 'react-router-dom';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { events } from '@/data/mockData';
import { Calendar, MapPin } from 'lucide-react';
import { format, parseISO, isAfter, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function AgendaBlock() {
  const today = startOfDay(new Date());

  // Apenas eventos futuros, ordenados por data
  const upcomingEvents = events
    .filter((event) => {
      const eventDate = parseISO(event.dateTime);
      return isAfter(eventDate, today) || startOfDay(eventDate).getTime() === today.getTime();
    })
    .sort((a, b) => parseISO(a.dateTime).getTime() - parseISO(b.dateTime).getTime())
    .slice(0, 4);

  // Se não há eventos futuros, não renderiza o bloco
  if (upcomingEvents.length === 0) {
    return null;
  }

  return (
    <section>
      <SectionHeader
        title="📅 Agenda da Cidade"
        action={{ label: 'Ver agenda completa', to: '/categoria/agenda' }}
      />

      <div className="space-y-3">
        {upcomingEvents.map((event) => {
          const eventDate = parseISO(event.dateTime);
          const dayNumber = format(eventDate, 'd');
          const monthShort = format(eventDate, 'MMM', { locale: ptBR });
          const time = format(eventDate, 'HH:mm');

          return (
            <Link
              key={event.id}
              to={`/evento/${event.id}`}
              className="flex bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all"
            >
              {/* Data destacada */}
              <div className="w-16 bg-primary/10 flex flex-col items-center justify-center py-3 flex-shrink-0">
                <span className="text-2xl font-bold text-primary">{dayNumber}</span>
                <span className="text-xs text-primary/80 uppercase font-medium">{monthShort}</span>
              </div>

              <div className="flex-1 p-3 min-w-0">
                <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-1">
                  {event.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {event.location}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-primary">{event.priceText}</span>
                  {event.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 bg-muted text-muted-foreground text-[10px] rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
