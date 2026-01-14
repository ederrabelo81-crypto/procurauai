import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Phone, Share2, CheckCircle2, Heart, Navigation } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { businesses } from '@/data/mockData';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

export default function BusinessDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const business = businesses.find(b => b.id === id);

  if (!business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Comércio não encontrado</p>
      </div>
    );
  }

  const isLiked = isFavorite('business', business.id);

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Veja ${business.name} no Monte de Tudo!`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: business.name, text, url });
      } catch (e) {
        // User cancelled
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank');
    }
  };

  const handleDirections = () => {
    const query = encodeURIComponent(business.address || business.name);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleCall = () => {
    if (business.phone) {
      window.open(`tel:${business.phone}`, '_self');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header com imagem */}
      <div className="relative h-56">
        <img 
          src={business.coverImages[0]} 
          alt={business.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        
        {/* Botões do header */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 safe-top">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => toggleFavorite('business', business.id)}
              className="w-10 h-10 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <Heart className={cn(
                "w-5 h-5",
                isLiked ? "fill-destructive text-destructive" : "text-foreground"
              )} />
            </button>
            <button 
              onClick={handleShare}
              className="w-10 h-10 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-4 -mt-6 relative z-10">
        <div className="bg-card rounded-2xl p-4 card-shadow">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-foreground">{business.name}</h1>
                {business.isVerified && (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                )}
              </div>
              <p className="text-muted-foreground">{business.category}</p>
            </div>
            <StatusBadge isOpen={business.isOpenNow} />
          </div>

          {/* Tags */}
          {business.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 my-4">
              {business.tags.map((tag) => (
                <span 
                  key={tag}
                  className="px-3 py-1 bg-accent text-accent-foreground text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Info */}
          <div className="space-y-3 py-4 border-t border-border">
            <div className="flex items-center text-foreground">
              <MapPin className="w-5 h-5 mr-3 text-muted-foreground flex-shrink-0" />
              <span>{business.address || business.neighborhood}</span>
            </div>
            <div className="flex items-center text-foreground">
              <Clock className="w-5 h-5 mr-3 text-muted-foreground flex-shrink-0" />
              <span>{business.hours}</span>
            </div>
            {business.phone && (
              <div className="flex items-center text-foreground">
                <Phone className="w-5 h-5 mr-3 text-muted-foreground flex-shrink-0" />
                <span>{business.phone}</span>
              </div>
            )}
          </div>

          {/* Descrição */}
          {business.description && (
            <div className="py-4 border-t border-border">
              <h2 className="font-semibold text-foreground mb-2">Sobre</h2>
              <p className="text-muted-foreground">{business.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Barra de ações fixa */}
      <div className="fixed bottom-16 left-0 right-0 z-50 bg-card border-t border-border p-4 safe-bottom">
        <div className="flex gap-3 max-w-lg mx-auto">
          <WhatsAppButton 
            whatsapp={business.whatsapp} 
            message={`Olá! Vi ${business.name} no Monte de Tudo e gostaria de saber mais.`}
            size="lg"
            className="flex-1"
          />
          <button
            onClick={handleDirections}
            className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <Navigation className="w-6 h-6 text-foreground" />
          </button>
          {business.phone && (
            <button
              onClick={handleCall}
              className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <Phone className="w-6 h-6 text-foreground" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
