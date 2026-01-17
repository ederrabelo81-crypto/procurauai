// Utilitários de normalização de tags e verificação de horário

/**
 * Normaliza texto: lowercase, remove acentos, trim, remove pontuação
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/g, ' ') // Remove pontuação
    .replace(/\s+/g, ' ') // Colapsa espaços múltiplos
    .trim();
}

/**
 * Mapa de sinônimos para filtros principais
 * Chave: filtro normalizado → Array de variações normalizadas
 */
const FILTER_SYNONYMS: Record<string, string[]> = {
  entrega: ['entrega', 'delivery', 'tele entrega', 'tele-entrega', 'teleentrega', 'faz entrega'],
  
  'aceita cartao': [
    'aceita cartao', 'aceita cartão', 'cartao', 'cartão', 
    'credito', 'debito', 'crédito', 'débito',
    'pix e cartao', 'pix e cartão', 'aceita pix'
  ],
  
  agora: ['aberto agora', 'aberto', 'funcionando'],
'agora na cidade': ['aberto agora', 'aberto', 'funcionando'],
  
  'atende hoje': ['atende hoje', 'hoje', 'plantao', 'plantão'],
  
  'pet friendly': ['pet friendly', 'aceita pet', 'aceita animais', 'permite animais', 'permite pet'],
  
  '24h': ['24h', '24 horas', '24 horas por dia', 'vinte quatro horas'],
  
  'atendimento 24h': ['atendimento 24h', '24h', '24 horas', 'plantao 24h', 'plantão 24h'],
  
  'atende em domicilio': ['atende em domicilio', 'atende em domicílio', 'domicilio', 'domicílio', 'visita', 'vai ate voce'],
  
  'orcamento sem compromisso': ['orcamento sem compromisso', 'orçamento sem compromisso', 'orcamento gratis', 'orçamento grátis'],
  
  'entrada gratuita': ['entrada gratuita', 'gratis', 'gratuito', 'free', 'entrada free'],
  
  'fim de semana': ['fim de semana', 'sabado', 'sábado', 'domingo', 'final de semana'],
  
  'valido hoje': ['valido hoje', 'válido hoje', 'hoje', 'promocao do dia', 'promoção do dia'],
  
  estacionamento: ['estacionamento', 'estaciona', 'vaga', 'parking'],
  
  retirada: ['retirada', 'retirar no local', 'buscar no local'],
  
  novo: ['novo', 'lacrado', 'na caixa'],
  
  usado: ['usado', 'seminovo', 'semi novo', 'segunda mao'],
  
  doacao: ['doacao', 'doação', 'doar', 'gratis', 'gratuito'],
};

/**
 * Verifica se um item (com suas tags) corresponde a um filtro ativo
 */
export function matchesFilter(itemTags: string[], filterName: string): boolean {
  const normalizedFilter = normalizeText(filterName);
  
  // Pega os sinônimos para este filtro
  const synonyms = FILTER_SYNONYMS[normalizedFilter] || [normalizedFilter];
  
  // Normaliza todas as tags do item
  const normalizedItemTags = itemTags.map(tag => normalizeText(tag));
  
  // Verifica se alguma tag do item corresponde a algum sinônimo
  return synonyms.some(synonym => {
    const normalizedSynonym = normalizeText(synonym);
    return normalizedItemTags.some(itemTag => 
      itemTag.includes(normalizedSynonym) || normalizedSynonym.includes(itemTag)
    );
  });
}

/**
 * Verifica se um item corresponde a TODOS os filtros ativos (lógica AND)
 */
function isOpenNowFilterLabel(normalizedFilter: string) {
  return (
    normalizedFilter === 'aberto agora' ||
    normalizedFilter === 'agora' ||
    normalizedFilter === 'agora na cidade'
  );
}
export function matchesAllFilters(
  itemTags: string[], 
  activeFilters: string[],
  options?: { hours?: string; checkOpenNow?: boolean }
): boolean {
  return activeFilters.every(filter => {
    const normalizedFilter = normalizeText(filter);
    
    // Tratamento especial para "Aberto agora"
    if (isOpenNowFilterLabel(normalizedFilter) && options?.checkOpenNow) {
      const openResult = isOpenNow(options.hours || '');
      // Se não conseguimos interpretar o horário, não filtramos para fora
      if (openResult === null) return true;
      return openResult;
    }
    
    return matchesFilter(itemTags, filter);
  });
}

/**
 * Parseia string de horário e verifica se está aberto AGORA
 * Retorna: true (aberto), false (fechado), null (não interpretável)
 * 
 * Suporta formatos:
 * - "07h às 23h"
 * - "7h-23h"  
 * - "7AM-11PM"
 * - "7-11PM"
 * - "Horário: 9AM-6PM"
 * - "24 horas"
 * - "Consultar" → null
 */
