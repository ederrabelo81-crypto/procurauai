import { cn } from '@/lib/utils';

type Status = 'open' | 'closed' | 'unknown';

interface StatusBadgeProps {
  /**
   * Novo formato: use status.
   * - open: "Aberto"
   * - closed: "Fechado"
   * - unknown: "Horário"
   */
  status?: Status;

  /**
   * Formato antigo (mantido para compatibilidade).
   * Se `status` for informado, `isOpen` é ignorado.
   */
  isOpen?: boolean;

  className?: string;
}

export function StatusBadge({ status, isOpen, className }: StatusBadgeProps) {
  const resolved: Status = status ?? (isOpen ? 'open' : 'closed');

  // Mantemos linguagem consistente no app todo.
  // "Aberto agora" comunica melhor o estado em tempo real, alinhado ao filtro "Aberto agora".
  const label = resolved === 'open' ? 'Aberto agora' : resolved === 'closed' ? 'Fechado' : 'Horário';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold',
        resolved === 'open'
          ? 'bg-status-open/10 text-status-open'
          : resolved === 'closed'
            ? 'bg-status-closed/10 text-status-closed'
            : 'bg-muted text-muted-foreground',
        className,
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          resolved === 'open' ? 'bg-status-open pulse-open' : resolved === 'closed' ? 'bg-status-closed' : 'bg-muted-foreground',
        )}
      />
      {label}
    </span>
  );
}
