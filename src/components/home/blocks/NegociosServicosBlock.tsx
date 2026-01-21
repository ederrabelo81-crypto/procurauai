import { Link } from 'react-router-dom';
import { Store, Wrench } from 'lucide-react';

export function NegociosServicosBlock() {
  return (
    <section>
      <h2 className="text-lg font-bold text-foreground mb-3">🏪 Negócios & Serviços</h2>

      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/categoria/negocios"
          className="flex items-center gap-3 bg-card rounded-2xl p-4 card-shadow hover:card-shadow-hover transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Store className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Negócios</h3>
            <p className="text-xs text-muted-foreground">Lojas e comércio</p>
          </div>
        </Link>

        <Link
          to="/categoria/servicos"
          className="flex items-center gap-3 bg-card rounded-2xl p-4 card-shadow hover:card-shadow-hover transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
            <Wrench className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Serviços</h3>
            <p className="text-xs text-muted-foreground">Prestadores</p>
          </div>
        </Link>
      </div>
    </section>
  );
}
