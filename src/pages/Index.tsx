import { useNavigate } from 'react-router-dom';
import { SearchBar } from '@/components/ui/SearchBar';
import { HomeFooter } from '@/components/home/HomeFooter';
import { LocationSelector } from '@/components/ui/LocationSelector';

// Blocos da Home - cada um renderiza condicionalmente se tiver dados
import {
  ComerAgoraBlock,
  OfertasBlock,
  NegociosServicosBlock,
  AgendaBlock,
  LugaresBlock,
  ImoveisBlock,
  EmpregosBlock,
  ClassificadosBlock,
  NoticiasBlock,
} from '@/components/home/blocks';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header fixo com busca global */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border safe-top">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1">
              <h1 className="text-xl font-extrabold text-primary tracking-tight">
                Procura UAI
              </h1>
              <LocationSelector />
            </div>
          </div>
          {/* Busca global - sempre visível */}
          <SearchBar 
            size="large"
            onFocus={() => navigate('/buscar')}
          />
        </div>
      </header>

      {/* Conteúdo principal - 9 blocos de descoberta */}
      <main className="px-4 py-4 space-y-6">
        {/* Bloco 1 - Comer Agora (apenas abertos) */}
        <ComerAgoraBlock />

        {/* Bloco 2 - Ofertas Ativas (com validade) */}
        <OfertasBlock />

        {/* Bloco 3 - Negócios & Serviços (grid de acesso rápido) */}
        <NegociosServicosBlock />

        {/* Bloco 4 - Agenda da Cidade (eventos futuros) */}
        <AgendaBlock />

        {/* Bloco 5 - Lugares para Conhecer (inspiracional) */}
        <LugaresBlock />

        {/* Bloco 6 - Imóveis em Destaque */}
        <ImoveisBlock />

        {/* Bloco 7 - Empregos Recentes */}
        <EmpregosBlock />

        {/* Bloco 8 - Classificados & Doações */}
        <ClassificadosBlock />

        {/* Bloco 9 - Notícias & Falecimentos */}
        <NoticiasBlock />
      </main>

      {/* Rodapé Mobile */}
      <HomeFooter />
    </div>
  );
}
