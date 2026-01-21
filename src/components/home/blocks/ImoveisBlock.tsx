import { Link } from 'react-router-dom';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { realEstate } from '@/data/newListingTypes';
import { MapPin, Bed, Bath } from 'lucide-react';

function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getPropertyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    apartamento: 'Apartamento',
    casa: 'Casa',
    kitnet: 'Kitnet',
    terreno: 'Terreno',
    comercial: 'Comercial',
  };
  return labels[type] || type;
}

function getTransactionLabel(type: string): string {
  return type === 'alugar' ? 'Aluguel' : 'Venda';
}

export function ImoveisBlock() {
  const featuredRealEstate = realEstate.slice(0, 6);

  // Se não há imóveis, não renderiza o bloco
  if (featuredRealEstate.length === 0) {
    return null;
  }

  return (
    <section>
      <SectionHeader
        title="🏠 Imóveis em Destaque"
        action={{ label: 'Ver todos', to: '/imoveis' }}
      />

      <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
        {featuredRealEstate.map((property) => {
          const price = property.transactionType === 'alugar' 
            ? property.rentPrice 
            : property.price;

          return (
            <Link
              key={property.id}
              to={`/imoveis/${property.id}`}
              className="flex-shrink-0 w-[220px] bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all"
            >
              <div className="aspect-[16/10] relative">
                <img
                  src={property.coverImage}
                  alt={property.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Tipo + finalidade */}
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="bg-primary text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
                    {getTransactionLabel(property.transactionType)}
                  </span>
                  <span className="bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                    {getPropertyTypeLabel(property.propertyType)}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-foreground text-sm line-clamp-1 mb-1">
                  {property.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  {property.bedrooms > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Bed className="w-3 h-3" />
                      {property.bedrooms}
                    </span>
                  )}
                  {property.bathrooms > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Bath className="w-3 h-3" />
                      {property.bathrooms}
                    </span>
                  )}
                  <span>{property.areaM2}m²</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <MapPin className="w-3 h-3" />
                  {property.neighborhood}
                </div>
                {price && (
                  <p className="text-primary font-bold text-sm">
                    {formatPrice(price)}
                    {property.transactionType === 'alugar' && '/mês'}
                  </p>
                )}
                {/* Máximo 2 tags */}
                {property.tags.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {property.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 bg-muted text-muted-foreground text-[10px] rounded"
                      >
                        {tag.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
