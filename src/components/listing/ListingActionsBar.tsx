import { Phone, MessageCircle, Navigation, Globe, Share2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BusinessPlan } from '@/data/mockData';
import { hasFeature } from '@/lib/planUtils';

interface ListingActionsBarProps {
  whatsapp?: string;
  phone?: string;
  address?: string;
  businessName?: string;
  website?: string;
  onShare?: () => void;
  onSchedule?: () => void;
  className?: string;
  /** Plano do negócio para controlar ações disponíveis */
  plan?: BusinessPlan;
}

export function ListingActionsBar({
  whatsapp,
  phone,
  address,
  businessName,
  website,
  onShare,
  onSchedule,
  className,
  plan = 'pro',
}: ListingActionsBarProps) {
  const handleWhatsApp = () => {
    if (whatsapp) {
      const msg = encodeURIComponent(`Olá! Vi no Monte de Tudo e gostaria de mais informações.`);
      window.open(`https://wa.me/${whatsapp}?text=${msg}`, '_blank');
    }
  };

  const handleCall = () => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    }
  };

  const handleMaps = () => {
    const query = encodeURIComponent(`${businessName || ''} ${address || ''}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleWebsite = () => {
    if (website) {
      const url = website.startsWith('http') ? website : `https://${website}`;
      window.open(url, '_blank');
    }
  };

  // Verifica features disponíveis pelo plano
  const canCall = hasFeature(plan, 'call');
  const canWebsite = hasFeature(plan, 'website');
  const canSchedule = hasFeature(plan, 'schedule');

  // Se não tem ações disponíveis, não renderiza
  const hasVisibleActions = whatsapp || (phone && canCall) || address || (website && canWebsite) || (onSchedule && canSchedule) || onShare;
  if (!hasVisibleActions) return null;

  return (
    <div
      className={cn(
        'fixed bottom-16 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border p-3 safe-bottom',
        className
      )}
    >
      <div className="flex items-center gap-2 max-w-lg mx-auto">
        {/* WhatsApp - botão principal (sempre disponível) */}
        {whatsapp && (
          <button
            onClick={handleWhatsApp}
            className="flex-1 h-12 bg-[#25D366] hover:bg-[#22c55e] text-white rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors shadow-lg"
            aria-label="Chamar no WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
        )}

        {/* Mapa - sempre disponível */}
        {address && (
          <button
            onClick={handleMaps}
            className="h-12 w-12 sm:w-auto sm:px-4 bg-muted hover:bg-muted/80 rounded-xl flex items-center justify-center gap-2 text-foreground transition-colors"
            aria-label="Ver no mapa"
          >
            <Navigation className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-medium">Mapa</span>
          </button>
        )}

        {/* Ligar - apenas se plano permite */}
        {phone && canCall && (
          <button
            onClick={handleCall}
            className="h-12 w-12 sm:w-auto sm:px-4 bg-muted hover:bg-muted/80 rounded-xl flex items-center justify-center gap-2 text-foreground transition-colors"
            aria-label="Ligar"
          >
            <Phone className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-medium">Ligar</span>
          </button>
        )}

        {/* Website - apenas se plano permite */}
        {website && canWebsite && (
          <button
            onClick={handleWebsite}
            className="h-12 w-12 bg-muted hover:bg-muted/80 rounded-xl flex items-center justify-center text-foreground transition-colors"
            aria-label="Abrir site"
          >
            <Globe className="w-5 h-5" />
          </button>
        )}

        {/* Agendar - apenas DESTAQUE */}
        {onSchedule && canSchedule && (
          <button
            onClick={onSchedule}
            className="h-12 w-12 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 rounded-xl flex items-center justify-center transition-colors"
            aria-label="Agendar"
          >
            <Calendar className="w-5 h-5" />
          </button>
        )}

        {/* Compartilhar - sempre disponível */}
        {onShare && (
          <button
            onClick={onShare}
            className="h-12 w-12 bg-muted hover:bg-muted/80 rounded-xl flex items-center justify-center text-foreground transition-colors"
            aria-label="Compartilhar"
          >
            <Share2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
