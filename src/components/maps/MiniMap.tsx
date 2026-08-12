import { Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mapsStaticUrl, mapsDirectionsUrl, type LatLng } from '@/lib/maps';
import { MapPlaceholder } from './MapPlaceholder';

interface MiniMapProps {
  position: LatLng | null;
  /** Nome do local — usado no alt e no rótulo do fallback. */
  title?: string;
  label?: string;
  zoom?: number;
  /** Exibe o botão "traçar rota" sobre o mapa. */
  showDirections?: boolean;
  className?: string;
}

/**
 * Miniatura de mapa para cards e listas.
 *
 * Usa a **Maps Static API** (uma requisição de imagem) em vez de instanciar um
 * mapa interativo por card. Numa lista de 20 comércios isso troca 20 instâncias
 * da Maps JavaScript API por 20 imagens em cache do navegador — muito mais leve
 * e sensivelmente mais barato em cota.
 */
export function MiniMap({
  position,
  title,
  label,
  zoom = 15,
  showDirections = false,
  className,
}: MiniMapProps) {
  const staticUrl = position ? mapsStaticUrl(position, { zoom }) : null;

  if (!staticUrl || !position) {
    return <MapPlaceholder label={label ?? title} className={className} />;
  }

  return (
    <div className={cn('group/map relative w-full overflow-hidden bg-muted', className)}>
      <img
        src={staticUrl}
        alt={title ? `Mapa da localização de ${title}` : 'Mapa da localização'}
        className="h-full w-full object-cover transition-transform duration-500 group-hover/map:scale-[1.06]"
        loading="lazy"
        decoding="async"
      />

      {/* Véu quente para o mapa não brigar com a paleta do app */}
      <div className="pointer-events-none absolute inset-0 bg-primary/5 mix-blend-multiply dark:bg-background/25 dark:mix-blend-normal" />

      {showDirections && (
        <a
          href={mapsDirectionsUrl(position)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-md border border-border bg-card/95 px-2.5 py-1.5 text-2xs font-semibold text-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-primary/50 hover:text-primary"
        >
          <Navigation className="h-3.5 w-3.5" />
          Rota
        </a>
      )}
    </div>
  );
}
