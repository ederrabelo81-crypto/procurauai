import type { Business } from "@/data/mockData";

export function getBusinessTags(b: Business): string[] {
  const tags = getBusinessTags(business);

  // Ajuste os nomes dos campos conforme seu mockData:
  if ((b as any).acceptsCard) tags.add("Aceita Cartão");
  if ((b as any).delivery) tags.add("Entrega");
  if ((b as any).eatNow) tags.add("Comer Agora");

  // Serviços:
  if ((b as any).homeService) tags.add("Atende em domicílio");
  if ((b as any).freeQuote) tags.add("Orçamento sem compromisso");
  if ((b as any).service24h) tags.add("Atendimento 24h");
  if ((b as any).petFriendly) tags.add("Pet friendly");

  return Array.from(tags);
}
