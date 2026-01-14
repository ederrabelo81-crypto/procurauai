import { SectionHeader } from '@/components/ui/SectionHeader';
import { DealCard } from '@/components/cards/DealCard';
import { ListingCard } from '@/components/cards/ListingCard';
import { NewsCard } from '@/components/cards/NewsCard';
import { deals, listings, news } from '@/data/mockData';

export function TrendingSection() {
  // Mix de conteúdo em alta
  const trendingItems = [
    { type: 'deal', data: deals[0] },
    { type: 'listing', data: listings[0] },
    { type: 'news', data: news[0] },
  ];

  return (
    <section>
      <SectionHeader 
        title="Em alta" 
        action={{ label: 'Ver tudo', to: '/buscar' }}
      />
      
      <div className="space-y-3">
        {trendingItems.map((item, index) => {
          if (item.type === 'deal') {
            return <DealCard key={`deal-${index}`} deal={item.data as typeof deals[0]} variant="compact" />;
          }
          if (item.type === 'listing') {
            return (
              <div key={`listing-${index}`} className="grid grid-cols-2 gap-3">
                <ListingCard listing={listings[0]} />
                <ListingCard listing={listings[1]} />
              </div>
            );
          }
          if (item.type === 'news') {
            return <NewsCard key={`news-${index}`} news={item.data as typeof news[0]} variant="compact" />;
          }
          return null;
        })}
      </div>
    </section>
  );
}
