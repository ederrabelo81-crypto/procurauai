import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  isOpen: boolean;
  className?: string;
}

export function StatusBadge({ isOpen, className }: StatusBadgeProps) {
  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold",
        isOpen 
          ? "bg-status-open/10 text-status-open" 
          : "bg-status-closed/10 text-status-closed",
        className
      )}
    >
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        isOpen ? "bg-status-open pulse-open" : "bg-status-closed"
      )} />
      {isOpen ? 'Aberto' : 'Fechado'}
    </span>
  );
}
