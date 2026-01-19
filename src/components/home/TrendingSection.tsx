// src/components/home/TrendingSection.tsx
import { SectionHeader } from '@/components/ui/SectionHeader';
import { DealCard } from '@/components/cards/DealCard';
import { ListingCard } from '@/components/cards/ListingCard';
import { NewsCard } from '@/components/cards/NewsCard';
import { deals, listings, news } from '@/data/mockData';

type TrendingItem =
  | { type: 'deal'; data: (typeof deals)[number] | undefined }
  | { type: 'listing'; data: (typeof listings)[number][] }
  | { type: 'news'; data: (typeof news)[number] | undefined };

function Badge({ text }: { text: string }) {
  return (
    <span className="absolute top-2 left-2 z-10 rounded-full px-2 py-1 text-[11px] font-semibold bg-background/90 border border-border">
      {text}
    </span>
  );
}

export function TrendingSection() {
  // Mix de conteúdo em alta (simples e estável) - 4 itens para melhor densidade
  const trendingItems: TrendingItem[] = [
    { type: 'deal', data: deals[0] },
    { type: 'listing', data: [listings[0], listings[1]].filter(Boolean) },
    { type: 'news', data: news[0] },
    { type: 'deal', data: deals[1] },
  ];

  return (
    <section>
      <SectionHeader title="Em alta" action={{ label: 'Ver tudo', to: '/buscar' }} />

      <div className="space-y-3">
        {trendingItems.map((item, index) => {
          if (item.type === 'deal') {
            // Se não existir deal, não renderiza nada
            if (!item.data) return null;

            return (
              <div key={`deal-${index}`} className="relative">
                <Badge text="Oferta" />
                <DealCard deal={item.data} variant="compact" />
              </div>
            );
          }

          if (item.type === 'listing') {
            // ✅ Corrigido: valida ANTES do map (nada de "if" dentro do JSX)
            if (!item.data || item.data.length === 0) return null;

            return (
              <div key={`listing-${index}`} className="grid grid-cols-2 gap-3">
                {item.data.map((l, i) => {
                  if (!l) return null;
                  return (
                    <div key={l.id ?? `listing-${i}`} className="relative">
                      <Badge text="Classificado" />
                      <ListingCard listing={l} />
                    </div>
                  );
                })}
              </div>
            );
          }

          if (item.type === 'news') {
            // Se não existir notícia, não renderiza nada
            if (!item.data) return null;

            return (
              <div key={`news-${index}`} className="relative">
                <Badge text="Notícia" />
                <NewsCard news={item.data} variant="compact" />
              </div>
            );
          }

          return null;
        })}
      </div>
    </section>
  );
}
