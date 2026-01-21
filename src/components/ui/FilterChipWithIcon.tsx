import { Clock, Tag, Utensils, MapPin, Briefcase, Home, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterChipWithIconProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

// Mapeamento de filtros para ícones
const FILTER_ICONS: Record<string, React.ElementType> = {
  'aberto agora': Clock,
  'delivery': Utensils,
  'oferta': Tag,
  'ofertas': Tag,
  'desconto': Tag,
  'perto de mim': MapPin,
  'urgente': Zap,
  'destaque': Star,
  'vaga': Briefcase,
  'aluguel': Home,
  'venda': Home,
};

function getIconForFilter(label: string): React.ElementType | null {
  const normalizedLabel = label.toLowerCase().trim();
  
  for (const [key, icon] of Object.entries(FILTER_ICONS)) {
    if (normalizedLabel.includes(key)) {
      return icon;
    }
  }
  
  return null;
}

export function FilterChipWithIcon({ 
  label, 
  isActive = false, 
  onClick,
  className 
}: FilterChipWithIconProps) {
  const Icon = getIconForFilter(label);

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
        isActive
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        className
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </button>
  );
}
