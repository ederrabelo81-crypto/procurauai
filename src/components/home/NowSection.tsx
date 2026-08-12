import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Chip } from '@/components/ui/Chip';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { DealCard } from '@/components/cards/DealCard';
import { EventCard } from '@/components/cards/EventCard';
import { BusinessCard } from '@/components/cards/BusinessCard';
import { deals, events, businesses } from '@/data/mockData';
import { places } from '@/data/mockData';
import { isOpenNow } from '@/lib/tagUtils';
import { MapPin, Star } from 'lucide-react';

type Tab = 'ofertas' | 'eventos' | 'abertos' | 'lugares';

export function NowSection() {
  const [activeTab, setActiveTab] = useState<Tab>('ofertas');

  const tabs = [
    { id: 'ofertas' as Tab, label: 'Ofertas do dia' },
    { id: 'eventos' as Tab, label: 'Próximos eventos' },
    { id: 'abertos' as Tab, label: 'Aberto agora' },
    { id: 'lugares' as Tab, label: 'Lugares' },
  ];

  // Mostra apenas os que estão realmente abertos agora pelo texto de hours
  const openBusinesses = businesses
    .filter((b) => isOpenNow(b.hours) === true)
    .slice(0, 4);

  const todayDeals = deals.slice(0, 4);
  const upcomingEvents = events.slice(0, 4);
  const featuredPlaces = places.slice(0, 4);

  const getActionLink = () => {
    switch (activeTab) {
      case 'ofertas': return '/categoria/ofertas';
      case 'eventos': return '/categoria/agenda';
      case 'abertos': return '/categoria/servicos';
      case 'lugares': return '/lugares';
      default: return '/buscar';
    }
  };

  return (
    <section>
      <SectionHeader
        title="Agora na Cidade"
        action={{
          label: 'Ver mais',
          to: getActionLink(),
        }}
      />

      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide -mx-4 px-4">
        {tabs.map((tab) => (
          <Chip
            key={tab.id}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            size="sm"
          >
            {tab.label}
          </Chip>
        ))}
      </div>

      <div className="space-y-3">
        {activeTab === 'ofertas' &&
          todayDeals.map((deal) => <DealCard key={deal.id} deal={deal} variant="compact" />)}

        {activeTab === 'eventos' &&
          upcomingEvents.map((event) => <EventCard key={event.id} event={event} variant="compact" />)}

        {activeTab === 'abertos' &&
          openBusinesses.map((b) => <BusinessCard key={b.id} business={b} variant="compact" />)}

        {activeTab === 'lugares' &&
          featuredPlaces.map((place) => (
            <Link
              key={place.id}
              to={`/lugares/${place.slug}`}
              className="flex almanac-card overflow-hidden"
            >
              <div className="w-28 h-24 flex-shrink-0">
                <img
                  src={place.coverImage}
                  alt={place.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex-1 p-3 min-w-0">
                <h3 className="font-semibold text-foreground text-sm mb-0.5 line-clamp-1">{place.name}</h3>
                <p className="text-xs text-muted-foreground mb-1.5 line-clamp-1">{place.shortDescription}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-accent fill-yellow-500" />
                    {place.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {place.neighborhood}
                  </span>
                  <span className="px-1.5 py-0.5 bg-muted rounded text-[10px]">{place.priceLevel}</span>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </section>
  );
}
