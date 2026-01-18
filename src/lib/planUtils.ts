import type { BusinessPlan } from '@/data/mockData';

export type PlanFeature =
  | 'whatsapp'
  | 'call'
  | 'maps'
  | 'website'
  | 'schedule'
  | 'gallery'
  | 'events'
  | 'reviews'
  | 'hours'
  | 'profile';

/**
 * Define quais features estão disponíveis para cada plano
 */
const PLAN_FEATURES: Record<BusinessPlan, PlanFeature[]> = {
  free: ['whatsapp', 'maps', 'profile', 'hours'],
  pro: ['whatsapp', 'call', 'maps', 'website', 'profile', 'hours', 'gallery', 'reviews', 'events'],
  destaque: ['whatsapp', 'call', 'maps', 'website', 'schedule', 'profile', 'hours', 'gallery', 'reviews', 'events'],
};

/**
 * Verifica se um plano tem acesso a uma feature
 */
export function hasFeature(plan: BusinessPlan, feature: PlanFeature): boolean {
  return PLAN_FEATURES[plan].includes(feature);
}

/**
 * Retorna o plano mínimo necessário para uma feature
 */
export function getMinPlanForFeature(feature: PlanFeature): BusinessPlan {
  if (PLAN_FEATURES.free.includes(feature)) return 'free';
  if (PLAN_FEATURES.pro.includes(feature)) return 'pro';
  return 'destaque';
}

/**
 * Labels e descrições dos planos
 */
export const PLAN_INFO: Record<BusinessPlan, { label: string; description: string; color: string }> = {
  free: {
    label: 'Grátis',
    description: 'Presença básica no marketplace',
    color: 'bg-muted text-muted-foreground',
  },
  pro: {
    label: 'Pro',
    description: 'Mini-site completo com galeria e avaliações',
    color: 'bg-primary text-primary-foreground',
  },
  destaque: {
    label: 'Destaque',
    description: 'Máxima visibilidade + agendamento + eventos',
    color: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
  },
};

/**
 * Benefícios de upgrade por feature
 */
export const FEATURE_BENEFITS: Record<PlanFeature, { title: string; description: string }> = {
  whatsapp: {
    title: 'WhatsApp direto',
    description: 'Receba mensagens de clientes interessados diretamente no seu WhatsApp.',
  },
  call: {
    title: 'Botão Ligar',
    description: 'Permita que clientes liguem diretamente para você com um toque.',
  },
  maps: {
    title: 'Rotas no Mapa',
    description: 'Clientes encontram seu negócio facilmente com direções no mapa.',
  },
  website: {
    title: 'Link para Site',
    description: 'Direcione clientes para seu site e aumente suas conversões.',
  },
  schedule: {
    title: 'Agendamento',
    description: 'Receba agendamentos online e nunca perca um cliente.',
  },
  gallery: {
    title: 'Galeria de Fotos',
    description: 'Mostre seu negócio em detalhes com fotos ilimitadas.',
  },
  events: {
    title: 'Eventos e Promoções',
    description: 'Divulgue eventos e promoções para atrair mais clientes.',
  },
  reviews: {
    title: 'Avaliações',
    description: 'Exiba avaliações de clientes e aumente sua credibilidade.',
  },
  hours: {
    title: 'Horários',
    description: 'Mostre seus horários de funcionamento para os clientes.',
  },
  profile: {
    title: 'Perfil Completo',
    description: 'Tenha um mini-site completo com todas as informações do seu negócio.',
  },
};

/**
 * Comparação de planos para o modal de upgrade
 */
export const PLAN_COMPARISON = [
  { feature: 'WhatsApp direto', free: true, pro: true, destaque: true },
  { feature: 'Rotas no Mapa', free: true, pro: true, destaque: true },
  { feature: 'Horários de funcionamento', free: true, pro: true, destaque: true },
  { feature: 'Botão Ligar', free: false, pro: true, destaque: true },
  { feature: 'Link para Site', free: false, pro: true, destaque: true },
  { feature: 'Galeria de Fotos', free: false, pro: true, destaque: true },
  { feature: 'Avaliações de Clientes', free: false, pro: true, destaque: true },
  { feature: 'Eventos e Promoções', free: false, pro: '1 ativo', destaque: '3 ativos + fixado' },
  { feature: 'Agendamento Online', free: false, pro: false, destaque: true },
  { feature: 'Destaque na Home', free: false, pro: false, destaque: true },
  { feature: 'Badge Destaque', free: false, pro: false, destaque: true },
];
