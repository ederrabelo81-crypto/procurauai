// Mock Data - Monte de Tudo

export type CategoryIconKey =
  | 'food'
  | 'classifieds'
  | 'deals'
  | 'services'
  | 'events'
  | 'obituary'
  | 'news'
  | 'store';

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
  isVerified?: boolean;
  description?: string;
  address?: string;
}

export interface Listing {
  id: string;
  type: 'venda' | 'doacao';
  title: string;
  price?: number;
  neighborhood: string;
  images: string[];
  whatsapp: string;
  createdAt: string;
  description?: string;
  isHighlighted?: boolean;
}

export interface Deal {
  id: string;
  title: string;
  subtitle?: string;
  priceText: string;
  validUntil: string;
  businessId?: string;
  businessName?: string;
  image: string;
  whatsapp: string;
  isSponsored?: boolean;
}

export interface Event {
  id: string;
  title: string;
  dateTime: string;
  location: string;
  priceText: string;
  tags: string[];
  image: string;
  whatsapp?: string;
  description?: string;
}

export interface News {
  id: string;
  title: string;
  tag: string;
  snippet: string;
  date: string;
  image?: string;
}

export interface Obituary {
  id: string;
  name: string;
  age?: number;
  date: string;
  wakeLocation: string;
  burialLocation: string;
  burialDateTime: string;
  message?: string;
  status: 'pending' | 'approved';
}

// Dados Mock - Comércios e Serviços
export const businesses: Business[] = [
  {
    id: '1',
    name: 'Pizzaria do Zé',
    category: 'Pizzaria',
    categorySlug: 'comer-agora',
    tags: ['Delivery', 'Aceita cartão', 'Aberto agora'],
    neighborhood: 'Centro',
    hours: '18h às 23h',
    whatsapp: '5531999999999',
    coverImages: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop'],
    isOpenNow: true,
    isVerified: true,
    description: 'A melhor pizza da cidade! Massa artesanal e ingredientes frescos.',
    address: 'Rua das Flores, 123 - Centro',
  },
  {
    id: '2',
    name: 'Farmácia São Lucas',
    category: 'Farmácia',
    categorySlug: 'servicos',
    tags: ['Atendimento 24h', 'Delivery', 'Aceita cartão'],
    neighborhood: 'Centro',
    hours: '24 horas',
    whatsapp: '5531988888888',
    coverImages: ['https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&h=600&fit=crop'],
    isOpenNow: true,
    isVerified: true,
    description: 'Farmácia completa com plantão 24h. Tele-entrega rápida.',
    address: 'Av. Principal, 500 - Centro',
  },
  {
    id: '3',
    name: 'João Eletricista',
    category: 'Eletricista',
    categorySlug: 'servicos',
    tags: ['Atende em domicílio', 'Orçamento sem compromisso'],
    neighborhood: 'Vila Nova',
    hours: '8h às 18h',
    whatsapp: '5531977777777',
    coverImages: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=600&fit=crop'],
    isOpenNow: true,
    description: 'Instalações elétricas residenciais e comerciais. 15 anos de experiência.',
  },
  {
    id: '4',
    name: 'Restaurante Sabor Caseiro',
    category: 'Restaurante',
    categorySlug: 'comer-agora',
    tags: ['Delivery', 'Aceita cartão', 'Marmitex'],
    neighborhood: 'Centro',
    hours: '11h às 14h',
    whatsapp: '5531966666666',
    coverImages: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop'],
    isOpenNow: true,
    description: 'Comida caseira feita com amor. Buffet self-service e marmitex.',
    address: 'Rua do Comércio, 89 - Centro',
  },
  {
    id: '5',
    name: 'Pet Shop Amigo Fiel',
    category: 'Pet Shop',
    categorySlug: 'servicos',
    tags: ['Banho e tosa', 'Delivery', 'Pet friendly'],
    neighborhood: 'Jardim América',
    hours: '8h às 18h',
    whatsapp: '5531955555555',
    coverImages: ['https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&h=600&fit=crop'],
    isOpenNow: true,
    description: 'Cuidamos do seu pet com carinho! Banho, tosa, vacinas e acessórios.',
  },
  {
    id: '6',
    name: 'Barbearia Estilo',
    category: 'Barbearia',
    categorySlug: 'servicos',
    tags: ['Agendamento online', 'Aceita cartão'],
    neighborhood: 'Centro',
    hours: '9h às 19h',
    whatsapp: '5531944444444',
    coverImages: ['https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&h=600&fit=crop'],
    isOpenNow: false,
  },
  {
    id: '7',
    name: 'Açaí do Bairro',
    category: 'Açaí e Sorvetes',
    categorySlug: 'comer-agora',
    tags: ['Delivery', 'Aceita cartão'],
    neighborhood: 'Vila Nova',
    hours: '14h às 22h',
    whatsapp: '5531933333333',
    coverImages: ['https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800&h=600&fit=crop'],
    isOpenNow: true,
    isVerified: true,
  },
  {
    id: '8',
    name: 'Maria Faxineira',
    category: 'Diarista',
    categorySlug: 'servicos',
    tags: ['Atende em domicílio', 'Orçamento sem compromisso'],
    neighborhood: 'Todos os bairros',
    hours: 'Seg a Sáb',
    whatsapp: '5531922222222',
    coverImages: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop'],
    isOpenNow: true,
  },
  {
    id: '9',
    name: 'Marcenaria Arte em Madeira',
    category: 'Marcenaria',
    categorySlug: 'servicos',
    tags: ['Móveis sob medida', 'Orçamento sem compromisso'],
    neighborhood: 'Industrial',
    hours: '8h às 17h',
    whatsapp: '5531911111111',
    coverImages: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'],
    isOpenNow: true,
  },
  {
    id: '10',
    name: 'Lanchonete Bom Sabor',
    category: 'Lanchonete',
    categorySlug: 'comer-agora',
    tags: ['Delivery', 'Aceita cartão', 'Aberto agora'],
    neighborhood: 'Centro',
    hours: '17h às 23h',
    whatsapp: '5531900000000',
    coverImages: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop'],
    isOpenNow: true,
  },
];

