import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Calendar, ExternalLink } from 'lucide-react';
import { news } from '@/data/mockData';
import { HomeFooter } from '@/components/home/HomeFooter';

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
      } catch {
        // User cancelled
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank');
    }
  };

  // Notícias relacionadas
  const relatedNews = news
    .filter((n) => n.id !== article.id && n.tag === article.tag)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header com imagem (se houver) */}
      {article.image && (
        <div className="relative h-48 sm:h-64">
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

      {/* Header simples sem imagem */}
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
        <article className="bg-card rounded-2xl p-5 card-shadow">
          {/* Meta info */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${tagColors[article.tag] || 'bg-muted text-muted-foreground'}`}>
              {article.tag}
            </span>
            <span className="flex items-center text-xs text-muted-foreground">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDate(article.date)}
            </span>
          </div>
          
          {/* Título */}
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-4 leading-tight">
            {article.title}
          </h1>
          
          {/* Resumo */}
          <p className="text-muted-foreground leading-relaxed text-base">
            {article.snippet}
          </p>
          
          {/* Conteúdo expandido (mock) */}
          <div className="mt-6 pt-6 border-t border-border space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Esta é uma notícia de demonstração do aplicativo Monte de Tudo. 
              Em uma versão completa, aqui apareceria o conteúdo completo da notícia, 
              com mais parágrafos, imagens e informações relevantes para a comunidade.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              O Monte de Tudo é uma plataforma local que conecta moradores, comerciantes 
              e prestadores de serviço em uma única comunidade digital.
            </p>
          </div>
        </article>

        {/* Notícias relacionadas */}
        {relatedNews.length > 0 && (
          <section className="mt-6">
            <h2 className="font-semibold text-foreground mb-3">Mais sobre {article.tag}</h2>
            <div className="space-y-3">
              {relatedNews.map((n) => (
                <button
                  key={n.id}
                  onClick={() => navigate(`/noticia/${n.id}`)}
                  className="w-full text-left p-3 bg-card rounded-xl border border-border hover:bg-muted/50 transition-colors"
                >
                  <p className="font-medium text-foreground line-clamp-2">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(n.date)}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Botão compartilhar */}
        <button
          onClick={handleShare}
          className="w-full mt-6 py-3 bg-muted text-foreground font-medium rounded-xl hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
        >
          <Share2 className="w-5 h-5" />
          Compartilhar notícia
        </button>
      </div>

      {/* Footer */}
      <HomeFooter />
    </div>
  );
}
