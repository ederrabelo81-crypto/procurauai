import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BusinessPlan } from '@/data/mockData';
import { PLAN_INFO } from '@/lib/planUtils';

interface PlanBadgeProps {
  plan: BusinessPlan;
  className?: string;
  showIcon?: boolean;
}

export function PlanBadge({ plan, className, showIcon = true }: PlanBadgeProps) {
  // Não mostra badge para plano free
  if (plan === 'free') return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow',
        plan === 'destaque'
          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
          : 'bg-primary/90 text-primary-foreground',
        className
      )}
    >
      {showIcon && <Sparkles className="w-3 h-3" />}
      {PLAN_INFO[plan].label}
    </span>
  );
}
