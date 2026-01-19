import { useState } from 'react';
import { Chip } from '@/components/ui/Chip';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { DealCard } from '@/components/cards/DealCard';
import { EventCard } from '@/components/cards/EventCard';
import { BusinessCard } from '@/components/cards/BusinessCard';
import { deals, events, businesses } from '@/data/mockData';
import { isOpenNow } from '@/lib/tagUtils';

type Tab = 'ofertas' | 'eventos' | 'abertos';

export function NowSection() {
  const [activeTab, setActiveTab] = useState<Tab>('ofertas');

  const tabs = [
    { id: 'ofertas' as Tab, label: 'Ofertas do dia' },
    { id: 'eventos' as Tab, label: 'Próximos eventos' },
    { id: 'abertos' as Tab, label: 'Aberto agora' },
  ];

  // Mostra apenas os que estão realmente abertos agora pelo texto de hours
  const openBusinesses = businesses
    .filter((b) => isOpenNow(b.hours) === true)
    .slice(0, 4);

  const todayDeals = deals.slice(0, 4);
  const upcomingEvents = events.slice(0, 4);

  return (
    <section>
      <SectionHeader
        title="Agora na Cidade"
        action={{
          label: 'Ver mais',
          to:
            activeTab === 'ofertas'
              ? '/categoria/ofertas'
              : activeTab === 'eventos'
                ? '/categoria/agenda'
                : '/categoria/servicos',
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
      </div>
    </section>
  );
}
