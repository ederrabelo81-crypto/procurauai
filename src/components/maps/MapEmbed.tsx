import { cn } from '@/lib/utils';
import { mapsEmbedUrl, type LatLng } from '@/lib/maps';
import { MapPlaceholder } from './MapPlaceholder';

interface MapEmbedProps {
  /** Coordenadas quando existirem; caso contrário, busca textual. */
  target: LatLng | string | null;
  title?: string;
  zoom?: number;
  className?: string;
}

/**
 * Mapa embutido (Maps Embed API) para páginas de detalhe.
 *
 * A chave vem de `@/lib/maps` — nunca embutida no componente. Sem chave, cai
 * no `MapPlaceholder` em vez de renderizar um iframe que retornaria erro.
 */
export function MapEmbed({ target, title, zoom = 15, className }: MapEmbedProps) {
  const src = target ? mapsEmbedUrl(target, { zoom }) : null;

  if (!src) {
    const label =
      typeof target === 'string' && target ? target : title ?? undefined;
    return <MapPlaceholder label={label} className={className} />;
  }

  return (
    <div className={cn('relative w-full overflow-hidden bg-muted', className)}>
      <iframe
        title={title ? `Mapa — ${title}` : 'Mapa da localização'}
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
