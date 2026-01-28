export interface Business {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  tags: string[];
  neighborhood: string;
  hours: string;
  phone?: string;
  whatsapp: string;
  coverImages: string[];
  isOpenNow: boolean;
  isVerified: boolean;
  description: string;
  address: string;
}

const DEFAULT_IMAGE = '/placeholder.svg';

/**
 * Tenta adivinhar a "lesma" da categoria (categorySlug) com base no nome, categoria e descrição.
 * Esta função é um fallback crucial para garantir que os negócios sejam exibidos nas seções corretas,
 * mesmo que o campo `categorySlug` não esteja explicitamente definido no banco de dados.
 */
function guessCategorySlug(rawData: any): string {
  const name = (rawData.name || '').toLowerCase();
  const category = (rawData.category || '').toLowerCase();
  const description = (rawData.description || '').toLowerCase();
  const textToSearch = `${name} ${category} ${description}`;

  // Palavras-chave para a categoria 'comer-agora'
  const foodKeywords = [
    'restaurante', 'pizza', 'pizzaria', 'comer', 'lanchonete', 'comida', 
    'bar', 'marmita', 'marmitex', 'espetinho', 'churrasco', 'açaí', 
    'sorvete', 'hamburguer', 'delivery', 'fast food', 'refeição'
  ];
  if (foodKeywords.some(key => textToSearch.includes(key))) {
    return 'comer-agora';
  }

  // Palavras-chave para a categoria 'servicos'
  const serviceKeywords = [
    'serviço', 'profissional', 'auto', 'mecânica', 'conserto', 'manutenção', 
    'consultório', 'advogado', 'contador', 'eletricista', 'encanador', 
    'pedreiro', 'salão', 'beleza', 'cabelo', 'estética', 'clínica'
  ];
  if (serviceKeywords.some(key => textToSearch.includes(key))) {
    return 'servicos';
  }

  // Se não for comida nem serviço, assume-se que é uma loja ou negócio geral.
  return 'negocios';
}

// Função helper para normalizar dados da API
export function normalizeBusinessData(rawData: any): Business {
  return {
    id: rawData.id || `temp_${Date.now()}`,
    name: rawData.name || 'Sem nome',
    category: rawData.category || 'Não categorizado',
    // Usa o `categorySlug` do banco de dados, se existir; caso contrário, usa a função para adivinhar.
    categorySlug: rawData.categorySlug || guessCategorySlug(rawData),
    tags: rawData.tags || [],
    neighborhood: rawData.neighborhood || 'Sem bairro',
    hours: rawData.hours || 'Consultar horários',
    phone: rawData.phone || undefined,
    whatsapp: rawData.whatsapp || '5535990000000',
    coverImages: rawData.coverImages?.length ? rawData.coverImages : [DEFAULT_IMAGE],
    isOpenNow: rawData.isOpenNow ?? false,
    isVerified: rawData.isVerified ?? false, // Corrigido: rawAta -> rawData
    description: rawData.description || '',
    address: rawData.address || '',
  };
}