export function isOpenNow(hoursString: string): boolean | null {
  if (!hoursString || hoursString.trim() === '') {
    return null;
  }

  const normalized = hoursString.toLowerCase().trim();

  // 24 horas = sempre aberto
  if (normalized.includes('24 horas') || normalized.includes('24h')) {
    return true;
  }

  // Não interpretável
  if (
    normalized.includes('consultar') || 
    normalized.includes('fechado') ||
    normalized.includes('sob agendamento') ||
    normalized.includes('sob consulta')
  ) {
    return null;
  }

  // Limpa prefixos comuns
  let cleanHours = normalized
    .replace('horário:', '')
    .replace('horario:', '')
    .replace('abre:', '')
    .replace('funciona:', '')
    .trim();

  // Tenta extrair horário de abertura e fechamento
  const timeRange = parseTimeRange(cleanHours);
  
  if (!timeRange) {
    return null;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const { openMinutes, closeMinutes } = timeRange;

  // Caso especial: atravessa meia-noite (ex: 18h às 2h)
  if (closeMinutes < openMinutes) {
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

interface TimeRange {
  openMinutes: number;
  closeMinutes: number;
}

/**
 * Parseia diversos formatos de horário para minutos desde meia-noite
 */
function parseTimeRange(hoursStr: string): TimeRange | null {
  // Remove espaços extras
  hoursStr = hoursStr.replace(/\s+/g, ' ').trim();

  // Padrões a tentar:
  // 1. "7AM-6PM" ou "9AM - 6PM"
  // 2. "7h às 23h" ou "7h-23h"
  // 3. "7-11PM" (ambos PM)
  // 4. "6:30-10:30PM"

  // Padrão AM/PM completo: "9AM-6PM" ou "9AM - 6PM"
  const ampmFullPattern = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*[-–àa]\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i;
  let match = hoursStr.match(ampmFullPattern);
  
  if (match) {
    const [, h1, m1, p1, h2, m2, p2] = match;
    const openMinutes = parseTimeToMinutes(parseInt(h1), parseInt(m1 || '0'), p1);
    const closeMinutes = parseTimeToMinutes(parseInt(h2), parseInt(m2 || '0'), p2);
    return { openMinutes, closeMinutes };
  }

  // Padrão AM/PM parcial: "7-11PM" (assume PM para ambos)
  const ampmPartialPattern = /(\d{1,2})(?::(\d{2}))?\s*[-–àa]\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i;
  match = hoursStr.match(ampmPartialPattern);
  
  if (match) {
    const [, h1, m1, h2, m2, period] = match;
    // Se o primeiro horário é maior que o segundo, o primeiro é AM
    const hour1 = parseInt(h1);
    const hour2 = parseInt(h2);
    const period1 = hour1 > hour2 ? (period.toLowerCase() === 'pm' ? 'am' : 'pm') : period;
    
    const openMinutes = parseTimeToMinutes(hour1, parseInt(m1 || '0'), period1);
    const closeMinutes = parseTimeToMinutes(hour2, parseInt(m2 || '0'), period);
    return { openMinutes, closeMinutes };
  }

  // Padrão PT-BR: "7h às 23h" ou "07h-23h" ou "7 às 23"
  const ptbrPattern = /(\d{1,2})(?::(\d{2}))?h?\s*(?:às|a|-|–)\s*(\d{1,2})(?::(\d{2}))?h?/i;
  match = hoursStr.match(ptbrPattern);
  
  if (match) {
    const [, h1, m1, h2, m2] = match;
    const openMinutes = parseInt(h1) * 60 + parseInt(m1 || '0');
    const closeMinutes = parseInt(h2) * 60 + parseInt(m2 || '0');
    return { openMinutes, closeMinutes };
  }

  return null;
}

/**
 * Converte hora no formato 12h para minutos desde meia-noite
 */
function parseTimeToMinutes(hour: number, minutes: number, period: string): number {
  let h = hour;
  const p = period.toLowerCase();
  
  if (p === 'pm' && h !== 12) {
    h += 12;
  } else if (p === 'am' && h === 12) {
    h = 0;
  }
  
  return h * 60 + minutes;
}

/**
 * Verifica se um listing corresponde aos filtros de tipo (Novo, Usado, Doação)
 */
export function matchesListingFilter(listing: { type: 'venda' | 'doacao' }, activeFilters: string[]): boolean {
  if (activeFilters.length === 0) return true;
  
  const normalizedFilters = activeFilters.map(f => normalizeText(f));
  
  // Se filtro Doação está ativo
  if (normalizedFilters.includes('doacao')) {
    if (listing.type !== 'doacao') return false;
  }
  
  // Se filtro Novo ou Usado está ativo, deve ser do tipo venda
  if (normalizedFilters.includes('novo') || normalizedFilters.includes('usado')) {
    if (listing.type !== 'venda') return false;
  }
  
  return true;
}
