import { cn } from '@/lib/utils';
import { getCategoryLucideIcon, hasIconMapping } from '@/lib/categoryIcons';

export type GlassCategorySize = 'xs' | 'sm' | 'md' | 'lg';

interface GlassCategoryIconProps {
  categoryId: string;
  size?: GlassCategorySize;
  className?: string;
}

const sizeConfig: Record<GlassCategorySize, { container: string; icon: string; strokeWidth: number }> = {
  xs: { container: 'w-8 h-8 rounded-lg', icon: 'w-4 h-4', strokeWidth: 2 },
  sm: { container: 'w-10 h-10 rounded-lg', icon: 'w-5 h-5', strokeWidth: 2 },
  md: { container: 'w-12 h-12 rounded-lg', icon: 'w-6 h-6', strokeWidth: 2 },
  lg: { container: 'w-14 h-14 rounded-lg', icon: 'w-7 h-7', strokeWidth: 2 },
};

// Category color mapping for glassmorphism effect
const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  // Comer Agora - Orange
  'food': { bg: 'bg-category-food/12', border: 'border-category-food/30', text: 'text-category-food' },
  'comer-agora': { bg: 'bg-category-food/12', border: 'border-category-food/30', text: 'text-category-food' },
  
  // Negócios - Blue
  'store': { bg: 'bg-primary/12', border: 'border-primary/30', text: 'text-primary' },
  'negocios': { bg: 'bg-primary/12', border: 'border-primary/30', text: 'text-primary' },
  
  // Serviços - Purple
  'services': { bg: 'bg-category-services/12', border: 'border-category-services/30', text: 'text-category-services' },
  'servicos': { bg: 'bg-category-services/12', border: 'border-category-services/30', text: 'text-category-services' },
  
  // Classificados - Emerald
  'classifieds': { bg: 'bg-category-classifieds/12', border: 'border-category-classifieds/30', text: 'text-category-classifieds' },
  'classificados': { bg: 'bg-category-classifieds/12', border: 'border-category-classifieds/30', text: 'text-category-classifieds' },
  
  // Ofertas - Yellow
  'deals': { bg: 'bg-category-deals/12', border: 'border-category-deals/30', text: 'text-category-deals' },
  'ofertas': { bg: 'bg-category-deals/12', border: 'border-category-deals/30', text: 'text-category-deals' },
  
  // Agenda/Events - Pink
  'events': { bg: 'bg-category-events/12', border: 'border-category-events/30', text: 'text-category-events' },
  'agenda': { bg: 'bg-category-events/12', border: 'border-category-events/30', text: 'text-category-events' },
  
  // Notícias - Sky
  'news': { bg: 'bg-category-news/12', border: 'border-category-news/30', text: 'text-category-news' },
  'noticias': { bg: 'bg-category-news/12', border: 'border-category-news/30', text: 'text-category-news' },
  
  // Falecimentos - Slate
  'obituary': { bg: 'bg-category-obituary/12', border: 'border-category-obituary/30', text: 'text-category-obituary' },
  'falecimentos': { bg: 'bg-category-obituary/12', border: 'border-category-obituary/30', text: 'text-category-obituary' },
  
  // Lugares - Teal
  'places': { bg: 'bg-secondary/12', border: 'border-secondary/30', text: 'text-secondary' },
  'lugares': { bg: 'bg-secondary/12', border: 'border-secondary/30', text: 'text-secondary' },
  
  // Carros - Red
  'cars': { bg: 'bg-destructive/12', border: 'border-destructive/30', text: 'text-destructive' },
  'carros': { bg: 'bg-destructive/12', border: 'border-destructive/30', text: 'text-destructive' },
  
  // Empregos - Indigo
  'jobs': { bg: 'bg-category-classifieds/12', border: 'border-category-classifieds/30', text: 'text-category-classifieds' },
  'empregos': { bg: 'bg-category-classifieds/12', border: 'border-category-classifieds/30', text: 'text-category-classifieds' },
  
  // Imóveis - Amber
  'realestate': { bg: 'bg-category-deals/12', border: 'border-category-deals/30', text: 'text-category-deals' },
  'imoveis': { bg: 'bg-category-deals/12', border: 'border-category-deals/30', text: 'text-category-deals' },
};

// Fallback colors for unmapped categories
const defaultColors = { bg: 'bg-primary/12', border: 'border-primary/30', text: 'text-primary' };

/**
 * Premium Glassmorphism category icon using Lucide icons.
 * 
 * GARANTIAS:
 * - Nunca renderiza espaço vazio (fallback para Grid icon)
 * - Consistente em tamanho e espaçamento
 * - Cores mapeadas por categoria
 */
export function GlassCategoryIcon({ categoryId, size = 'md', className }: GlassCategoryIconProps) {
  const sizeStyles = sizeConfig[size];
  const normalizedId = categoryId?.toLowerCase().trim() || '';
  const colors = categoryColors[normalizedId] || defaultColors;
  const Icon = getCategoryLucideIcon(categoryId);

  // Debug: log se não encontrou mapeamento (apenas em dev)
  if (process.env.NODE_ENV === 'development' && categoryId && !hasIconMapping(categoryId)) {
    console.warn(`[GlassCategoryIcon] Sem mapeamento para: "${categoryId}" - usando fallback`);
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center aspect-square',
        'backdrop-blur-sm border',
        'transition-all duration-200',
        sizeStyles.container,
        colors.bg,
        colors.border,
        className
      )}
    >
      <Icon
        className={cn(sizeStyles.icon, colors.text)}
        strokeWidth={sizeStyles.strokeWidth}
      />
    </div>
  );
}

export { GlassCategoryIcon as default };
