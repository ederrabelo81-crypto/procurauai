// ==================== TAG UTILITIES ====================
// Central utility for normalizing and formatting tags

/**
 * Normalizes a tag/filter string to canonical internal format
 * - trim, lowercase, remove accents, replace spaces/hyphens with _, remove special chars
 */
export function normalizeTag(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[\s-]+/g, '_')          // Replace spaces and hyphens with _
    .replace(/[^a-z0-9_]/g, '');      // Remove special characters
}

/**
 * Dictionary for special formatting cases
 */
const TAG_LABELS: Record<string, string> = {
  // Places
  por_do_sol: 'Pôr do sol',
  pet_friendly: 'Pet friendly',
  familia: 'Família',
  romantico: 'Romântico',
  gratis: 'Grátis',
  trilha: 'Trilha',
  cultura: 'Cultura',
  historia: 'História',
  natureza: 'Natureza',
  gastronomia: 'Gastronomia',
  criancas: 'Crianças',
  acessivel: 'Acessível',
  estacionamento: 'Estacionamento',
  fim_de_semana: 'Fim de semana',
  
  // Cars
  unico_dono: 'Único dono',
  baixo_km: 'Baixa km',
  baixa_km: 'Baixa km',
  ipva_ok: 'IPVA OK',
  pneus_novos: 'Pneus novos',
  concessionaria: 'Concessionária',
  particular: 'Particular',
  financiamento: 'Financiamento',
  troca: 'Aceita troca',
  revisado: 'Revisado',
  garantia: 'Garantia',
  economico: 'Econômico',
  blindado: 'Blindado',
  diesel: 'Diesel',
  
  // Jobs
  home_office: 'Home office',
  sem_experiencia: 'Sem experiência',
  primeiro_emprego: 'Primeiro emprego',
  meio_periodo: 'Meio período',
  vaga_pcd: 'Vaga PCD',
  urgente: 'Urgente',
  comissao: 'Comissão',
  beneficios: 'Benefícios',
  noturno: 'Noturno',
  clt: 'CLT',
  pj: 'PJ',
  estagio: 'Estágio',
  freelancer: 'Freelancer',
  presencial: 'Presencial',
  hibrido: 'Híbrido',
  remoto: 'Remoto',
  
  // Real Estate
  mobiliado: 'Mobiliado',
  semimobiliado: 'Semimobiliado',
  vazio: 'Vazio',
  portaria_24h: 'Portaria 24h',
  condominio: 'Condomínio',
  varanda: 'Varanda',
  piscina: 'Piscina',
  academia: 'Academia',
  churrasqueira: 'Churrasqueira',
  proximo_metro: 'Próximo ao metrô',
  novo: 'Novo',
  reformado: 'Reformado',
  alugar: 'Alugar',
  comprar: 'Comprar',
  apartamento: 'Apartamento',
  casa: 'Casa',
  kitnet: 'Kitnet',
  terreno: 'Terreno',
  comercial: 'Comercial',
  
  // General
  entrega: 'Entrega',
  whatsapp: 'WhatsApp',
  site: 'Site',
  bem_avaliado: 'Bem avaliado',
  aberto_agora: 'Aberto agora',
  aceita_cartao: 'Aceita cartão',
  agendamento: 'Agendamento',
};

/**
 * Converts internal tag (snake_case) to human-readable label
 */
export function formatTag(tag: string): string {
  const normalized = normalizeTag(tag);
  
  // Check dictionary first
  if (TAG_LABELS[normalized]) {
    return TAG_LABELS[normalized];
  }
  
  // Fallback: replace _ with spaces and capitalize first letter
  return tag
    .replace(/_/g, ' ')
    .replace(/^\w/, c => c.toUpperCase());
}

/**
 * Filter definition with key (normalized) and label (display)
 */
export interface FilterOption {
  key: string;
  label: string;
}

/**
 * Converts array of display labels to FilterOptions with normalized keys
 */
export function createFilterOptions(labels: string[]): FilterOption[] {
  return labels.map(label => ({
    key: normalizeTag(label),
    label
  }));
}

/**
 * Field-based filter mappings for specific categories
 * These filters match against object properties, not tags
 */