// Dados Mock - Classificados / Bazar
export const listings: Listing[] = [
  {
    id: '1',
    type: 'venda',
    title: 'iPhone 12 64GB - Seminovo',
    price: 2200,
    neighborhood: 'Centro',
    images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop'],
    whatsapp: '5531999888777',
    createdAt: '2024-01-14',
    description: 'iPhone 12 em perfeito estado. Bateria 89%. Com caixa e carregador.',
    isHighlighted: true,
  },
  {
    id: '2',
    type: 'venda',
    title: 'Sofá 3 lugares - Cinza',
    price: 800,
    neighborhood: 'Vila Nova',
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop'],
    whatsapp: '5531999777666',
    createdAt: '2024-01-13',
    description: 'Sofá em bom estado. Pequenas marcas de uso. Motivo: mudança.',
  },
  {
    id: '3',
    type: 'doacao',
    title: 'Roupas infantis - Menina 2-4 anos',
    neighborhood: 'Jardim América',
    images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop'],
    whatsapp: '5531999666555',
    createdAt: '2024-01-14',
    description: 'Várias peças em bom estado. Retirar no local.',
  },
  {
    id: '4',
    type: 'venda',
    title: 'Bicicleta Caloi Aro 29',
    price: 1500,
    neighborhood: 'Centro',
    images: ['https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&h=600&fit=crop'],
    whatsapp: '5531999555444',
    createdAt: '2024-01-12',
    isHighlighted: true,
  },
  {
    id: '5',
    type: 'venda',
    title: 'Mesa de jantar 6 lugares',
    price: 450,
    neighborhood: 'Industrial',
    images: ['https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&h=600&fit=crop'],
    whatsapp: '5531999444333',
    createdAt: '2024-01-11',
  },
  {
    id: '6',
    type: 'doacao',
    title: 'Livros universitários - Direito',
    neighborhood: 'Centro',
    images: ['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop'],
    whatsapp: '5531999333222',
    createdAt: '2024-01-14',
  },
  {
    id: '7',
    type: 'venda',
    title: 'Geladeira Consul Frost Free',
    price: 1200,
    neighborhood: 'Vila Nova',
    images: ['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&h=600&fit=crop'],
    whatsapp: '5531999222111',
    createdAt: '2024-01-10',
  },
  {
    id: '8',
    type: 'venda',
    title: 'PlayStation 4 + 2 controles',
    price: 1800,
    neighborhood: 'Centro',
    images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=600&fit=crop'],
    whatsapp: '5531999111000',
    createdAt: '2024-01-14',
    isHighlighted: true,
  },
  {
    id: '9',
    type: 'doacao',
    title: 'Cachorro vira-lata - Dócil',
    neighborhood: 'Jardim América',
    images: ['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop'],
    whatsapp: '5531998999888',
    createdAt: '2024-01-13',
    description: 'Resgatado da rua. Vacinado e castrado. Muito carinhoso.',
  },
  {
    id: '10',
    type: 'venda',
    title: 'Fogão 4 bocas - Semi novo',
    price: 350,
    neighborhood: 'Industrial',
    images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop'],
    whatsapp: '5531998888777',
    createdAt: '2024-01-09',
  },
];

