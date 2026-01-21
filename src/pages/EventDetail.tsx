import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Ticket, Info, Navigation } from 'lucide-react';
import { events } from '@/data/mockData';
import { useFavorites } from '@/hooks/useFavorites';
import { 
  ListingHero, 
  ListingTabs, 
  ListingActionsBar,
  DetailDescription,
  DetailTags,
  DetailEssentials,
  DetailMap,
  DetailCTA,
  RelatedCarousel
} from '@/components/listing';
import type { TabItem } from '@/components/listing';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const event = events.find(e => e.id === id);

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Evento não encontrado</p>
      </div>
    );
  }

  const isLiked = isFavorite('event', event.id);

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.toLocaleDateString('pt-BR', { 
      weekday: 'long',
      day: '2-digit', 
      month: 'long' 
    });
    const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return { day: day.charAt(0).toUpperCase() + day.slice(1), time };
  };

  const { day, time } = formatDateTime(event.dateTime);

  const handleShare = async () => {
    const url = window.location.href;
    const text = `${event.title} - ${day} às ${time}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, text, url });
      } catch {
        // User cancelled
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank');
    }
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;

  // Outros eventos
  const relatedEvents = events
    .filter((e) => e.id !== event.id)
    .slice(0, 6)
    .map((e) => ({
      id: e.id,
      type: 'event' as const,
      title: e.title,
      subtitle: new Date(e.dateTime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      image: e.image,
    }));

  // Essentials
  const essentialItems = [
    {
      icon: <Calendar className="w-5 h-5 text-primary" />,
      label: 'Data',
      value: day,
      highlight: true,
    },
    {
      icon: <Clock className="w-5 h-5 text-muted-foreground" />,
      label: 'Horário',
      value: time,
    },
    {
      icon: <MapPin className="w-5 h-5 text-primary" />,
      label: 'Local',
      value: event.location,
      action: () => window.open(mapsUrl, '_blank'),
    },
    {
      icon: <Ticket className="w-5 h-5 text-muted-foreground" />,
      label: 'Entrada',
      value: event.priceText,
    },
  ];

  // Tabs do mini-site
  const tabs: TabItem[] = [
    {
      id: 'evento',
      label: 'Evento',
      icon: <Calendar className="w-4 h-4" />,
      content: (
        <div className="space-y-6 px-4">
          {/* Descrição */}
          {event.description && (
            <DetailDescription 
              description={event.description} 
              title="Sobre o evento" 
            />
          )}

          {/* Essentials */}
          <DetailEssentials items={essentialItems} />

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <DetailTags tags={event.tags} title="Características" />
          )}

          {/* Mapa */}
          <DetailMap 
            address={event.location}
            businessName={event.title}
          />

          {/* Outros eventos */}
          {relatedEvents.length > 0 && (
            <RelatedCarousel title="Outros eventos" items={relatedEvents} className="pt-4" />
          )}

          {/* CTA */}
          <DetailCTA listingTypeName="evento" />
        </div>
      ),
    },
  ];

  // Badges para o Hero
  const heroBadges = (
    <>
      {event.priceText === 'Entrada gratuita' && (
        <span className="px-2.5 py-1 bg-status-open text-white rounded-full text-xs font-bold shadow">
          GRÁTIS
        </span>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Hero */}
      <ListingHero
        coverImage={event.image}
        title={event.title}
        category={day}
        neighborhood={event.location}
        priceRange={event.priceText}
        isFavorite={isLiked}
        onFavoriteToggle={() => toggleFavorite('event', event.id)}
        onShare={handleShare}
        badges={heroBadges}
      />

      {/* Tabs */}
      <ListingTabs tabs={tabs} defaultTab="evento" className="mt-4" />

      {/* Barra de ações sticky */}
      <ListingActionsBar
        whatsapp={event.whatsapp}
        mapsUrl={mapsUrl}
        onShare={handleShare}
        onFavorite={() => toggleFavorite('event', event.id)}
        isFavorite={isLiked}
        primaryAction={event.whatsapp ? {
          label: 'Mais informações',
          icon: <Calendar className="w-5 h-5" />,
          onClick: () => {
            const msg = encodeURIComponent(`Olá! Vi o evento "${event.title}" no Monte de Tudo e quero saber mais!`);
            window.open(`https://wa.me/${event.whatsapp}?text=${msg}`, '_blank');
          },
          color: 'whatsapp',
        } : {
          label: 'Como chegar',
          icon: <Navigation className="w-5 h-5" />,
          onClick: () => window.open(mapsUrl, '_blank'),
          color: 'primary',
        }}
      />
    </div>
  );
}
