import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Bed, Bath, Car, Maximize, Info, Images, Building, MessageCircle, Phone, Navigation, Heart, Share2 } from "lucide-react";
import { ListingHero } from "@/components/listing/ListingHero";
import { ListingTabs, TabItem } from "@/components/listing/ListingTabs";
import { GallerySection } from "@/components/listing/GallerySection";
import { Chip } from "@/components/ui/Chip";
import { realEstate } from "@/data/newListingTypes";
import { formatTag } from "@/lib/tags";
import { useFavorites } from "@/hooks/useFavorites";

export default function RealEstateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const item = realEstate.find((r) => r.id === id);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Imóvel não encontrado.</p>
          <button 
            onClick={() => navigate('/imoveis')} 
            className="text-primary underline"
          >
            Voltar para Imóveis
          </button>
        </div>
      </div>
    );
  }

  const isLiked = isFavorite('realestate', item.id);

  const priceText = item.transactionType === "alugar"
    ? `${formatPrice(item.rentPrice || 0)}/mês`
    : formatPrice(item.price || 0);

  const mapsUrl = item.lat && item.lng 
    ? `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.title + ' ' + item.neighborhood + ' ' + item.city)}`;

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Veja ${item.title} no Tudo de Monte!`;

    if (navigator.share) {
      try {
        await navigator.share({ title: item.title, text, url });
      } catch {
        // usuário cancelou
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank');
    }
  };

  const handleWhatsApp = () => {
    if (item.whatsapp) {
      const msg = encodeURIComponent(`Olá! Vi o anúncio "${item.title}" no Tudo de Monte e gostaria de mais informações.`);
      window.open(`https://wa.me/${item.whatsapp}?text=${msg}`, '_blank');
    }
  };

  const handleCall = () => {
    if (item.phone) {
      window.open(`tel:${item.phone}`, '_self');
    }
  };

  const handleTagClick = (tag: string) => {
    navigate(`/buscar?filters=${encodeURIComponent(tag)}`);
  };

  // Tabs do mini-site
  const tabs: TabItem[] = [
    {
      id: 'detalhes',
      label: 'Detalhes',
      icon: <Info className="w-4 h-4" />,
      content: (
        <div className="space-y-6 px-4">
          {/* Preço destacado */}
          <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
            <p className="text-2xl font-bold text-primary">{priceText}</p>
            {item.condoFee && item.condoFee > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                + {formatPrice(item.condoFee)} de condomínio
              </p>
            )}
          </div>

          {/* Características principais */}
          <div className="grid grid-cols-4 gap-2">
            {item.bedrooms > 0 && (
              <div className="bg-muted/50 rounded-xl p-3 text-center">
                <Bed className="w-5 h-5 mx-auto text-primary mb-1" />
                <div className="text-sm font-medium">{item.bedrooms}</div>
                <div className="text-xs text-muted-foreground">Quartos</div>
              </div>
            )}
            {item.bathrooms > 0 && (
              <div className="bg-muted/50 rounded-xl p-3 text-center">
                <Bath className="w-5 h-5 mx-auto text-primary mb-1" />
                <div className="text-sm font-medium">{item.bathrooms}</div>
                <div className="text-xs text-muted-foreground">Banheiros</div>
              </div>
            )}
            {item.parkingSpots > 0 && (
              <div className="bg-muted/50 rounded-xl p-3 text-center">
                <Car className="w-5 h-5 mx-auto text-primary mb-1" />
                <div className="text-sm font-medium">{item.parkingSpots}</div>
                <div className="text-xs text-muted-foreground">Vagas</div>
              </div>
            )}
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <Maximize className="w-5 h-5 mx-auto text-primary mb-1" />
              <div className="text-sm font-medium">{item.areaM2}</div>
              <div className="text-xs text-muted-foreground">m²</div>
            </div>
          </div>

          {/* Info adicional */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-xl p-3">
              <div className="text-muted-foreground text-xs mb-1">Mobília</div>
              <div className="font-medium">{formatTag(item.furnished)}</div>
            </div>
            <div className="bg-muted/50 rounded-xl p-3">
              <div className="text-muted-foreground text-xs mb-1">Disponibilidade</div>
              <div className="font-medium">{item.availability === 'imediata' ? 'Imediata' : 'A negociar'}</div>
            </div>
            <div className="bg-muted/50 rounded-xl p-3 col-span-2">
              <div className="text-muted-foreground text-xs mb-1">Pet Friendly</div>
              <div className="font-medium">{item.petFriendly ? '✓ Aceita pets' : '✗ Não aceita pets'}</div>
            </div>
          </div>

          {/* Descrição */}
          {item.description && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">Descrição</h3>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          )}

          {/* Localização */}
          <div>
            <h3 className="font-semibold text-foreground mb-2">Localização</h3>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              {item.neighborhood}, {item.city}
            </div>
          </div>

          {/* Tags clicáveis */}
          {item.tags && item.tags.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">Características</h3>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <Chip key={tag} onClick={() => handleTagClick(tag)} size="sm" className="cursor-pointer">
                    {formatTag(tag)}
                  </Chip>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'comodidades',
      label: 'Comodidades',
      icon: <Building className="w-4 h-4" />,
      count: item.amenities?.length || 0,
      hideIfEmpty: !item.amenities || item.amenities.length === 0,
      content: (
        <div className="px-4">
          <div className="grid grid-cols-2 gap-2">
            {item.amenities?.map((amenity) => (
              <div key={amenity} className="bg-muted/50 rounded-xl p-3 text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                {amenity}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'galeria',
      label: 'Fotos',
      icon: <Images className="w-4 h-4" />,
      count: item.gallery?.length || 0,
      hideIfEmpty: !item.gallery || item.gallery.length === 0,
      content: (
        <div className="px-4">
          <GallerySection
            images={item.gallery || []}
            title="Fotos do imóvel"
            plan="pro"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Hero */}
      <ListingHero
        coverImage={item.coverImage}
        title={item.title}
        category={formatTag(item.propertyType)}
        neighborhood={item.neighborhood}
        priceRange={priceText}
        isFavorite={isLiked}
        onFavoriteToggle={() => toggleFavorite('realestate', item.id)}
        onShare={handleShare}
        badges={
          <>
            <span className="px-2.5 py-1 bg-primary/90 backdrop-blur-sm rounded-full text-xs font-bold text-primary-foreground shadow">
              {formatTag(item.transactionType)}
            </span>
            <span className="px-2.5 py-1 bg-card/90 backdrop-blur-sm rounded-full text-xs font-medium text-foreground shadow flex items-center gap-1">
              <Maximize className="w-3 h-3" />
              {item.areaM2}m²
            </span>
          </>
        }
      />

      {/* Tabs */}
      <ListingTabs tabs={tabs} defaultTab="detalhes" className="mt-4" />

      {/* Ações sticky */}
      <div className="fixed bottom-16 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border p-3 safe-bottom">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          {/* WhatsApp - ação principal */}
          {item.whatsapp && (
            <button
              onClick={handleWhatsApp}
              className="flex-1 h-12 bg-[#25D366] hover:bg-[#22c55e] text-white rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp</span>
            </button>
          )}

          {/* Ligar */}
          {item.phone && (
            <button
              onClick={handleCall}
              className="h-12 w-12 sm:w-auto sm:px-4 bg-muted hover:bg-muted/80 rounded-xl flex items-center justify-center gap-2 text-foreground transition-colors"
            >
              <Phone className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium">Ligar</span>
            </button>
          )}

          {/* Mapa */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="h-12 w-12 sm:w-auto sm:px-4 bg-muted hover:bg-muted/80 rounded-xl flex items-center justify-center gap-2 text-foreground transition-colors"
          >
            <Navigation className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-medium">Mapa</span>
          </a>

          {/* Favoritar */}
          <button
            onClick={() => toggleFavorite('realestate', item.id)}
            className="h-12 w-12 bg-muted hover:bg-muted/80 rounded-xl flex items-center justify-center text-foreground transition-colors"
            aria-label={isLiked ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart className={isLiked ? 'w-5 h-5 fill-destructive text-destructive' : 'w-5 h-5'} />
          </button>

          {/* Compartilhar */}
          <button
            onClick={handleShare}
            className="h-12 w-12 bg-muted hover:bg-muted/80 rounded-xl flex items-center justify-center text-foreground transition-colors"
            aria-label="Compartilhar"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}