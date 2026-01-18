import { useState } from 'react';
import { X, Check, Sparkles, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BusinessPlan } from '@/data/mockData';
import { PLAN_INFO, PLAN_COMPARISON, type PlanFeature, FEATURE_BENEFITS } from '@/lib/planUtils';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: BusinessPlan;
  lockedFeature?: PlanFeature;
  businessName?: string;
}

export function UpgradeModal({
  isOpen,
  onClose,
  currentPlan,
  lockedFeature,
  businessName,
}: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'destaque'>('pro');

  if (!isOpen) return null;

  const featureBenefit = lockedFeature ? FEATURE_BENEFITS[lockedFeature] : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-card z-10 p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-foreground">Ativar mini-site</h2>
              <p className="text-sm text-muted-foreground">Transforme visitas em contatos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Benefício da feature bloqueada */}
          {featureBenefit && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{featureBenefit.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{featureBenefit.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Seletor de plano */}
          <div className="grid grid-cols-2 gap-3">
            {(['pro', 'destaque'] as const).map((plan) => (
              <button
                key={plan}
                onClick={() => setSelectedPlan(plan)}
                className={cn(
                  'relative p-4 rounded-xl border-2 text-left transition-all',
                  selectedPlan === plan
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/30'
                )}
              >
                {plan === 'destaque' && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full">
                    POPULAR
                  </span>
                )}
                <div
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mb-2',
                    plan === 'pro' ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-600'
                  )}
                >
                  {PLAN_INFO[plan].label}
                </div>
                <p className="text-sm text-muted-foreground">{PLAN_INFO[plan].description}</p>
              </button>
            ))}
          </div>

          {/* Comparação de features */}
          <div className="bg-muted/50 rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-3 text-sm">Compare os planos</h3>
            <div className="space-y-2">
              {PLAN_COMPARISON.map((row) => {
                const value = row[selectedPlan];
                const hasFeature = value === true || (typeof value === 'string' && value !== '');
                return (
                  <div
                    key={row.feature}
                    className={cn(
                      'flex items-center justify-between py-1.5 text-sm',
                      !hasFeature && 'opacity-50'
                    )}
                  >
                    <span className="text-foreground">{row.feature}</span>
                    {hasFeature ? (
                      typeof value === 'string' ? (
                        <span className="text-primary font-medium text-xs">{value}</span>
                      ) : (
                        <Check className="w-4 h-4 text-green-500" />
                      )
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <button
            className={cn(
              'w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg',
              selectedPlan === 'destaque'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                : 'bg-primary hover:bg-primary/90'
            )}
          >
            Ativar {PLAN_INFO[selectedPlan].label} agora
          </button>

          {/* Texto de segurança */}
          <p className="text-center text-xs text-muted-foreground">
            Cancele quando quiser • Suporte humanizado
          </p>
        </div>
      </div>
    </div>
  );
}
