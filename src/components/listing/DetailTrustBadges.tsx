import { CheckCircle2, Clock, Shield, Star, BadgeCheck, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BusinessPlan } from '@/data/mockData';
import { PLAN_INFO } from '@/lib/planUtils';

interface DetailTrustBadgesProps {
  isVerified?: boolean;
  plan?: BusinessPlan;
  rating?: number;
  reviewCount?: number;
  updatedAt?: string;
  tags?: string[];
  className?: string;
}

/**
 * Bloco de confiança com badges, avaliação e tags principais
 * Padrão MyListing: mostrar credenciais e avaliações de forma clara
 */
export function DetailTrustBadges({
  isVerified,
  plan,
  rating,
  reviewCount,
  updatedAt,
  tags = [],
  className,
}: DetailTrustBadgesProps) {
  // Mostrar apenas as 3 primeiras tags como "principais"
  const mainTags = tags.slice(0, 3);
  
  // Formatar data de atualização
  const formatUpdated = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Atualizado hoje';
    if (diffDays === 1) return 'Atualizado ontem';
    if (diffDays < 7) return `Atualizado há ${diffDays} dias`;
    if (diffDays < 30) return `Atualizado há ${Math.floor(diffDays / 7)} semanas`;
    return null;
  };

  const hasContent = isVerified || plan !== 'free' || rating || updatedAt || mainTags.length > 0;
  if (!hasContent) return null;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {/* Badge de verificado */}
      {isVerified && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />
          Verificado
        </span>
      )}

      {/* Badge de plano PRO */}
      {plan === 'pro' && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-600 rounded-full text-sm font-medium">
          <BadgeCheck className="w-4 h-4" />
          {PLAN_INFO.pro.label}
        </span>
      )}

      {/* Badge de plano DESTAQUE */}
      {plan === 'destaque' && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 rounded-full text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          {PLAN_INFO.destaque.label}
        </span>
      )}

      {/* Avaliação */}
      {rating && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 text-yellow-700 rounded-full text-sm font-medium">
          <Star className="w-4 h-4 fill-current" />
          {rating.toFixed(1)}
          {reviewCount && <span className="text-muted-foreground">({reviewCount})</span>}
        </span>
      )}

      {/* Atualização recente */}
      {updatedAt && formatUpdated(updatedAt) && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted text-muted-foreground rounded-full text-sm">
          <Clock className="w-4 h-4" />
          {formatUpdated(updatedAt)}
        </span>
      )}

      {/* Tags principais */}
      {mainTags.map((tag) => (
        <span 
          key={tag} 
          className="px-3 py-1.5 bg-muted text-foreground rounded-full text-sm"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
