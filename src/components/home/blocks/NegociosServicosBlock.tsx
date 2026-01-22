import { Link } from 'react-router-dom';
import { CategoryIcon } from '@/components/ui/CategoryIcon';

export function NegociosServicosBlock() {
  return (
    <section>
      <h2 className="text-lg font-extrabold text-foreground mb-3 tracking-tight">Negócios & Serviços</h2>

      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/categoria/negocios"
          className="flex items-center gap-3 bg-card/90 backdrop-blur-sm rounded-2xl p-4 card-shadow hover:card-shadow-hover transition-all border border-border/50 active:scale-[0.98]"
        >
          <CategoryIcon categoryId="store" size="sm" />
          <div>
            <h3 className="font-bold text-foreground text-sm">Negócios</h3>
            <p className="text-[11px] text-muted-foreground">Lojas e comércio</p>
          </div>
        </Link>

        <Link
          to="/categoria/servicos"
          className="flex items-center gap-3 bg-card/90 backdrop-blur-sm rounded-2xl p-4 card-shadow hover:card-shadow-hover transition-all border border-border/50 active:scale-[0.98]"
        >
          <CategoryIcon categoryId="services" size="sm" />
          <div>
            <h3 className="font-bold text-foreground text-sm">Serviços</h3>
            <p className="text-[11px] text-muted-foreground">Prestadores</p>
          </div>
        </Link>
      </div>
    </section>
  );
}
