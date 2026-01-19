import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Star, Clock, Info, Images, Navigation, Heart, Share2 } from "lucide-react";
import { ListingHero } from "@/components/listing/ListingHero";
import { ListingTabs, TabItem } from "@/components/listing/ListingTabs";
import { ListingActionsBar } from "@/components/listing/ListingActionsBar";
import { GallerySection } from "@/components/listing/GallerySection";
import { Chip } from "@/components/ui/Chip";
import { places } from "@/data/newListingTypes";
import { formatTag } from "@/lib/tags";
import { useFavorites } from "@/hooks/useFavorites";

export default function PlaceDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const place = places.find((p) => p.slug === slug);

  if (!place) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Lugar não encontrado.</p>
          <button 
            onClick={() => navigate('/lugares')} 
            className="text-primary underline"
          >
            Voltar para Lugares
          </button>
        </div>
      </div>
    );
  }

  const isLiked = isFavorite('place', place.id);

  const mapsUrl = place.lat && place.lng 
    ? `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.city)}`;

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Veja ${place.name} no Tudo de Monte!`;

    if (navigator.share) {
      try {
        await navigator.share({ title: place.name, text, url });
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

  // Tabs do mini-site
  const tabs: TabItem[] = [
    {
      id: 'sobre',
      label: 'Sobre',
      icon: <Info className="w-4 h-4" />,
      content: (
        <div className="space-y-6 px-4">
          {/* Descrição */}
          <div>
            <h3 className="font-semibold text-foreground mb-2">Sobre o local</h3>
            <p className="text-muted-foreground leading-relaxed">{place.shortDescription}</p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            {place.openingHours && (
              <div className="bg-muted/50 rounded-xl p-3">
                <div className="text-muted-foreground text-xs mb-1">Horário</div>
                <div className="font-medium flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  {place.openingHours}
                </div>
              </div>
            )}
            {place.durationSuggestion && (
              <div className="bg-muted/50 rounded-xl p-3">
                <div className="text-muted-foreground text-xs mb-1">Duração sugerida</div>
                <div className="font-medium">{place.durationSuggestion}</div>
              </div>
            )}
            {place.bestTimeToGo && (
              <div className="bg-muted/50 rounded-xl p-3">
                <div className="text-muted-foreground text-xs mb-1">Melhor horário</div>
                <div className="font-medium">{place.bestTimeToGo}</div>
              </div>
            )}
            <div className="bg-muted/50 rounded-xl p-3">
              <div className="text-muted-foreground text-xs mb-1">Preço</div>
              <div className="font-medium">{place.priceLevel}</div>
            </div>
          </div>

          {/* Highlights */}
          {place.highlights && place.highlights.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">Destaques</h3>
              <div className="flex flex-wrap gap-2">
                {place.highlights.map((h) => (
                  <span key={h} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags clicáveis */}
          {place.tags && place.tags.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">Características</h3>
              <div className="flex flex-wrap gap-2">
                {place.tags.map((tag) => (
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
      id: 'galeria',
      label: 'Fotos',
      icon: <Images className="w-4 h-4" />,
      count: place.gallery?.length || 0,
      hideIfEmpty: !place.gallery || place.gallery.length === 0,
      content: (
        <div className="px-4">
          <GallerySection
            images={place.gallery || []}
            title="Fotos do local"
            plan="pro"
          />
        </div>
      ),
    },
    {
      id: 'avaliacoes',
      label: 'Avaliações',
      icon: <Star className="w-4 h-4" />,
      count: place.reviewsCount,
      content: (
        <div className="px-4">
          <div className="bg-card rounded-2xl p-6 text-center border border-border">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
              <span className="text-3xl font-bold text-foreground">{place.rating}</span>
            </div>
            <p className="text-muted-foreground">{place.reviewsCount} avaliações</p>
            <p className="text-sm text-muted-foreground mt-4">
              As avaliações detalhadas estarão disponíveis em breve.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Hero */}
      <ListingHero
        coverImage={place.coverImage}
        title={place.name}
        category={place.typeTag}
        neighborhood={place.neighborhood}
        rating={place.rating}
        reviewCount={place.reviewsCount}
        priceRange={place.priceLevel}
        isFavorite={isLiked}
        onFavoriteToggle={() => toggleFavorite('place', place.id)}
        onShare={handleShare}
        badges={
          <span className="px-2.5 py-1 bg-card/90 backdrop-blur-sm rounded-full text-xs font-medium text-foreground shadow flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {place.city}
          </span>
        }
      />

      {/* Tabs */}
      <ListingTabs tabs={tabs} defaultTab="sobre" className="mt-4" />

      {/* Ações sticky */}
      <div className="fixed bottom-16 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border p-3 safe-bottom">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          {/* Como chegar - ação principal */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors shadow-lg"
          >
            <Navigation className="w-5 h-5" />
            <span>Como chegar</span>
          </a>

          {/* Favoritar */}
          <button
            onClick={() => toggleFavorite('place', place.id)}
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