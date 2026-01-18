import { useParams, useNavigate } from 'react-router-dom';
import { User, Images, Phone as PhoneIcon, Info } from 'lucide-react';
import { ListingHero } from '@/components/listing/ListingHero';
import { ListingActionsBar } from '@/components/listing/ListingActionsBar';
import { ListingTabs, TabItem } from '@/components/listing/ListingTabs';
import { GallerySection } from '@/components/listing/GallerySection';
import { ContactSection } from '@/components/listing/ContactSection';
import { RelatedCarousel } from '@/components/listing/RelatedCarousel';
import { Chip } from '@/components/ui/Chip';
import { businesses } from '@/data/mockData';
import { useFavorites } from '@/hooks/useFavorites';

export default function BusinessDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const business = businesses.find((b) => b.id === id);

  if (!business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Comércio não encontrado</p>
      </div>
    );
  }

  const isLiked = isFavorite('business', business.id);

  // Extrai rating da descrição se existir (ex: "Nota 4.8 (108 avaliações)")
  const ratingMatch = business.description?.match(/Nota (\d+\.?\d*) \((\d+)/);
  const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;
  const reviewCount = ratingMatch ? parseInt(ratingMatch[2]) : undefined;

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

          {/* Tags clicáveis */}
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
      hideIfEmpty: true,
      content: business.coverImages.length > 1 ? (
        <div className="px-4">
          <GallerySection images={business.coverImages} title="Fotos" />
        </div>
      ) : null,
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
      {/* Hero com chips */}
      <ListingHero
        coverImage={business.coverImages[0]}
        title={business.name}
        category={business.category}
        neighborhood={business.neighborhood}
        hours={business.hours}
        rating={rating}
        reviewCount={reviewCount}
        isVerified={business.isVerified}
        isFavorite={isLiked}
        onFavoriteToggle={() => toggleFavorite('business', business.id)}
        onShare={handleShare}
      />

      {/* Tabs */}
      <ListingTabs tabs={tabs} defaultTab="perfil" className="mt-4" />

      {/* Barra de ações sticky */}
      <ListingActionsBar
        whatsapp={business.whatsapp}
        phone={business.phone}
        address={business.address || business.neighborhood}
        businessName={business.name}
        onShare={handleShare}
      />
    </div>
  );
}
