import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Share2, Heart, AlertTriangle } from 'lucide-react';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { listings } from '@/data/mockData';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

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
      } catch (e) {
        // User cancelled
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header com imagem */}
      <div className="relative h-72">
        <img 
          src={listing.images[0]} 
          alt={listing.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2 safe-top">
          {listing.type === 'doacao' && (
            <span className="bg-status-open text-white px-3 py-1.5 rounded-lg text-sm font-bold">
              DOAÇÃO
            </span>
          )}
          {listing.isHighlighted && (
            <span className="bg-secondary text-secondary-foreground px-3 py-1.5 rounded-lg text-sm font-bold">
              DESTAQUE
            </span>
          )}
        </div>
        
        {/* Botões do header */}
        <div className="absolute top-4 right-4 flex gap-2 safe-top">
          <button 
            onClick={() => toggleFavorite('listing', listing.id)}
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

        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center safe-top"
          style={{ left: listing.type === 'doacao' || listing.isHighlighted ? 'auto' : '1rem', right: listing.type === 'doacao' || listing.isHighlighted ? 'auto' : 'auto' }}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Conteúdo */}
      <div className="px-4 -mt-6 relative z-10">
        <div className="bg-card rounded-2xl p-4 card-shadow">
          <h1 className="text-xl font-bold text-foreground mb-2">{listing.title}</h1>
          
          {listing.type === 'venda' && listing.price && (
            <p className="text-2xl font-bold text-primary mb-3">
              {formatPrice(listing.price)}
            </p>
          )}

          <div className="flex items-center text-muted-foreground mb-4">
            <MapPin className="w-4 h-4 mr-1.5" />
            <span>{listing.neighborhood}</span>
          </div>

          {/* Descrição */}
          {listing.description && (
            <div className="py-4 border-t border-border">
              <h2 className="font-semibold text-foreground mb-2">Descrição</h2>
              <p className="text-muted-foreground">{listing.description}</p>
            </div>
          )}

          {/* Aviso de segurança */}
          <div className="mt-4 p-3 bg-secondary/20 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-secondary-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Dica de segurança</p>
              <p>Combine encontros em locais públicos e movimentados. Nunca faça pagamentos adiantados.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de ações fixa */}
      <div className="fixed bottom-16 left-0 right-0 z-50 bg-card border-t border-border p-4 safe-bottom">
        <div className="max-w-lg mx-auto">
          <WhatsAppButton 
            whatsapp={listing.whatsapp} 
            message={`Olá! Vi o anúncio "${listing.title}" no Monte de Tudo e tenho interesse.`}
            label="Chamar no WhatsApp"
            size="lg"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
