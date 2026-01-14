import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { SearchBar } from '@/components/ui/SearchBar';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { NowSection } from '@/components/home/NowSection';
import { TrendingSection } from '@/components/home/TrendingSection';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header fixo com busca */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border safe-top">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-primary">Monte de Tudo</h1>
              <p className="text-xs text-muted-foreground">Sua cidade na palma da mão</p>
            </div>
          </div>
          <SearchBar 
            size="large"
            onFocus={() => navigate('/buscar')}
          />
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="px-4 py-4 space-y-6">
        {/* Grid de categorias */}
        <section>
          <CategoryGrid />
        </section>

        {/* Seção "Agora" */}
        <NowSection />

        {/* Seção "Em alta" */}
        <TrendingSection />

        {/* CTA Publicar */}
        <section className="py-4">
          <Link
            to="/publicar"
            className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-primary/30 rounded-2xl text-primary font-semibold hover:bg-primary/5 transition-colors touch-target"
          >
            <Plus className="w-5 h-5" />
            Publicar anúncio grátis
          </Link>
        </section>
      </main>
    </div>
  );
}
