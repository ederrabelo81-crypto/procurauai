import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  action?: {
    label: string;
    to: string;
  };
  className?: string;
}

export function SectionHeader({ title, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-3", className)}>
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      {action && (
        <Link 
          to={action.to}
          className="flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors touch-target"
        >
          {action.label}
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </Link>
      )}
    </div>
  );
}
