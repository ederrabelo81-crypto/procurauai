import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map } from 'lucide-react';
import { SearchBar } from '@/components/ui/SearchBar';
import { LocationSelector } from '@/components/ui/LocationSelector';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Link } from 'react-router-dom';

/**
 * Cabeçalho da home no formato de cabeçalho de jornal de cidade pequena:
 * data por extenso, marca, filete duplo e a manchete acima da busca.
 */
export function CityMasthead() {
  const navigate = useNavigate();

  const today = useMemo(
    () =>
      new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
      }).format(new Date()),
    []
  );

  return (
    <header className="relative overflow-hidden border-b-2 border-foreground/15 bg-card/60 safe-top">
      {/* Hachura de fundo, bem discreta */}
      <span aria-hidden className="pointer-events-none absolute inset-0 bg-hatch opacity-40" />

      <div className="relative px-4 pb-5 pt-3">
        {/* Linha 1 — data, marca e utilitários */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow truncate text-muted-foreground">{today}</p>
            <img
              src="/logo.svg"
              alt="Procura UAI"
              className="logo-mark mt-1 h-11 w-auto object-contain object-left"
            />
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            <Link
              to="/mapa"
              aria-label="Abrir o mapa da cidade"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              <Map className="h-5 w-5" />
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {/* Filete duplo do cabeçalho */}
        <div aria-hidden className="mb-4 space-y-[2px]">
          <div className="h-[2px] bg-foreground/25" />
          <div className="h-px bg-foreground/15" />
        </div>

        {/* Manchete */}
        <h1 className="display-wonky mb-1 text-[2rem] leading-[0.95] text-foreground">
          Tudo que a cidade
          <br />
          tem, <span className="text-primary">num lugar só.</span>
        </h1>

        <div className="mb-4 mt-2">
          <LocationSelector />
        </div>

        <SearchBar size="large" onFocus={() => navigate('/buscar')} />
      </div>
    </header>
  );
}
