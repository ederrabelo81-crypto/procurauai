import { Navigation, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MapEmbed } from '@/components/maps';
import { buildPlaceQuery, mapsDirectionsUrl, toLatLng } from '@/lib/maps';

interface DetailMapProps {
  address?: string;
  neighborhood?: string;
  businessName?: string;
  lat?: number;
  lng?: number;
  className?: string;
}

/**
 * Bloco de localização: mapa contextual + rota em um toque.
 * Prefere coordenadas; cai para busca textual quando não houver.
 */
export function DetailMap({
  address,
  neighborhood,
  businessName,
  lat,
  lng,
  className,
}: DetailMapProps) {
  const position = toLatLng(lat, lng);
  const query = buildPlaceQuery(businessName, address || neighborhood);

  if (!position && !query) return null;

  const target = position ?? query;
  const displayAddress = address || neighborhood;

  return (
    <section className={cn('space-y-3', className)}>
      <div className="flex items-center gap-3">
        <h3 className="font-display text-lg font-bold text-foreground">Localização</h3>
        <span className="rule-line" />
      </div>

      <MapEmbed
        target={target}
        title={businessName}
        className="aspect-video overflow-hidden rounded-lg border border-border card-shadow"
      />

      {displayAddress && (
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
          <span>{displayAddress}</span>
        </p>
      )}

      <a
        href={mapsDirectionsUrl(target)}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card py-3 font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary card-shadow"
      >
        <Navigation className="h-5 w-5 transition-transform group-hover:-rotate-12" />
        Traçar rota no Google Maps
      </a>
    </section>
  );
}
