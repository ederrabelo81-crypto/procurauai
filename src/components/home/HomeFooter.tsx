import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

const listingTypeLinks = [
  { to: '/categoria/comer-agora', label: 'Comer Agora' },
  { to: '/categoria/ofertas', label: 'Ofertas' },
  { to: '/categoria/negocios', label: 'Negócios' },
  { to: '/categoria/servicos', label: 'Serviços' },
  { to: '/empregos', label: 'Empregos' },
  { to: '/imoveis', label: 'Imóveis' },
  { to: '/categoria/classificados', label: 'Classificados' },
  { to: '/categoria/agenda', label: 'Agenda' },
];

const institutionalLinks = [
  { to: '/sobre', label: 'Sobre' },
  { to: '/contato', label: 'Contato' },
  { to: '/privacidade', label: 'Política de Privacidade' },
];

export function HomeFooter() {
  return (
    <footer className="bg-card border-t border-border mt-8 pb-24">
      <div className="px-4 py-6">
        {/* CTA destacado */}
        <Link
          to="/publicar"
          className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-primary-foreground rounded-2xl font-semibold button-shadow hover:opacity-90 transition-opacity mb-6"
        >
          <Plus className="w-5 h-5" />
          Anunciar na Cidade
        </Link>

        {/* Links por Listing Type */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Explorar</h3>
          <div className="flex flex-wrap gap-2">
            {listingTypeLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Links institucionais */}
        <div className="border-t border-border pt-4">
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            {institutionalLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            © {new Date().getFullYear()} Procura UAI. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