export const FIELD_FILTERS: Record<string, Record<string, { field: string; value: string }>> = {
  imoveis: {
    alugar: { field: 'transactionType', value: 'alugar' },
    comprar: { field: 'transactionType', value: 'comprar' },
    apartamento: { field: 'propertyType', value: 'apartamento' },
    casa: { field: 'propertyType', value: 'casa' },
    kitnet: { field: 'propertyType', value: 'kitnet' },
    terreno: { field: 'propertyType', value: 'terreno' },
    comercial: { field: 'propertyType', value: 'comercial' },
  },
  carros: {
    concessionaria: { field: 'sellerType', value: 'concessionaria' },
    particular: { field: 'sellerType', value: 'particular' },
  },
  empregos: {
    clt: { field: 'employmentType', value: 'CLT' },
    pj: { field: 'employmentType', value: 'PJ' },
    estagio: { field: 'employmentType', value: 'Estágio' },
    freelancer: { field: 'employmentType', value: 'Freelancer' },
    presencial: { field: 'workModel', value: 'presencial' },
    hibrido: { field: 'workModel', value: 'hibrido' },
    remoto: { field: 'workModel', value: 'remoto' },
  },
  lugares: {
    gratis: { field: 'priceLevel', value: 'Grátis' },
  },
};

/**
 * Check if item matches a filter
 * First checks field-based filters, then falls back to tag matching
 */
export function matchesFilter(
  item: Record<string, any>,
  filterKey: string,
  category: string
): boolean {
  const fieldFilters = FIELD_FILTERS[category];
  
  // Check field-based filter first
  if (fieldFilters && fieldFilters[filterKey]) {
    const { field, value } = fieldFilters[filterKey];
    const itemValue = item[field];
    
    if (typeof itemValue === 'string') {
      return normalizeTag(itemValue) === normalizeTag(value);
    }
    return itemValue === value;
  }
  
  // Fall back to tag matching
  const tags = item.tags as string[] | undefined;
  if (!tags) return false;
  
  return tags.some(tag => normalizeTag(tag) === filterKey);
}

/**
 * Check if item matches ALL active filters
 */
export function matchesAllFilters(
  item: Record<string, any>,
  activeFilters: string[],
  category: string
): boolean {
  if (activeFilters.length === 0) return true;
  return activeFilters.every(filter => matchesFilter(item, filter, category));
}

/**
 * Check if item matches ANY active filter (OR logic)
 */
export function matchesAnyFilter(
  item: Record<string, any>,
  activeFilters: string[],
  category: string
): boolean {
  if (activeFilters.length === 0) return true;
  return activeFilters.some(filter => matchesFilter(item, filter, category));
}

/**
 * Sort options by category
 */
export const SORT_OPTIONS: Record<string, { key: string; label: string }[]> = {
  lugares: [
    { key: 'rating', label: 'Mais bem avaliados' },
    { key: 'free_first', label: 'Grátis primeiro' },
  ],
  carros: [
    { key: 'price_asc', label: 'Menor preço' },
    { key: 'price_desc', label: 'Maior preço' },
    { key: 'year_desc', label: 'Mais novo' },
  ],
  empregos: [
    { key: 'recent', label: 'Mais recentes' },
  ],
  imoveis: [
    { key: 'price_asc', label: 'Menor preço' },
    { key: 'price_desc', label: 'Maior preço' },
    { key: 'rent_first', label: 'Aluguel primeiro' },
  ],
};

/**
 * Sort items based on sort key
 */
export function sortItems<T extends Record<string, any>>(
  items: T[],
  sortKey: string,
  category: string
): T[] {
  const sorted = [...items];
  
  switch (sortKey) {
    case 'rating':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'free_first':
      return sorted.sort((a, b) => {
        const aFree = a.priceLevel === 'Grátis' ? 0 : 1;
        const bFree = b.priceLevel === 'Grátis' ? 0 : 1;
        return aFree - bFree;
      });
    case 'price_asc':
      return sorted.sort((a, b) => {
        const aPrice = a.price || a.rentPrice || 0;
        const bPrice = b.price || b.rentPrice || 0;
        return aPrice - bPrice;
      });
    case 'price_desc':
      return sorted.sort((a, b) => {
        const aPrice = a.price || a.rentPrice || 0;
        const bPrice = b.price || b.rentPrice || 0;
        return bPrice - aPrice;
      });
    case 'year_desc':
      return sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
    case 'recent':
      return sorted.sort((a, b) => {
        const aDate = new Date(a.postedAt || 0).getTime();
        const bDate = new Date(b.postedAt || 0).getTime();
        return bDate - aDate;
      });
    case 'rent_first':
      return sorted.sort((a, b) => {
        const aRent = a.transactionType === 'alugar' ? 0 : 1;
        const bRent = b.transactionType === 'alugar' ? 0 : 1;
        return aRent - bRent;
      });
    default:
      return sorted;
  }
}
