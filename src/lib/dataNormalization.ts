interface Business {
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

function guessCategorySlug(rawData: any): string {
  const name = (rawData.name || '').toLowerCase();
  const category = (rawData.category || '').toLowerCase();
  if (category.includes('restaurante') || category.includes('pizza') || name.includes('comer')) {
    return 'comer-agora';
  }
  if (category.includes('serviço') || category.includes('profissional')) {
    return 'servicos';
  }
  return 'negocios'; // Slug padrão
}

// Função helper para normalizar dados da API
function normalizeBusinessData(rawData: any): Business {
  return {
    id: rawData.id || `temp_${Date.now()}`,
    name: rawData.name || 'Sem nome',
    category: rawData.category || 'Não categorizado',
    categorySlug: rawData.categorySlug || guessCategorySlug(rawData),
    tags: rawData.tags || [],
    neighborhood: rawData.neighborhood || 'Sem bairro',
    hours: rawData.hours || 'Consultar horários',
    phone: rawData.phone || undefined,
    whatsapp: rawData.whatsapp || '5535990000000',
    coverImages: rawData.coverImages?.length ? rawData.coverImages : [DEFAULT_IMAGE],
    isOpenNow: rawData.isOpenNow ?? false,
    isVerified: rawData.isVerified ?? false,
    description: rawData.description || '',
    address: rawData.address || '',
  };
}
