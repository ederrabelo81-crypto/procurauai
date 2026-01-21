/**
 * Central mapping of category/listing type IDs to Lucide icon names.
 * This replaces the 3D sticker PNGs with consistent line icons.
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
  type LucideIcon,
} from 'lucide-react';

// Primary mapping: listing type ID → Lucide icon
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  // Main listing types (from taxonomy.ts)
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
  
  // Legacy iconKey mappings (for backward compatibility)
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

/**
 * Get the Lucide icon for a category/listing type.
 * Falls back to ShoppingBag if not found.
 */
export function getCategoryLucideIcon(categoryId: string): LucideIcon {
  const normalized = categoryId.toLowerCase().trim();
  return CATEGORY_ICONS[normalized] ?? ShoppingBag;
}
