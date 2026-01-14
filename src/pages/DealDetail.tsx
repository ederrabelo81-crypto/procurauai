import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Share2, Store } from 'lucide-react';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { deals } from '@/data/mockData';

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const deal = deals.find(d => d.id === id);

  if (!deal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Oferta não encontrada</p>
      </div>
    );
  }

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
      } catch (e) {
        // User cancelled
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header com imagem */}
      <div className="relative h-56">
        <img 
          src={deal.image} 
          alt={deal.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        
        {/* Badge patrocinado */}
        {deal.isSponsored && (
          <div className="absolute top-4 left-4 bg-foreground/70 text-background px-3 py-1 rounded text-xs font-medium safe-top">
            Patrocinado
          </div>
        )}
        
        {/* Botões do header */}
        <div className="absolute top-4 right-4 flex gap-2 safe-top">
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
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Conteúdo */}
      <div className="px-4 -mt-6 relative z-10">
        <div className="bg-card rounded-2xl p-4 card-shadow">
          <h1 className="text-xl font-bold text-foreground mb-1">{deal.title}</h1>
          {deal.subtitle && (
            <p className="text-muted-foreground mb-3">{deal.subtitle}</p>
          )}
          
          <p className="text-3xl font-bold text-primary mb-4">{deal.priceText}</p>

          {/* Info */}
          <div className="space-y-3 py-4 border-t border-border">
            <div className="flex items-center text-foreground">
              <Clock className="w-5 h-5 mr-3 text-muted-foreground flex-shrink-0" />
              <span>Válido até {formatDate(deal.validUntil)}</span>
            </div>
            {deal.businessName && (
              <div className="flex items-center text-foreground">
                <Store className="w-5 h-5 mr-3 text-muted-foreground flex-shrink-0" />
                <span>{deal.businessName}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra de ações fixa */}
      <div className="fixed bottom-16 left-0 right-0 z-50 bg-card border-t border-border p-4 safe-bottom">
        <div className="max-w-lg mx-auto">
          <WhatsAppButton 
            whatsapp={deal.whatsapp} 
            message={`Olá! Vi a oferta "${deal.title}" no Monte de Tudo e quero aproveitar!`}
            label="Quero essa oferta!"
            size="lg"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
