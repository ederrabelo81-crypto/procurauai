import { Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DetailMapProps {
  address?: string;
  neighborhood?: string;
  businessName?: string;
  lat?: number;
  lng?: number;
  className?: string;
}

/**
 * Bloco de mapa com embed compacto e CTA para abrir no Maps
 * Padrão MyListing: visualização contextual + ação clara
 */
export function DetailMap({
  address,
  neighborhood,
  businessName,
  lat,
  lng,
  className,
}: DetailMapProps) {
  if (!address && !neighborhood && !lat) return null;

  const query = encodeURIComponent(`${businessName || ''} ${address || neighborhood || ''}`);
  
  const directionsUrl = lat && lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${query}`;

  const embedUrl = lat && lng
    ? `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${lat},${lng}&zoom=15`
    : `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${query}`;

  return (
    <section className={cn('space-y-3', className)}>
      <h3 className="font-semibold text-foreground">Localização</h3>
      
      {/* Mapa embed */}
      <div className="aspect-video rounded-xl overflow-hidden bg-muted">
        <iframe
          title="Mapa"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
        />
      </div>

      {/* CTA para abrir no Maps */}
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-medium transition-colors"
      >
        <Navigation className="w-5 h-5" />
        Abrir no Google Maps
      </a>
    </section>
  );
}
