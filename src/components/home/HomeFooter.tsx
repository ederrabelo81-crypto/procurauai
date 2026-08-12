import { Link } from 'react-router-dom';
import { Plus, MapPin } from 'lucide-react';

/**
 * Links para TODOS os Listing Types do sistema.
 * Garante que nenhum tipo fique inacessível.
 *
 * IMPORTANTE: Ao adicionar novo Listing Type, incluir aqui também.
 */
const listingTypeLinks = [
  // Principais (mais acessados)
  { to: '/categoria/comer-agora', label: 'Comer Agora' },
  { to: '/categoria/negocios', label: 'Negócios' },
  { to: '/categoria/servicos', label: 'Serviços' },
  { to: '/categoria/ofertas', label: 'Ofertas' },
  { to: '/categoria/agenda', label: 'Agenda' },
  // Verticais especializadas
  { to: '/imoveis', label: 'Imóveis' },
  { to: '/empregos', label: 'Empregos' },
  { to: '/carros', label: 'Carros' },
  // Classificados e conteúdo
  { to: '/categoria/classificados', label: 'Classificados' },
  { to: '/lugares', label: 'Lugares' },
  { to: '/categoria/noticias', label: 'Notícias' },
  { to: '/categoria/falecimentos', label: 'Falecimentos' },
];

const institutionalLinks = [
  { to: '/sobre', label: 'Sobre' },
  { to: '/contato', label: 'Contato' },
  { to: '/privacidade', label: 'Política de Privacidade' },
];

export function HomeFooter() {
  return (
    <footer className="relative mt-12 overflow-hidden border-t-2 border-foreground/15 bg-card pb-24">
      <span aria-hidden className="pointer-events-none absolute inset-0 bg-hatch opacity-30" />

      <div className="relative px-4 py-8">
        {/* Chamada para anunciar */}
        <div className="mb-8 rounded-lg border border-primary/25 bg-primary/8 p-5">
          <p className="eyebrow mb-2 text-primary">Para comerciantes</p>
          <h2 className="font-display text-2xl font-bold leading-tight text-foreground">
            Sua loja no bolso de toda a cidade.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Cadastre seu comércio, publique ofertas e apareça para quem está
            procurando agora.
          </p>
          <Link
            to="/publicar"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground button-shadow transition-all hover:brightness-110 active:translate-y-0.5 active:shadow-none"
          >
            <Plus className="h-5 w-5" />
            Anunciar na cidade
          </Link>
        </div>

        {/* Índice do almanaque */}
        <div className="mb-8">
          <p className="eyebrow mb-3 text-muted-foreground">Índice</p>
          <div className="grid grid-cols-2 gap-x-4 sm:grid-cols-3">
            {listingTypeLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="group flex items-baseline gap-2 border-b border-dashed border-border py-2.5 text-sm text-foreground transition-colors hover:text-primary"
              >
                <span className="font-medium">{link.label}</span>
                <span className="rule-line" />
              </Link>
            ))}
          </div>
        </div>

        {/* Rodapé institucional */}
        <div className="border-t border-border pt-5">
          <img
            src="/logo.svg"
            alt="Procura UAI"
            className="logo-mark mb-3 h-9 w-auto object-contain object-left"
          />

          <p className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            Monte Santo de Minas e região — Sul de Minas, MG
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {institutionalLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <p className="mt-5 font-mono text-2xs uppercase tracking-widest text-muted-foreground">
            © {new Date().getFullYear()} Procura UAI
          </p>
        </div>
      </div>
    </footer>
  );
}
