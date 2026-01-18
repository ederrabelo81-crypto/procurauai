import { ReactNode, useState } from 'react';
import { Star, MapPin, Clock, CheckCircle2, Heart, Share2, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { isOpenNow } from '@/lib/tagUtils';
import type { BusinessPlan } from '@/data/mockData';
import { PLAN_INFO } from '@/lib/planUtils';

interface ListingHeroProps {
  coverImage: string;
  avatar?: string;
  title: string;
  category: string;
  neighborhood: string;
  hours?: string;
  rating?: number;
  reviewCount?: number;
  priceRange?: string; // $, $$, $$$
  isVerified?: boolean;
  isFavorite?: boolean;
  plan?: BusinessPlan;
  onFavoriteToggle?: () => void;
  onShare?: () => void;
  onBack?: () => void;
  badges?: ReactNode;
}

export function ListingHero({
  coverImage,
  avatar,
  title,
  category,
  neighborhood,
  hours,
  rating,
  reviewCount,
  priceRange,
  isVerified,
  isFavorite,
  plan,
  onFavoriteToggle,
  onShare,
  onBack,
  badges,
}: ListingHeroProps) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const openStatus = hours ? isOpenNow(hours) : null;
  const statusText = openStatus === true ? 'ABERTO' : openStatus === false ? 'FECHADO' : null;
  const statusColor = openStatus === true ? 'bg-green-500' : 'bg-red-500';

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="relative">
      {/* Banner principal */}
      <div className="relative h-64 sm:h-80">
        <img
          src={imgError ? '/placeholder.svg' : coverImage}
          alt={title}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

        {/* Botões do header */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 safe-top">
          <button
            onClick={handleBack}
            className="w-10 h-10 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex gap-2">
            {onFavoriteToggle && (
              <button
                onClick={onFavoriteToggle}
                className="w-10 h-10 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
                aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                <Heart
                  className={cn('w-5 h-5', isFavorite ? 'fill-destructive text-destructive' : 'text-foreground')}
                />
              </button>
            )}
            {onShare && (
              <button
                onClick={onShare}
                className="w-10 h-10 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
                aria-label="Compartilhar"
              >
                <Share2 className="w-5 h-5 text-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Chips no topo da imagem */}
        <div className="absolute top-16 left-4 right-4 flex flex-wrap gap-2 safe-top">
          {priceRange && (
            <span className="px-2.5 py-1 bg-card/90 backdrop-blur-sm rounded-full text-xs font-bold text-foreground shadow">
              {priceRange}
            </span>
          )}
          {rating && (
            <span className="px-2.5 py-1 bg-card/90 backdrop-blur-sm rounded-full text-xs font-medium text-foreground shadow flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              {rating.toFixed(1)}
              {reviewCount && <span className="text-muted-foreground">({reviewCount})</span>}
            </span>
          )}
          {statusText && (
            <span
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-bold text-white shadow',
                statusColor
              )}
            >
              {statusText}
            </span>
          )}
          {isVerified && (
            <span className="px-2.5 py-1 bg-primary/90 backdrop-blur-sm rounded-full text-xs font-medium text-primary-foreground shadow flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verificado
            </span>
          )}
          {/* Badge de plano DESTAQUE */}
          {plan === 'destaque' && (
            <span className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-xs font-bold text-white shadow flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {PLAN_INFO.destaque.label}
            </span>
          )}
          {badges}
        </div>
      </div>

      {/* Card de informações sobreposto */}
      <div className="px-4 -mt-12 relative z-10">
        <div className="bg-card rounded-2xl p-4 shadow-lg border border-border">
          <div className="flex items-start gap-4">
            {/* Avatar/Logo */}
            {avatar && (
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0 border-2 border-background shadow-md -mt-10">
                <img src={avatar} alt={title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground truncate">{title}</h1>
                {isVerified && !avatar && <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />}
              </div>
              <p className="text-sm text-muted-foreground">{category}</p>
            </div>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {neighborhood}
            </span>
            {hours && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {hours}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
