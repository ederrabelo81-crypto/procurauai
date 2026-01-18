import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Images, Phone as PhoneIcon, Info, CalendarDays, Star } from 'lucide-react';
import { ListingHero } from '@/components/listing/ListingHero';
import { ListingActionsBar } from '@/components/listing/ListingActionsBar';
import { ListingTabs, TabItem } from '@/components/listing/ListingTabs';
import { GallerySection } from '@/components/listing/GallerySection';
import { ContactSection } from '@/components/listing/ContactSection';
import { RelatedCarousel } from '@/components/listing/RelatedCarousel';
import { EventsSection } from '@/components/listing/EventsSection';
import { ReviewsSection } from '@/components/listing/ReviewsSection';
import { Chip } from '@/components/ui/Chip';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { businesses, deals, events } from '@/data/mockData';
import { useFavorites } from '@/hooks/useFavorites';
import { hasFeature, type PlanFeature } from '@/lib/planUtils';
import type { BusinessPlan } from '@/data/mockData';

export default function BusinessDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  // Estado do modal de upgrade
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [lockedFeature, setLockedFeature] = useState<PlanFeature | undefined>();

  const business = businesses.find((b) => b.id === id);

  if (!business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Comércio não encontrado</p>
      </div>
    );
  }

  // Simular plano - em produção viria do backend
  // Alternar para testar: 'free' | 'pro' | 'destaque'
  const plan: BusinessPlan = business.plan || 'free';

  const isLiked = isFavorite('business', business.id);

  // Extrai rating da descrição se existir (ex: "Nota 4.8 (108 avaliações)")
  const ratingMatch = business.description?.match(/Nota\s+(\d+\.?\d*)\s*\((\d+)/i);
  const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;
  const reviewCount = ratingMatch ? parseInt(ratingMatch[2]) : undefined;

  // Extrai website da descrição se existir
  const websiteMatch = business.description?.match(/Site:\s*(https?:\/\/[^\s]+|[^\s]+\.[a-z]{2,}[^\s]*)/i);
  const website = business.website || (websiteMatch ? websiteMatch[1] : undefined);

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Veja ${business.name} no Monte de Tudo!`;

    if (navigator.share) {
      try {
        await navigator.share({ title: business.name, text, url });
      } catch {
        // usuário cancelou
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank');
    }
  };

  const handleTagClick = (tag: string) => {
    navigate(`/buscar?filters=${encodeURIComponent(tag)}`);
  };

  const handleUpgrade = (feature?: PlanFeature) => {
    setLockedFeature(feature);
    setUpgradeModalOpen(true);
  };

  // Buscar eventos/deals relacionados ao negócio
  const businessDeals = deals.filter(d => d.businessId === business.id || d.businessName === business.name);
  const businessEvents = events.filter(e => e.location?.includes(business.neighborhood));

  // Relacionados: mesma categoria
  const relatedBusinesses = businesses
    .filter((b) => b.id !== business.id && b.categorySlug === business.categorySlug)
    .slice(0, 6)
    .map((b) => ({
      id: b.id,
      type: 'business' as const,
      title: b.name,
      subtitle: b.neighborhood,
      image: b.coverImages[0],
    }));

  // Mock reviews para demonstração
  const mockReviews = rating ? [
    { id: '1', author: 'Maria S.', rating: 5, text: 'Excelente atendimento! Recomendo muito.', date: 'há 2 dias' },
    { id: '2', author: 'João P.', rating: 4, text: 'Ótimo lugar, bom custo-benefício.', date: 'há 1 semana' },
    { id: '3', author: 'Ana L.', rating: 5, text: 'Melhor da região!', date: 'há 2 semanas' },
  ] : [];

  // Tabs do mini-site
  const tabs: TabItem[] = [
    {
      id: 'perfil',
      label: 'Perfil',
      icon: <User className="w-4 h-4" />,
      content: (
        <div className="space-y-6 px-4">
          {/* Descrição */}
          {business.description && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">Sobre</h3>
              <p className="text-muted-foreground leading-relaxed">{business.description}</p>
            </div>
          )}

          {/* Tags clicáveis (diferenciais) */}
          {business.tags && business.tags.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">Diferenciais</h3>
              <div className="flex flex-wrap gap-2">
                {business.tags.map((tag) => (
                  <Chip key={tag} onClick={() => handleTagClick(tag)} size="sm" className="cursor-pointer">
                    {tag}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* Relacionados */}
          {relatedBusinesses.length > 0 && (
            <RelatedCarousel title="Similares na região" items={relatedBusinesses} className="pt-4" />
          )}
        </div>
      ),
    },
    {
      id: 'galeria',
      label: 'Galeria',
      icon: <Images className="w-4 h-4" />,
      count: business.coverImages.length,
      content: (
        <div className="px-4">
          <GallerySection
            images={business.coverImages}
            title="Fotos"
            plan={plan}
            onUpgrade={() => handleUpgrade('gallery')}
          />
        </div>
      ),
    },
    {
      id: 'avaliacoes',
      label: 'Avaliações',
      icon: <Star className="w-4 h-4" />,
      count: reviewCount,
      content: (
        <div className="px-4">
          <ReviewsSection
            reviews={mockReviews}
            averageRating={rating}
            reviewCount={reviewCount}
            plan={plan}
            onUpgrade={() => handleUpgrade('reviews')}
          />
        </div>
      ),
    },
    {
      id: 'eventos',
      label: 'Eventos',
      icon: <CalendarDays className="w-4 h-4" />,
      count: businessDeals.length + businessEvents.length,
      hideIfEmpty: businessDeals.length === 0 && businessEvents.length === 0 && plan === 'free',
      content: (
        <div className="px-4">
          <EventsSection
            events={businessEvents}
            deals={businessDeals}
            plan={plan}
            onUpgrade={() => handleUpgrade('events')}
          />
        </div>
      ),
    },
    {
      id: 'contato',
      label: 'Contato',
      icon: <PhoneIcon className="w-4 h-4" />,
      content: (
        <div className="px-4">
          <ContactSection
            address={business.address}
            neighborhood={business.neighborhood}
            hours={business.hours}
            phone={business.phone}
            businessName={business.name}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Hero com chips e badge de plano */}
      <ListingHero
        coverImage={business.coverImages[0]}
        avatar={business.logo}
        title={business.name}
        category={business.category}
        neighborhood={business.neighborhood}
        hours={business.hours}
        rating={rating}
        reviewCount={reviewCount}
        isVerified={business.isVerified}
        plan={plan}
        isFavorite={isLiked}
        onFavoriteToggle={() => toggleFavorite('business', business.id)}
        onShare={handleShare}
      />

      {/* Tabs */}
      <ListingTabs tabs={tabs} defaultTab="perfil" className="mt-4" />

      {/* Barra de ações sticky com restrições por plano */}
      <ListingActionsBar
        whatsapp={business.whatsapp}
        phone={business.phone}
        address={business.address || business.neighborhood}
        businessName={business.name}
        website={website}
        plan={plan}
        onUpgrade={() => handleUpgrade()}
        onShare={handleShare}
        onSchedule={hasFeature(plan, 'schedule') ? () => alert('Agendamento em breve!') : undefined}
      />

      {/* Modal de upgrade */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        currentPlan={plan}
        lockedFeature={lockedFeature}
        businessName={business.name}
      />
    </div>
  );
}
