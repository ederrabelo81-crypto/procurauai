import { MessageCircle, Navigation, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

type ButtonSize = 'sm' | 'md' | 'lg';

const sizeConfig: Record<ButtonSize, { button: string; icon: string }> = {
  sm: { button: 'h-10 px-3 text-sm gap-1.5 rounded-xl', icon: 'w-4 h-4' },
  md: { button: 'h-11 px-4 text-base gap-2 rounded-xl', icon: 'w-5 h-5' },
  lg: { button: 'h-12 px-5 text-base gap-2 rounded-xl', icon: 'w-5 h-5' },
};

const baseButton = 'inline-flex items-center justify-center font-semibold transition-all active:scale-95 touch-target';

// ─────────────────────────────────────────────────────────────────────────────
// WhatsApp Button (Primary CTA - filled green)
// ─────────────────────────────────────────────────────────────────────────────

interface WhatsAppButtonProps {
  whatsapp: string;
  message?: string;
  label?: string;
  size?: ButtonSize;
  className?: string;
}

export function WhatsAppButton({ 
  whatsapp, 
  message = 'Olá! Vi seu anúncio no Procura UAI.',
  label = 'WhatsApp',
  size = 'sm',
  className,
}: WhatsAppButtonProps) {
  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsapp}?text=${encodedMessage}`, '_blank');
  };

  const config = sizeConfig[size];

  return (
    <button
      onClick={handleClick}
      className={cn(
        baseButton,
        config.button,
        'bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90 button-shadow',
        className
      )}
    >
      <MessageCircle className={config.icon} strokeWidth={2} />
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Maps Button (Secondary CTA - outline)
// ─────────────────────────────────────────────────────────────────────────────

interface MapsButtonProps {
  query: string;
  label?: string;
  size?: ButtonSize;
  className?: string;
}

export function MapsButton({
  query,
  label = 'Mapa',
  size = 'sm',
  className,
}: MapsButtonProps) {
  const handleClick = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };

  const config = sizeConfig[size];

  return (
    <button
      onClick={handleClick}
      className={cn(
        baseButton,
        config.button,
        'border border-primary text-primary bg-transparent hover:bg-primary/10',
        className
      )}
    >
      <Navigation className={config.icon} strokeWidth={2} />
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Call Button (Tertiary - ghost/outline, only if phone exists)
// ─────────────────────────────────────────────────────────────────────────────

interface CallButtonProps {
  phone?: string | null;
  label?: string;
  size?: ButtonSize;
  className?: string;
}

export function CallButton({
  phone,
  label = 'Ligar',
  size = 'sm',
  className,
}: CallButtonProps) {
  const raw = (phone || '').trim();
  if (!raw) return null;

  const tel = raw.replace(/[^\d+]/g, '');
  if (!tel) return null;

  const config = sizeConfig[size];

  return (
    <a
      href={`tel:${tel}`}
      className={cn(
        baseButton,
        config.button,
        'border border-border text-foreground bg-transparent hover:bg-muted',
        className
      )}
      aria-label={`Ligar para ${raw}`}
    >
      <Phone className={config.icon} strokeWidth={2} />
      {label}
    </a>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CTA Grid (standard 2:1 layout for WhatsApp + Maps)
// ─────────────────────────────────────────────────────────────────────────────

interface CTAGridProps {
  whatsapp: string;
  mapsQuery: string;
  phone?: string | null;
  size?: ButtonSize;
  className?: string;
}

export function CTAGrid({ 
  whatsapp, 
  mapsQuery, 
  phone,
  size = 'sm',
  className 
}: CTAGridProps) {
  const hasPhone = !!(phone?.trim());
  
  return (
    <div className={cn('flex gap-2', className)}>
      <WhatsAppButton 
        whatsapp={whatsapp} 
        size={size} 
        className={hasPhone ? 'flex-1' : 'flex-[2]'} 
      />
      <MapsButton 
        query={mapsQuery} 
        size={size} 
        className="flex-1" 
      />
      {hasPhone && (
        <CallButton 
          phone={phone} 
          size={size} 
          className="flex-shrink-0" 
        />
      )}
    </div>
  );
}
