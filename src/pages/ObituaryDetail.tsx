import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Calendar, MapPin, Clock } from 'lucide-react';
import { obituaries } from '@/data/mockData';

export default function ObituaryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const obituary = obituaries.find(o => o.id === id);

  if (!obituary) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Registro não encontrado</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long',
      year: 'numeric'
    });
  };

  const formatBurialDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.toLocaleDateString('pt-BR', { 
      weekday: 'long',
      day: '2-digit', 
      month: 'long' 
    });
    const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return { day: day.charAt(0).toUpperCase() + day.slice(1), time };
  };

  const { day, time } = formatBurialDateTime(obituary.burialDateTime);

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Nota de Falecimento: ${obituary.name}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Nota de Falecimento', text, url });
      } catch (e) {
        // User cancelled
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header simples e respeitoso */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border safe-top">
        <div className="px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-medium text-muted-foreground">Nota de Falecimento</h1>
          <button 
            onClick={handleShare}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="px-4 py-6">
        <div className="bg-card rounded-2xl p-6 card-shadow border-l-4 border-muted-foreground/30">
          {/* Nome e idade */}
          <div className="text-center mb-6 pb-6 border-b border-border">
            <h1 className="text-2xl font-bold text-foreground mb-1">{obituary.name}</h1>
            {obituary.age && (
              <p className="text-muted-foreground">{obituary.age} anos</p>
            )}
          </div>

          {/* Informações */}
          <div className="space-y-4">
            <div className="flex items-start">
              <Calendar className="w-5 h-5 mr-3 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Falecimento</p>
                <p className="text-foreground font-medium">{formatDate(obituary.date)}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <MapPin className="w-5 h-5 mr-3 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Velório</p>
                <p className="text-foreground font-medium">{obituary.wakeLocation}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock className="w-5 h-5 mr-3 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Sepultamento</p>
                <p className="text-foreground font-medium">{day} às {time}</p>
                <p className="text-muted-foreground">{obituary.burialLocation}</p>
              </div>
            </div>
          </div>

          {/* Mensagem */}
          {obituary.message && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-muted-foreground italic text-center leading-relaxed">
                "{obituary.message}"
              </p>
            </div>
          )}

          {/* Status pendente */}
          {obituary.status === 'pending' && (
            <div className="mt-6 p-3 bg-status-pending/10 rounded-xl text-center">
              <p className="text-sm text-status-pending font-medium">
                ⏳ Pendente de verificação
              </p>
            </div>
          )}
        </div>

        {/* Botão compartilhar */}
        <button
          onClick={handleShare}
          className="w-full mt-4 py-4 bg-muted text-muted-foreground font-medium rounded-xl hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
        >
          <Share2 className="w-5 h-5" />
          Compartilhar no WhatsApp
        </button>

        {/* Mensagem de condolências */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Nossos sentimentos à família e amigos.
        </p>
      </div>
    </div>
  );
}
