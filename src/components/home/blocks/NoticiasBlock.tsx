import { Link } from 'react-router-dom';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { news, obituaries } from '@/data/mockData';
import { Calendar, Newspaper } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function NoticiasBlock() {
  // Notícias mais recentes (prioridade visual)
  const latestNews = [...news]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  // Falecimentos recentes (exibição discreta)
  const recentObituaries = obituaries
    .filter((o) => o.status === 'approved')
    .slice(0, 2);

  // Se não há nem notícias nem falecimentos, não renderiza
  if (latestNews.length === 0 && recentObituaries.length === 0) {
    return null;
  }

  return (
    <section>
      <SectionHeader
        title="📰 Notícias & Falecimentos"
        action={{ label: 'Ver mais', to: '/categoria/noticias' }}
      />

      <div className="space-y-4">
        {/* Notícias - Prioridade visual */}
        {latestNews.length > 0 && (
          <div className="space-y-3">
            {latestNews.map((item) => (
              <Link
                key={item.id}
                to={`/noticia/${item.id}`}
                className="flex bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all"
              >
                {item.image && (
                  <div className="w-24 h-20 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex-1 p-3 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-medium rounded">
                      {item.tag}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Calendar className="w-3 h-3" />
                      {format(parseISO(item.date), 'd MMM', { locale: ptBR })}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm line-clamp-2">
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Falecimentos - Exibição discreta e respeitosa */}
        {recentObituaries.length > 0 && (
          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-muted-foreground">🕊️ Falecimentos</span>
              <Link
                to="/categoria/falecimentos"
                className="text-xs text-primary hover:underline"
              >
                Ver todos
              </Link>
            </div>
            <div className="space-y-2">
              {recentObituaries.map((obituary) => (
                <Link
                  key={obituary.id}
                  to={`/falecimento/${obituary.id}`}
                  className="block bg-muted/50 rounded-xl p-3 hover:bg-muted transition-colors"
                >
                  <p className="font-medium text-foreground text-sm">
                    {obituary.name}
                    {obituary.age && <span className="text-muted-foreground font-normal">, {obituary.age} anos</span>}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sepultamento: {obituary.burialLocation}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
