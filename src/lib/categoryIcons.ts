/**
 * CENTRAL MAPPING: Listing Type IDs → Lucide Icons
 * 
 * Este é o ÚNICO arquivo que define ícones para Listing Types.
 * Todos os componentes DEVEM consumir getCategoryLucideIcon().
 * 
 * REGRA: Nenhum card pode depender de ícone implícito ou inferido.
 * FALLBACK: Se não encontrar, retorna Grid (ícone genérico).
 */

import {
  Utensils,
  Store,
  Wrench,
  ShoppingBag,
  BadgePercent,
  Calendar,
  MapPin,
  Home,
  Newspaper,
  Heart,
  Car,
  Briefcase,
  Grid,
  type LucideIcon,
} from 'lucide-react';

// ============= MAPEAMENTO OBRIGATÓRIO =============
// Todos os 12 Listing Types do sistema

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  // ===== Listing Types Principais (IDs canônicos) =====
  'comer-agora': Utensils,
  'negocios': Store,
  'servicos': Wrench,
  'classificados': ShoppingBag,
  'ofertas': BadgePercent,
  'agenda': Calendar,
  'lugares': MapPin,
  'imoveis': Home,
  'noticias': Newspaper,
  'falecimentos': Heart,
  'carros': Car,
  'empregos': Briefcase,
  
  // ===== Legacy iconKey mappings (backward compatibility) =====
  'food': Utensils,
  'store': Store,
  'services': Wrench,
  'classifieds': ShoppingBag,
  'deals': BadgePercent,
  'events': Calendar,
  'places': MapPin,
  'realestate': Home,
  'news': Newspaper,
  'obituary': Heart,
  'cars': Car,
  'jobs': Briefcase,
};

// Ícone de fallback para segurança
const FALLBACK_ICON: LucideIcon = Grid;

/**
 * Retorna o ícone Lucide para um Listing Type.
 * 
 * GARANTIA: Nunca retorna undefined.
 * Se não encontrar, retorna Grid como fallback seguro.
 * 
 * @param categoryId - ID do listing type ou iconKey legado
 * @returns LucideIcon correspondente ou Grid como fallback
 */
export function getCategoryLucideIcon(categoryId: string): LucideIcon {
  if (!categoryId) return FALLBACK_ICON;
  
  const normalized = categoryId.toLowerCase().trim();
  return CATEGORY_ICONS[normalized] ?? FALLBACK_ICON;
}

/**
 * Verifica se um ID possui ícone mapeado.
 * Útil para debugging e validação.
 */
export function hasIconMapping(categoryId: string): boolean {
  if (!categoryId) return false;
  const normalized = categoryId.toLowerCase().trim();
  return normalized in CATEGORY_ICONS;
}

/**
 * Lista todos os Listing Types que possuem ícone.
 * Útil para validação e QA.
 */
export function getAllMappedListingTypes(): string[] {
  return Object.keys(CATEGORY_ICONS).filter(key => 
    // Retorna apenas IDs canônicos (não legados)
    !['food', 'store', 'services', 'classifieds', 'deals', 'events', 'places', 'realestate', 'news', 'obituary', 'cars', 'jobs'].includes(key)
  );
}
