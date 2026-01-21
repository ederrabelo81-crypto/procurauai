import { Link } from 'react-router-dom';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { deals } from '@/data/mockData';
import { Tag, Clock } from 'lucide-react';

export function OfertasBlock() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Apenas ofertas com validade futura (não expiradas)
  const activeDeals = deals
    .filter((deal) => {
      const validDate = new Date(deal.validUntil);
      validDate.setHours(23, 59, 59, 999);
      return validDate >= today;
    })
    .slice(0, 8);

  // Se não há ofertas ativas, não renderiza o bloco
  if (activeDeals.length === 0) {
    return null;
  }

  return (
    <section>
      <SectionHeader
        title="💸 Ofertas Ativas"
        action={{ label: 'Ver todas', to: '/categoria/ofertas' }}
      />

      <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
        {activeDeals.map((deal) => {
          const validDate = new Date(deal.validUntil);
          const daysLeft = Math.ceil((validDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const isEnding = daysLeft <= 2;

          return (
            <Link
              key={deal.id}
              to={`/oferta/${deal.id}`}
              className="flex-shrink-0 w-[180px] bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all"
            >
              <div className="aspect-[4/3] relative">
                <img
                  src={deal.image}
                  alt={deal.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Badge de Oferta obrigatório */}
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                  <Tag className="w-3 h-3" />
                  Oferta
                </div>
                {isEnding && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-destructive text-destructive-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
                    <Clock className="w-3 h-3" />
                    Termina logo!
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-1">
                  {deal.title}
                </h3>
                {deal.subtitle && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-1.5">
                    {deal.subtitle}
                  </p>
                )}
                <p className="text-primary font-bold text-sm">{deal.priceText}</p>
                {deal.businessName && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {deal.businessName}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