// Dados Mock - Ofertas
export const deals: Deal[] = [
  {
    id: '1',
    title: '2 Pizzas grandes por',
    subtitle: 'Qualquer sabor tradicional',
    priceText: 'R$ 59,90',
    validUntil: '2024-01-20',
    businessName: 'Pizzaria do Zé',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop',
    whatsapp: '5531999999999',
    isSponsored: true,
  },
  {
    id: '2',
    title: 'Açaí 500ml + Água de coco',
    priceText: 'R$ 18,00',
    validUntil: '2024-01-18',
    businessName: 'Açaí do Bairro',
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800&h=600&fit=crop',
    whatsapp: '5531933333333',
    isSponsored: true,
  },
  {
    id: '3',
    title: 'Corte + Barba',
    subtitle: 'Combo especial',
    priceText: 'R$ 35,00',
    validUntil: '2024-01-25',
    businessName: 'Barbearia Estilo',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&h=600&fit=crop',
    whatsapp: '5531944444444',
  },
  {
    id: '4',
    title: 'Marmitex grande',
    subtitle: 'Arroz, feijão, carne e salada',
    priceText: 'R$ 15,00',
    validUntil: '2024-01-31',
    businessName: 'Restaurante Sabor Caseiro',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
    whatsapp: '5531966666666',
  },
  {
    id: '5',
    title: 'Banho + Tosa higiênica',
    subtitle: 'Cães pequenos',
    priceText: 'R$ 45,00',
    validUntil: '2024-01-22',
    businessName: 'Pet Shop Amigo Fiel',
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&h=600&fit=crop',
    whatsapp: '5531955555555',
  },
  {
    id: '6',
    title: 'Hambúrguer artesanal',
    subtitle: '+ Batata + Refri',
    priceText: 'R$ 28,00',
    validUntil: '2024-01-19',
    businessName: 'Lanchonete Bom Sabor',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
    whatsapp: '5531900000000',
  },
];

// Dados Mock - Eventos
export const events: Event[] = [
  {
    id: '1',
    title: 'Festa Junina da Igreja Matriz',
    dateTime: '2024-06-22T18:00',
    location: 'Praça Central',
    priceText: 'Entrada gratuita',
    tags: ['Entrada gratuita', 'Família'],
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop',
    description: 'Comidas típicas, quadrilha e muita diversão para toda família!',
  },
  {
    id: '2',
    title: 'Show Sertanejo - Dupla Regional',
    dateTime: '2024-01-27T21:00',
    location: 'Clube Municipal',
    priceText: 'R$ 30,00',
    tags: ['Fim de semana', 'Música'],
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
    whatsapp: '5531997777666',
  },
  {
    id: '3',
    title: 'Feira de Artesanato',
    dateTime: '2024-01-20T08:00',
    location: 'Praça da Matriz',
    priceText: 'Entrada gratuita',
    tags: ['Entrada gratuita', 'Hoje'],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
  },
  {
    id: '4',
    title: 'Campeonato de Futebol Amador',
    dateTime: '2024-01-21T14:00',
    location: 'Estádio Municipal',
    priceText: 'R$ 5,00',
    tags: ['Fim de semana', 'Esportes'],
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop',
  },
  {
    id: '5',
    title: 'Missa de Ação de Graças',
    dateTime: '2024-01-28T19:00',
    location: 'Igreja Matriz',
    priceText: 'Entrada gratuita',
    tags: ['Entrada gratuita', 'Religioso'],
    image: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800&h=600&fit=crop',
  },
  {
    id: '6',
    title: 'Bingo Beneficente - Lar dos Idosos',
    dateTime: '2024-01-26T19:30',
    location: 'Salão Paroquial',
    priceText: 'R$ 10,00 (3 cartelas)',
    tags: ['Fim de semana', 'Beneficente'],
    image: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=800&h=600&fit=crop',
    whatsapp: '5531996666555',
  },
];

