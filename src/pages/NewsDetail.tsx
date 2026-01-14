import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Calendar } from 'lucide-react';
import { news } from '@/data/mockData';

const tagColors: Record<string, string> = {
  'Prefeitura': 'bg-primary/10 text-primary',
  'Saúde': 'bg-status-open/10 text-status-open',
  'Esportes': 'bg-category-events/10 text-category-events',
  'Trânsito': 'bg-secondary/80 text-secondary-foreground',
  'Comunidade': 'bg-category-services/10 text-category-services',
};

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const article = news.find(n => n.id === id);

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Notícia não encontrada</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) return 'Hoje';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = article.title;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, text, url });
      } catch (e) {
        // User cancelled
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      {article.image && (
        <div className="relative h-48">
          <img 
            src={article.image} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
          
          <button 
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-10 h-10 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center safe-top"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <button 
            onClick={handleShare}
            className="absolute top-4 right-4 w-10 h-10 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center safe-top"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      )}

      {!article.image && (
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border safe-top">
          <div className="px-4 py-3 flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleShare}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </header>
      )}

      {/* Conteúdo */}
      <div className={`px-4 ${article.image ? '-mt-6 relative z-10' : 'pt-4'}`}>
        <div className="bg-card rounded-2xl p-4 card-shadow">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tagColors[article.tag] || 'bg-muted text-muted-foreground'}`}>
              {article.tag}
            </span>
            <span className="flex items-center text-xs text-muted-foreground">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDate(article.date)}
            </span>
          </div>
          
          <h1 className="text-xl font-bold text-foreground mb-4">{article.title}</h1>
          
          <p className="text-muted-foreground leading-relaxed">{article.snippet}</p>
          
          {/* Conteúdo expandido (mock) */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-muted-foreground leading-relaxed">
              Esta é uma notícia de demonstração do aplicativo Monte de Tudo. 
              Em uma versão completa, aqui apareceria o conteúdo completo da notícia, 
              com mais parágrafos, imagens e informações relevantes para a comunidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
