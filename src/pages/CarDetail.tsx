import { useParams, useNavigate } from "react-router-dom";
import { Fuel, Gauge, Info, Images, MapPin, MessageCircle, Phone, Heart, Share2, Settings, Car } from "lucide-react";
import { ListingHero } from "@/components/listing/ListingHero";
import { ListingTabs, TabItem } from "@/components/listing/ListingTabs";
import { GallerySection } from "@/components/listing/GallerySection";
import { Chip } from "@/components/ui/Chip";
import { cars } from "@/data/newListingTypes";
import { formatTag } from "@/lib/tags";
import { useFavorites } from "@/hooks/useFavorites";

export default function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const car = cars.find((c) => c.id === id);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  if (!car) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Carro não encontrado.</p>
          <button 
            onClick={() => navigate('/carros')} 
            className="text-primary underline"
          >
            Voltar para Carros
          </button>
        </div>
      </div>
    );
  }

  const isLiked = isFavorite('car', car.id);

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Veja ${car.title} no Tudo de Monte!`;

    if (navigator.share) {
      try {
        await navigator.share({ title: car.title, text, url });
      } catch {
        // usuário cancelou
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank');
    }
  };

  const handleWhatsApp = () => {
    if (car.whatsapp) {
      const msg = encodeURIComponent(`Olá! Vi o anúncio do ${car.title} no Tudo de Monte e gostaria de mais informações.`);
      window.open(`https://wa.me/${car.whatsapp}?text=${msg}`, '_blank');
    }
  };

  const handleCall = () => {
    if (car.phone) {
      window.open(`tel:${car.phone}`, '_self');
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
            <p className="text-2xl font-bold text-primary">{formatPrice(car.price)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {formatTag(car.condition)} • {car.year} • {formatTag(car.sellerType)}
            </p>
          </div>

          {/* Especificações */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Especificações</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-xl p-3">
                <div className="text-muted-foreground text-xs mb-1">Quilometragem</div>
                <div className="font-medium flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-primary" />
                  {(car.mileageKm / 1000).toFixed(0)} mil km
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-3">
                <div className="text-muted-foreground text-xs mb-1">Combustível</div>
                <div className="font-medium flex items-center gap-1.5">
                  <Fuel className="w-4 h-4 text-primary" />
                  {formatTag(car.fuel)}
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-3">
                <div className="text-muted-foreground text-xs mb-1">Câmbio</div>
                <div className="font-medium flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-primary" />
                  {formatTag(car.transmission)}
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-3">
                <div className="text-muted-foreground text-xs mb-1">Portas</div>
                <div className="font-medium flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-primary" />
                  {car.doors} portas
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-3">
                <div className="text-muted-foreground text-xs mb-1">Cor</div>
                <div className="font-medium">{car.color}</div>
              </div>
              <div className="bg-muted/50 rounded-xl p-3">
                <div className="text-muted-foreground text-xs mb-1">Localização</div>
                <div className="font-medium flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  {car.neighborhood}
                </div>
              </div>
            </div>
          </div>

          {/* Descrição */}
          {car.description && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">Descrição</h3>
              <p className="text-muted-foreground leading-relaxed">{car.description}</p>
            </div>
          )}

          {/* Tags clicáveis */}
          {car.tags && car.tags.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">Características</h3>
              <div className="flex flex-wrap gap-2">
                {car.tags.map((tag) => (
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
      id: 'opcionais',
      label: 'Opcionais',
      icon: <Settings className="w-4 h-4" />,
      count: car.features?.length || 0,
      hideIfEmpty: !car.features || car.features.length === 0,
      content: (
        <div className="px-4">
          <div className="grid grid-cols-2 gap-2">
            {car.features?.map((feature) => (
              <div key={feature} className="bg-muted/50 rounded-xl p-3 text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                {feature}
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
      count: car.gallery?.length || 0,
      hideIfEmpty: !car.gallery || car.gallery.length === 0,
      content: (
        <div className="px-4">
          <GallerySection
            images={car.gallery || []}
            title="Fotos do veículo"
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
        coverImage={car.coverImage}
        title={car.title}
        category={`${car.brand} • ${car.year}`}
        neighborhood={car.neighborhood}
        priceRange={formatPrice(car.price)}
        isFavorite={isLiked}
        onFavoriteToggle={() => toggleFavorite('car', car.id)}
        onShare={handleShare}
        badges={
          <>
            <span className="px-2.5 py-1 bg-primary/90 backdrop-blur-sm rounded-full text-xs font-bold text-primary-foreground shadow">
              {formatTag(car.sellerType)}
            </span>
            <span className="px-2.5 py-1 bg-card/90 backdrop-blur-sm rounded-full text-xs font-medium text-foreground shadow">
              {formatTag(car.condition)}
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
          {car.whatsapp && (
            <button
              onClick={handleWhatsApp}
              className="flex-1 h-12 bg-[#25D366] hover:bg-[#22c55e] text-white rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp</span>
            </button>
          )}

          {/* Ligar */}
          {car.phone && (
            <button
              onClick={handleCall}
              className="h-12 px-4 bg-muted hover:bg-muted/80 rounded-xl flex items-center justify-center gap-2 text-foreground transition-colors"
            >
              <Phone className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium">Ligar</span>
            </button>
          )}

          {/* Favoritar */}
          <button
            onClick={() => toggleFavorite('car', car.id)}
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