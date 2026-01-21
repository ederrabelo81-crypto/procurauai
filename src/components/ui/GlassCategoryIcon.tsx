import { cn } from '@/lib/utils';
import { getCategoryLucideIcon, hasIconMapping } from '@/lib/categoryIcons';

export type GlassCategorySize = 'xs' | 'sm' | 'md' | 'lg';

interface GlassCategoryIconProps {
  categoryId: string;
  size?: GlassCategorySize;
  className?: string;
}

const sizeConfig: Record<GlassCategorySize, { container: string; icon: string; strokeWidth: number }> = {
  xs: { container: 'w-8 h-8 rounded-xl', icon: 'w-4 h-4', strokeWidth: 2 },
  sm: { container: 'w-10 h-10 rounded-xl', icon: 'w-5 h-5', strokeWidth: 2 },
  md: { container: 'w-12 h-12 rounded-2xl', icon: 'w-6 h-6', strokeWidth: 2 },
  lg: { container: 'w-14 h-14 rounded-2xl', icon: 'w-7 h-7', strokeWidth: 2 },
};

// Category color mapping for glassmorphism effect
const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  // Comer Agora - Orange
  'food': { bg: 'bg-orange-500/12', border: 'border-orange-500/20', text: 'text-orange-600' },
  'comer-agora': { bg: 'bg-orange-500/12', border: 'border-orange-500/20', text: 'text-orange-600' },
  
  // Negócios - Blue
  'store': { bg: 'bg-blue-500/12', border: 'border-blue-500/20', text: 'text-blue-600' },
  'negocios': { bg: 'bg-blue-500/12', border: 'border-blue-500/20', text: 'text-blue-600' },
  
  // Serviços - Purple
  'services': { bg: 'bg-purple-500/12', border: 'border-purple-500/20', text: 'text-purple-600' },
  'servicos': { bg: 'bg-purple-500/12', border: 'border-purple-500/20', text: 'text-purple-600' },
  
  // Classificados - Emerald
  'classifieds': { bg: 'bg-emerald-500/12', border: 'border-emerald-500/20', text: 'text-emerald-600' },
  'classificados': { bg: 'bg-emerald-500/12', border: 'border-emerald-500/20', text: 'text-emerald-600' },
  
  // Ofertas - Yellow
  'deals': { bg: 'bg-yellow-500/12', border: 'border-yellow-500/20', text: 'text-yellow-600' },
  'ofertas': { bg: 'bg-yellow-500/12', border: 'border-yellow-500/20', text: 'text-yellow-600' },
  
  // Agenda/Events - Pink
  'events': { bg: 'bg-pink-500/12', border: 'border-pink-500/20', text: 'text-pink-600' },
  'agenda': { bg: 'bg-pink-500/12', border: 'border-pink-500/20', text: 'text-pink-600' },
  
  // Notícias - Sky
  'news': { bg: 'bg-sky-500/12', border: 'border-sky-500/20', text: 'text-sky-600' },
  'noticias': { bg: 'bg-sky-500/12', border: 'border-sky-500/20', text: 'text-sky-600' },
  
  // Falecimentos - Slate
  'obituary': { bg: 'bg-slate-500/12', border: 'border-slate-500/20', text: 'text-slate-600' },
  'falecimentos': { bg: 'bg-slate-500/12', border: 'border-slate-500/20', text: 'text-slate-600' },
  
  // Lugares - Teal
  'places': { bg: 'bg-teal-500/12', border: 'border-teal-500/20', text: 'text-teal-600' },
  'lugares': { bg: 'bg-teal-500/12', border: 'border-teal-500/20', text: 'text-teal-600' },
  
  // Carros - Red
  'cars': { bg: 'bg-red-500/12', border: 'border-red-500/20', text: 'text-red-600' },
  'carros': { bg: 'bg-red-500/12', border: 'border-red-500/20', text: 'text-red-600' },
  
  // Empregos - Indigo
  'jobs': { bg: 'bg-indigo-500/12', border: 'border-indigo-500/20', text: 'text-indigo-600' },
  'empregos': { bg: 'bg-indigo-500/12', border: 'border-indigo-500/20', text: 'text-indigo-600' },
  
  // Imóveis - Amber
  'realestate': { bg: 'bg-amber-500/12', border: 'border-amber-500/20', text: 'text-amber-600' },
  'imoveis': { bg: 'bg-amber-500/12', border: 'border-amber-500/20', text: 'text-amber-600' },
};

// Fallback colors for unmapped categories
const defaultColors = { bg: 'bg-primary/12', border: 'border-primary/20', text: 'text-primary' };

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
