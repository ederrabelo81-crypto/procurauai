import { Phone, MessageCircle, Navigation, Globe, Share2, Calendar, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BusinessPlan } from '@/data/mockData';
import { hasFeature } from '@/lib/planUtils';

interface ListingActionsBarProps {
  whatsapp?: string;
  phone?: string;
  address?: string;
  businessName?: string;
  website?: string;
  mapsUrl?: string;
  onShare?: () => void;
  onSchedule?: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
  className?: string;
  /** Plano do negócio para controlar ações disponíveis */
  plan?: BusinessPlan;
  /** Ação primária customizada */
  primaryAction?: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    color?: 'primary' | 'whatsapp' | 'default';
  };
}

export function ListingActionsBar({
  whatsapp,
  phone,
  address,
  businessName,
  website,
  mapsUrl,
  onShare,
  onSchedule,
  onFavorite,
  isFavorite,
  className,
  plan = 'pro',
  primaryAction,
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
    if (mapsUrl) {
      window.open(mapsUrl, '_blank');
    } else if (address || businessName) {
      const query = encodeURIComponent(`${businessName || ''} ${address || ''}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
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
  const hasWhatsApp = whatsapp;
  const hasAddress = address || mapsUrl;
  const hasPhone = phone && canCall;
  const hasWebsiteAction = website && canWebsite;
  const hasSchedule = onSchedule && canSchedule;
  const hasPrimary = primaryAction;

  const hasVisibleActions = hasPrimary || hasWhatsApp || hasPhone || hasAddress || hasWebsiteAction || hasSchedule || onShare || onFavorite;
  if (!hasVisibleActions) return null;

  const getPrimaryColor = (color?: 'primary' | 'whatsapp' | 'default') => {
    switch (color) {
      case 'whatsapp':
        return 'bg-[#25D366] hover:bg-[#22c55e] text-white';
      case 'primary':
        return 'bg-primary hover:bg-primary/90 text-primary-foreground';
      default:
        return 'bg-muted hover:bg-muted/80 text-foreground';
    }
  };

  return (
    <div
      className={cn(
        'fixed bottom-16 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border p-3 safe-bottom',
        className
      )}
    >
      <div className="flex items-center gap-2 max-w-lg mx-auto">
        {/* Ação primária customizada ou WhatsApp padrão */}
        {primaryAction ? (
          <button
            onClick={primaryAction.onClick}
            className={cn(
              'flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors shadow-lg',
              getPrimaryColor(primaryAction.color)
            )}
          >
            {primaryAction.icon}
            <span>{primaryAction.label}</span>
          </button>
        ) : whatsapp ? (
          <button
            onClick={handleWhatsApp}
            className="flex-1 h-12 bg-[#25D366] hover:bg-[#22c55e] text-white rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors shadow-lg"
            aria-label="Chamar no WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
        ) : null}

        {/* Mapa - sempre disponível */}
        {hasAddress && (
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
        {hasPhone && (
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
        {hasWebsiteAction && (
          <button
            onClick={handleWebsite}
            className="h-12 w-12 bg-muted hover:bg-muted/80 rounded-xl flex items-center justify-center text-foreground transition-colors"
            aria-label="Abrir site"
          >
            <Globe className="w-5 h-5" />
          </button>
        )}

        {/* Agendar - apenas DESTAQUE */}
        {hasSchedule && (
          <button
            onClick={onSchedule}
            className="h-12 w-12 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 rounded-xl flex items-center justify-center transition-colors"
            aria-label="Agendar"
          >
            <Calendar className="w-5 h-5" />
          </button>
        )}

        {/* Favoritar */}
        {onFavorite && (
          <button
            onClick={onFavorite}
            className="h-12 w-12 bg-muted hover:bg-muted/80 rounded-xl flex items-center justify-center text-foreground transition-colors"
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart className={cn('w-5 h-5', isFavorite && 'fill-destructive text-destructive')} />
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
