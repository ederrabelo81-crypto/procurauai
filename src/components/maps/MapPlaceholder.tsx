import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapPlaceholderProps {
  /** Texto curto exibido sobre a malha, ex.: bairro ou endereço. */
  label?: string;
  className?: string;
}

/**
 * Substituto do mapa quando não há chave da API ou não há coordenadas.
 *
 * Em vez de um retângulo cinza, desenha uma malha de quarteirões em CSS —
 * mantém o bloco visualmente resolvido e coerente com o tema "almanaque".
 */
export function MapPlaceholder({ label, className }: MapPlaceholderProps) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden bg-muted',
        className
      )}
      role="img"
      aria-label={label ? `Mapa indisponível — ${label}` : 'Mapa indisponível'}
    >
      {/* Malha de quarteirões */}
      <div className="absolute inset-0 bg-grid bg-grid-cell opacity-70" />

      {/* Duas "avenidas" cruzando na diagonal */}
      <div className="absolute inset-0">
        <div className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 bg-foreground/10" />
        <div className="absolute bottom-0 left-[38%] top-0 w-[3px] bg-foreground/10" />
        <div className="absolute -left-1/4 -right-1/4 top-[68%] h-[2px] rotate-[14deg] bg-foreground/10" />
      </div>

      {/* Pino */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-primary/15">
          <MapPin className="h-4 w-4 text-primary" strokeWidth={2.2} />
        </span>
        {label && (
          <span className="max-w-[85%] truncate px-2 text-center text-2xs font-medium text-muted-foreground">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
