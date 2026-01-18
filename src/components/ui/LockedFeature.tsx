import { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BusinessPlan } from '@/data/mockData';
import { hasFeature, getMinPlanForFeature, PLAN_INFO, type PlanFeature } from '@/lib/planUtils';

interface LockedFeatureProps {
  plan: BusinessPlan;
  feature: PlanFeature;
  children: ReactNode;
  /** Se true, mostra conteúdo blur ao invés de esconder */
  showBlurred?: boolean;
  /** Callback quando clicar no CTA */
  onUpgrade?: () => void;
  className?: string;
}

/**
 * Wrapper que exibe conteúdo bloqueado para planos sem acesso.
 * - FREE sem acesso: mostra overlay com CTA
 * - PRO/DESTAQUE: renderiza children normalmente
 */
export function LockedFeature({
  plan,
  feature,
  children,
  showBlurred = false,
  onUpgrade,
  className,
}: LockedFeatureProps) {
  const hasAccess = hasFeature(plan, feature);
  const minPlan = getMinPlanForFeature(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className={cn('relative', className)}>
      {/* Conteúdo com blur ou oculto */}
      {showBlurred ? (
        <div className="filter blur-sm pointer-events-none select-none">{children}</div>
      ) : (
        <div className="opacity-0 pointer-events-none h-0 overflow-hidden">{children}</div>
      )}

      {/* Overlay com CTA */}
      <div
        className={cn(
          'flex flex-col items-center justify-center text-center p-6 rounded-xl bg-muted/80 backdrop-blur-sm',
          showBlurred ? 'absolute inset-0' : ''
        )}
      >
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm text-foreground font-medium mb-1">
          Disponível no plano {PLAN_INFO[minPlan].label}
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Desbloqueie esta funcionalidade e atraia mais clientes
        </p>
        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className={cn(
              'px-4 py-2 rounded-lg font-semibold text-sm transition-all',
              minPlan === 'destaque'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            Ativar {PLAN_INFO[minPlan].label}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Botão de ação bloqueado com tooltip
 */
interface LockedActionButtonProps {
  plan: BusinessPlan;
  feature: PlanFeature;
  children: ReactNode;
  onUpgrade?: () => void;
  className?: string;
}

export function LockedActionButton({
  plan,
  feature,
  children,
  onUpgrade,
  className,
}: LockedActionButtonProps) {
  const hasAccess = hasFeature(plan, feature);
  const minPlan = getMinPlanForFeature(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <button
      onClick={onUpgrade}
      className={cn(
        'relative group h-12 w-12 bg-muted/50 rounded-xl flex items-center justify-center text-muted-foreground border border-dashed border-muted-foreground/30 transition-colors hover:bg-muted',
        className
      )}
      aria-label={`Disponível no plano ${PLAN_INFO[minPlan].label}`}
    >
      <Lock className="w-4 h-4" />
      {/* Tooltip */}
      <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Disponível no {PLAN_INFO[minPlan].label}
      </span>
    </button>
  );
}
