import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Share2, Clock, Ticket } from 'lucide-react';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { events } from '@/data/mockData';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const event = events.find(e => e.id === id);

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Evento não encontrado</p>
      </div>
    );
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.toLocaleDateString('pt-BR', { 
      weekday: 'long',
      day: '2-digit', 
      month: 'long' 
    });
    const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return { day: day.charAt(0).toUpperCase() + day.slice(1), time };
  };

  const { day, time } = formatDateTime(event.dateTime);

  const handleShare = async () => {
    const url = window.location.href;
    const text = `${event.title} - ${day} às ${time}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, text, url });
      } catch (e) {
        // User cancelled
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank');
    }
  };

  const handleDirections = () => {
    const query = encodeURIComponent(event.location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header com imagem */}
      <div className="relative h-56">
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        
        {/* Badge grátis */}
        {event.priceText === 'Entrada gratuita' && (
          <div className="absolute top-4 left-4 bg-status-open text-white px-3 py-1.5 rounded-lg text-sm font-bold safe-top">
            GRÁTIS
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
          <h1 className="text-xl font-bold text-foreground mb-3">{event.title}</h1>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags.map((tag) => (
              <span 
                key={tag}
                className="px-3 py-1 bg-accent text-accent-foreground text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Info */}
          <div className="space-y-3 py-4 border-t border-border">
            <div className="flex items-center text-foreground">
              <Calendar className="w-5 h-5 mr-3 text-muted-foreground flex-shrink-0" />
              <span>{day}</span>
            </div>
            <div className="flex items-center text-foreground">
              <Clock className="w-5 h-5 mr-3 text-muted-foreground flex-shrink-0" />
              <span>{time}</span>
            </div>
            <button 
              onClick={handleDirections}
              className="flex items-center text-primary hover:underline"
            >
              <MapPin className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>{event.location}</span>
            </button>
            <div className="flex items-center text-foreground">
              <Ticket className="w-5 h-5 mr-3 text-muted-foreground flex-shrink-0" />
              <span className="font-semibold">{event.priceText}</span>
            </div>
          </div>

          {/* Descrição */}
          {event.description && (
            <div className="py-4 border-t border-border">
              <h2 className="font-semibold text-foreground mb-2">Sobre o evento</h2>
              <p className="text-muted-foreground">{event.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Barra de ações fixa */}
      {event.whatsapp && (
        <div className="fixed bottom-16 left-0 right-0 z-50 bg-card border-t border-border p-4 safe-bottom">
          <div className="flex gap-3 max-w-lg mx-auto">
            <WhatsAppButton 
              whatsapp={event.whatsapp} 
              message={`Olá! Vi o evento "${event.title}" no Monte de Tudo e quero saber mais!`}
              label="Mais informações"
              size="lg"
              className="flex-1"
            />
            <button
              onClick={handleShare}
              className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <Share2 className="w-6 h-6 text-foreground" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
