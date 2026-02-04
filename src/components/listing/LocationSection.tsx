import { Clock, MapPin, Phone, Globe, Instagram, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isOpenNow } from '@/lib/tagUtils';

interface LocationSectionProps {
  address?: string;
  neighborhood?: string;
  hours?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  businessName?: string;
  className?: string;
}

/**
 * Airbnb-style location section with map and essential info
 */
export function LocationSection({
  address,
  neighborhood,
  hours,
  phone,
  website,
  instagram,
  businessName,
  className,
}: LocationSectionProps) {
  const openStatus = hours ? isOpenNow(hours) : null;
  const fullAddress = address || neighborhood;

  const handleMaps = () => {
    const query = encodeURIComponent(`${businessName || ''} ${fullAddress || ''}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className={cn('py-8 space-y-6', className)}>
      <h2 className="text-xl font-semibold text-foreground">Onde você estará</h2>
      
      {/* Map */}
      {fullAddress && (
        <div className="aspect-[2/1] md:aspect-[3/1] rounded-xl overflow-hidden bg-muted">
          <iframe
            title="Localização"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(
              `${businessName || ''} ${fullAddress || ''}`
            )}`}
          />
        </div>
      )}
      
      {/* Address */}
      {fullAddress && (
        <button
          onClick={handleMaps}
          className="text-left group"
        >
          <p className="font-medium text-foreground group-hover:underline">{fullAddress}</p>
          <p className="text-sm text-muted-foreground mt-1">Clique para abrir no Google Maps</p>
        </button>
      )}

      {/* Essential info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        {/* Hours */}
        {hours && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-border">
            <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">{hours}</p>
              {openStatus !== null && (
                <p className={cn(
                  'text-sm font-medium mt-1',
                  openStatus ? 'text-green-600' : 'text-red-500'
                )}>
                  {openStatus ? 'Aberto agora' : 'Fechado agora'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Phone */}
        {phone && (
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors"
          >
            <Phone className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <span className="font-medium text-foreground">{phone}</span>
          </a>
        )}

        {/* Website */}
        {website && (
          <a
            href={website.startsWith('http') ? website : `https://${website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors"
          >
            <Globe className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <span className="font-medium text-foreground truncate">{website}</span>
          </a>
        )}

        {/* Instagram */}
        {instagram && (
          <a
            href={instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors"
          >
            <Instagram className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <span className="font-medium text-foreground">{instagram}</span>
          </a>
        )}
      </div>
    </div>
  );
}
