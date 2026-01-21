import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Share2, Heart, AlertTriangle, Images, Info } from 'lucide-react';
import { listings, businesses } from '@/data/mockData';
import { useFavorites } from '@/hooks/useFavorites';
import { 
  ListingHero, 
  ListingTabs, 
  ListingActionsBar,
  DetailDescription,
  DetailTags,
  DetailEssentials,
  buildEssentialItems,
  DetailCTA,
  GallerySection,
  RelatedCarousel
} from '@/components/listing';
import type { TabItem } from '@/components/listing';

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const listing = listings.find(l => l.id === id);

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Anúncio não encontrado</p>
      </div>
    );
  }

  const isLiked = isFavorite('listing', listing.id);

  const formatPrice = (price?: number) => {
    if (!price) return null;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Veja ${listing.title} no Monte de Tudo!`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: listing.title, text, url });
      } catch {
        // User cancelled
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank');
    }
  };

  // Relacionados: mesma categoria
  const relatedListings = listings
    .filter((l) => l.id !== listing.id)
    .slice(0, 6)
    .map((l) => ({
      id: l.id,
      type: 'listing' as const,
      title: l.title,
      subtitle: l.neighborhood,
      image: l.images[0],
    }));

  // Essentials
  const essentialItems = buildEssentialItems({
    price: listing.type === 'venda' && listing.price ? formatPrice(listing.price) || undefined : listing.type === 'doacao' ? 'Grátis - Doação' : undefined,
    neighborhood: listing.neighborhood,
  });

  // Tabs do mini-site
  const tabs: TabItem[] = [
    {
      id: 'detalhes',
      label: 'Detalhes',
      icon: <Info className="w-4 h-4" />,
      content: (
        <div className="space-y-6 px-4">
          {/* Descrição */}
          <DetailDescription 
            description={listing.description || 'Sem descrição disponível.'} 
            title="Descrição" 
          />

          {/* Essentials */}
          <DetailEssentials items={essentialItems} />

          {/* Aviso de segurança */}
          <div className="p-3 bg-secondary/20 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-secondary-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Dica de segurança</p>
              <p>Combine encontros em locais públicos e movimentados. Nunca faça pagamentos adiantados.</p>
            </div>
          </div>

          {/* Relacionados */}

          {/* Relacionados */}
          {relatedListings.length > 0 && (
            <RelatedCarousel title="Outros anúncios" items={relatedListings} className="pt-4" />
          )}

          {/* CTA */}
          <DetailCTA listingTypeName="produto para vender ou doar" />
        </div>
      ),
    },
    {
      id: 'fotos',
      label: 'Fotos',
      icon: <Images className="w-4 h-4" />,
      count: listing.images.length,
      hideIfEmpty: listing.images.length <= 1,
      content: (
        <div className="px-4">
          <GallerySection
            images={listing.images}
            title="Fotos do produto"
            plan="pro"
          />
        </div>
      ),
    },
  ];

  // Badges para o Hero
  const heroBadges = (
    <>
      {listing.type === 'doacao' && (
        <span className="px-2.5 py-1 bg-status-open text-white rounded-full text-xs font-bold shadow">
          DOAÇÃO
        </span>
      )}
      {listing.isHighlighted && (
        <span className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-bold shadow">
          DESTAQUE
        </span>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Hero */}
      <ListingHero
        coverImage={listing.images[0]}
        title={listing.title}
        category={listing.type === 'doacao' ? 'Doação' : 'Classificado'}
        neighborhood={listing.neighborhood}
        priceRange={listing.type === 'venda' && listing.price ? formatPrice(listing.price) || undefined : undefined}
        isFavorite={isLiked}
        onFavoriteToggle={() => toggleFavorite('listing', listing.id)}
        onShare={handleShare}
        badges={heroBadges}
      />

      {/* Tabs */}
      <ListingTabs tabs={tabs} defaultTab="detalhes" className="mt-4" />

      {/* Barra de ações sticky */}
      <ListingActionsBar
        whatsapp={listing.whatsapp}
        onShare={handleShare}
        onFavorite={() => toggleFavorite('listing', listing.id)}
        isFavorite={isLiked}
      />
    </div>
  );
}
