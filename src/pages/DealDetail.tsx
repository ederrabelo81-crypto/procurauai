import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Store, Info, Tag } from 'lucide-react';
import { deals, businesses } from '@/data/mockData';
import { useFavorites } from '@/hooks/useFavorites';
import { 
  ListingHero, 
  ListingTabs, 
  ListingActionsBar,
  DetailDescription,
  DetailEssentials,
  DetailCTA,
  RelatedCarousel
} from '@/components/listing';
import type { TabItem } from '@/components/listing';

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const deal = deals.find(d => d.id === id);

  if (!deal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Oferta não encontrada</p>
      </div>
    );
  }

  const isLiked = isFavorite('deal', deal.id);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `${deal.title} por ${deal.priceText} no Monte de Tudo!`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: deal.title, text, url });
      } catch {
        // User cancelled
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank');
    }
  };

  // Encontrar negócio relacionado
  const relatedBusiness = deal.businessId 
    ? businesses.find(b => b.id === deal.businessId)
    : businesses.find(b => b.name === deal.businessName);

  // Outras ofertas
  const relatedDeals = deals
    .filter((d) => d.id !== deal.id)
    .slice(0, 6)
    .map((d) => ({
      id: d.id,
      type: 'deal' as const,
      title: d.title,
      subtitle: d.priceText,
      image: d.image,
    }));

  // Essentials
  const essentialItems = [
    {
      icon: <Tag className="w-5 h-5 text-primary" />,
      label: 'Preço',
      value: deal.priceText,
      highlight: true,
    },
    {
      icon: <Clock className="w-5 h-5 text-muted-foreground" />,
      label: 'Validade',
      value: `Até ${formatDate(deal.validUntil)}`,
    },
    ...(deal.businessName ? [{
      icon: <Store className="w-5 h-5 text-muted-foreground" />,
      label: 'Estabelecimento',
      value: deal.businessName,
      action: relatedBusiness ? () => navigate(`/comercio/${relatedBusiness.id}`) : undefined,
    }] : []),
  ];

  // Tabs do mini-site
  const tabs: TabItem[] = [
    {
      id: 'oferta',
      label: 'Oferta',
      icon: <Tag className="w-4 h-4" />,
      content: (
        <div className="space-y-6 px-4">
          {/* Descrição */}
          {deal.subtitle && (
            <DetailDescription 
              description={deal.subtitle} 
              title="Detalhes da oferta" 
            />
          )}

          {/* Essentials */}
          <DetailEssentials items={essentialItems} />

          {/* Outras ofertas */}
          {relatedDeals.length > 0 && (
            <RelatedCarousel title="Outras ofertas" items={relatedDeals} className="pt-4" />
          )}

          {/* CTA */}
          <DetailCTA listingTypeName="oferta ou promoção" />
        </div>
      ),
    },
  ];

  // Badges para o Hero
  const heroBadges = (
    <>
      {deal.isSponsored && (
        <span className="px-2.5 py-1 bg-foreground/70 text-background rounded-full text-xs font-medium shadow">
          Patrocinado
        </span>
      )}
      <span className="px-2.5 py-1 bg-primary text-primary-foreground rounded-full text-xs font-bold shadow">
        OFERTA
      </span>
    </>
  );

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Hero */}
      <ListingHero
        coverImage={deal.image}
        title={deal.title}
        category={deal.businessName || 'Oferta'}
        neighborhood={`Válido até ${formatDate(deal.validUntil)}`}
        priceRange={deal.priceText}
        isFavorite={isLiked}
        onFavoriteToggle={() => toggleFavorite('deal', deal.id)}
        onShare={handleShare}
        badges={heroBadges}
      />

      {/* Tabs */}
      <ListingTabs tabs={tabs} defaultTab="oferta" className="mt-4" />

      {/* Barra de ações sticky */}
      <ListingActionsBar
        whatsapp={deal.whatsapp}
        onShare={handleShare}
        onFavorite={() => toggleFavorite('deal', deal.id)}
        isFavorite={isLiked}
        primaryAction={{
          label: 'Quero essa oferta!',
          icon: <Tag className="w-5 h-5" />,
          onClick: () => {
            if (deal.whatsapp) {
              const msg = encodeURIComponent(`Olá! Vi a oferta "${deal.title}" no Monte de Tudo e quero aproveitar!`);
              window.open(`https://wa.me/${deal.whatsapp}?text=${msg}`, '_blank');
            }
          },
          color: 'whatsapp',
        }}
      />
    </div>
  );
}
