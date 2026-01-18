import { MapPin, Clock, Phone, Globe, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isOpenNow } from '@/lib/tagUtils';

interface ContactSectionProps {
  address?: string;
  neighborhood?: string;
  hours?: string;
  phone?: string;
  email?: string;
  website?: string;
  businessName?: string;
  className?: string;
}

export function ContactSection({
  address,
  neighborhood,
  hours,
  phone,
  email,
  website,
  businessName,
  className,
}: ContactSectionProps) {
  const openStatus = hours ? isOpenNow(hours) : null;

  const handleMaps = () => {
    const query = encodeURIComponent(`${businessName || ''} ${address || neighborhood || ''}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <section className={cn('space-y-4', className)}>
      {/* Endereço */}
      {(address || neighborhood) && (
        <button
          onClick={handleMaps}
          className="flex items-start gap-3 w-full text-left p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
        >
          <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-foreground">{address || neighborhood}</p>
            <p className="text-sm text-primary">Abrir no Maps →</p>
          </div>
        </button>
      )}

      {/* Horário */}
      {hours && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
          <Clock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-foreground">{hours}</p>
            {openStatus !== null && (
              <p className={cn('text-sm font-medium', openStatus ? 'text-green-600' : 'text-red-500')}>
                {openStatus ? 'Aberto agora' : 'Fechado agora'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Telefone */}
      {phone && (
        <a
          href={`tel:${phone}`}
          className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
        >
          <Phone className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <span className="font-medium text-foreground">{phone}</span>
        </a>
      )}

      {/* Email */}
      {email && (
        <a
          href={`mailto:${email}`}
          className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
        >
          <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <span className="font-medium text-foreground">{email}</span>
        </a>
      )}

      {/* Website */}
      {website && (
        <a
          href={website.startsWith('http') ? website : `https://${website}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
        >
          <Globe className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <span className="font-medium text-primary">{website}</span>
        </a>
      )}

      {/* Mapa embed placeholder */}
      {(address || neighborhood) && (
        <div className="aspect-video rounded-xl overflow-hidden bg-muted">
          <iframe
            title="Mapa"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(
              `${businessName || ''} ${address || neighborhood || ''}`
            )}`}
          />
        </div>
      )}
    </section>
  );
}