// Dados Mock - Notícias
export const news: News[] = [
  {
    id: '1',
    title: 'Prefeitura anuncia recapeamento da Av. Principal',
    tag: 'Prefeitura',
    snippet: 'Obras devem começar na próxima semana e durar 30 dias.',
    date: '2024-01-14',
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&h=600&fit=crop',
  },
  {
    id: '2',
    title: 'Campanha de vacinação contra gripe começa segunda',
    tag: 'Saúde',
    snippet: 'Postos de saúde vão funcionar das 8h às 17h.',
    date: '2024-01-14',
    image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&h=600&fit=crop',
  },
  {
    id: '3',
    title: 'Time local vence e avança nas semifinais',
    tag: 'Esportes',
    snippet: 'Vitória por 2x1 garante classificação histórica.',
    date: '2024-01-13',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop',
  },
  {
    id: '4',
    title: 'Interdição na Rua das Flores por queda de árvore',
    tag: 'Trânsito',
    snippet: 'Equipes da prefeitura já estão no local.',
    date: '2024-01-14',
  },
  {
    id: '5',
    title: 'Escola Municipal abre inscrições para 2024',
    tag: 'Comunidade',
    snippet: 'Vagas para ensino fundamental. Documentos necessários no site.',
    date: '2024-01-12',
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=600&fit=crop',
  },
  {
    id: '6',
    title: "Falta d'água programada para quinta-feira",
    tag: 'Prefeitura',
    snippet: 'Manutenção preventiva afeta bairros Centro e Vila Nova.',
    date: '2024-01-13',
  },
];

// Dados Mock - Falecimentos
export const obituaries: Obituary[] = [
  {
    id: '1',
    name: 'Maria José da Silva',
    age: 78,
    date: '2024-01-14',
    wakeLocation: 'Velório Municipal',
    burialLocation: 'Cemitério da Saudade',
    burialDateTime: '2024-01-15T10:00',
    message: 'Deixa esposo, 4 filhos e 8 netos. Missa de 7º dia na Igreja Matriz.',
    status: 'approved',
  },
  {
    id: '2',
    name: 'José Antonio Ferreira',
    age: 65,
    date: '2024-01-13',
    wakeLocation: 'Residência da família',
    burialLocation: 'Cemitério da Paz',
    burialDateTime: '2024-01-14T15:00',
    status: 'approved',
  },
  {
    id: '3',
    name: 'Ana Paula Oliveira',
    age: 45,
    date: '2024-01-12',
    wakeLocation: 'Velório Municipal',
    burialLocation: 'Cemitério da Saudade',
    burialDateTime: '2024-01-13T09:00',
    message: 'Família agradece as manifestações de carinho.',
    status: 'approved',
  },
];

// Categorias do app
export const categories: Array<{ id: string; name: string; iconKey: CategoryIconKey; color: string }> = [
  { id: 'comer-agora', name: 'Comer Agora', iconKey: 'food', color: 'category-food' },
  { id: 'classificados', name: 'Classificados', iconKey: 'classifieds', color: 'category-classifieds' },
  { id: 'ofertas', name: 'Ofertas', iconKey: 'deals', color: 'category-deals' },
  { id: 'servicos', name: 'Serviços', iconKey: 'services', color: 'category-services' },
  { id: 'agenda', name: 'Agenda', iconKey: 'events', color: 'category-events' },
  { id: 'falecimentos', name: 'Falecimentos', iconKey: 'obituary', color: 'category-obituary' },
  { id: 'noticias', name: 'Notícias', iconKey: 'news', color: 'category-news' },
  { id: 'negocios', name: 'Negócios', iconKey: 'store', color: 'category-store' },
];

// Filtros por categoria
export const filtersByCategory: Record<string, string[]> = {
  'comer-agora': ['Delivery', 'Aberto agora', 'Aceita cartão'],
  servicos: ['Atende em domicílio', 'Orçamento sem compromisso', 'Atendimento 24h', 'Pet friendly'],
  classificados: ['Novo', 'Usado', 'Doação'],
  agenda: ['Entrada gratuita', 'Hoje', 'Fim de semana'],
  ofertas: ['Válido hoje', 'Delivery'],
};
