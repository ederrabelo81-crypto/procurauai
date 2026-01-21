import { Link } from 'react-router-dom';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { listings } from '@/data/mockData';
import { Heart, MapPin } from 'lucide-react';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function ClassificadosBlock() {
  const recentListings = listings.slice(0, 8);

  // Se não há classificados, não renderiza o bloco
  if (recentListings.length === 0) {
    return null;
  }

  return (
    <section>
      <SectionHeader
        title="🛒 Classificados & Doações"
        action={{ label: 'Ver todos', to: '/categoria/classificados' }}
      />

      <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
        {recentListings.map((listing) => {
          const isDonation = listing.type === 'doacao';

          return (
            <Link
              key={listing.id}
              to={`/anuncio/${listing.id}`}
              className="flex-shrink-0 w-[160px] bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all"
            >
              <div className="aspect-square relative">
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Tag de Doação sempre visível quando aplicável */}
                {isDonation && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <Heart className="w-3 h-3" />
                    Doação
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-foreground text-sm line-clamp-1 mb-1">
                  {listing.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-1.5 line-clamp-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {listing.neighborhood}
                </p>
                <p className={isDonation ? "text-green-600 font-bold text-sm" : "text-primary font-bold text-sm"}>
                  {isDonation ? 'Grátis' : formatPrice(listing.price || 0)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
