import { ReactNode } from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BusinessPlan } from '@/data/mockData';
import { hasFeature, type PlanFeature } from '@/lib/planUtils';

interface LockedFeatureProps {
  plan: BusinessPlan;
  feature: PlanFeature;
  children: ReactNode;
  /** Se true, mostra conteúdo blur ao invés de esconder */
  showBlurred?: boolean;
  /** Mensagem informativa para o visitante */
  infoMessage?: string;
  className?: string;
}

/**
 * Wrapper que exibe conteúdo limitado para anúncios no plano básico.
 * Mostra mensagem INFORMATIVA para visitantes - sem CTAs de upgrade.
 * O visitante nunca é penalizado ou pressionado a pagar.
 */
export function LockedFeature({
  plan,
  feature,
  children,
  showBlurred = false,
  infoMessage = 'Este anúncio está no plano básico. Algumas informações podem não estar disponíveis.',
  className,
}: LockedFeatureProps) {
  const hasAccess = hasFeature(plan, feature);

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

      {/* Mensagem informativa - sem CTA */}
      <div
        className={cn(
          'flex flex-col items-center justify-center text-center p-6 rounded-xl bg-muted/50',
          showBlurred ? 'absolute inset-0 bg-background/60 backdrop-blur-[2px]' : ''
        )}
      >
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
          <Info className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground max-w-[280px]">
          {infoMessage}
        </p>
      </div>
    </div>
  );
}

/**
 * Componente removido - não exibimos mais botões bloqueados para visitantes.
 * As ações são simplesmente omitidas quando não disponíveis.
 */
export function LockedActionButton({
  plan,
  feature,
  children,
}: {
  plan: BusinessPlan;
  feature: PlanFeature;
  children: ReactNode;
  onUpgrade?: () => void;
  className?: string;
}) {
  const hasAccess = hasFeature(plan, feature);

  // Se tem acesso, renderiza normalmente
  // Se não tem, simplesmente não mostra nada (visitante não é penalizado)
  if (hasAccess) {
    return <>{children}</>;
  }

  return null;
}
