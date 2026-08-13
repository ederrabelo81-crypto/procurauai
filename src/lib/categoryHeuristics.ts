/**
 * Heurística "adivinha o listing type pelo nome/categoria do comércio".
 *
 * Esta é a **fonte única** das palavras-chave. Antes existiam três cópias
 * divergentes — `services/businesses.ts`, `lib/dataNormalization.ts` e o trigger
 * `set_business_category_slug()` em `supabase/schema.sql` — e elas classificavam
 * o mesmo comércio de formas diferentes.
 *
 * O trigger SQL continua sendo uma cópia (roda no banco, não dá para importar
 * daqui), mas `__tests__/categoryHeuristics.test.ts` compara as duas listas e
 * quebra se alguém alterar só um dos lados.
 *
 * Regras de escrita das palavras-chave:
 *  - sempre **sem acento e em minúsculas** (o texto de entrada é normalizado
 *    do mesmo jeito antes da comparação);
 *  - a comparação usa limite de palavra, então `bar` não casa com `barbearia`.
 */

export type CategorySlug = "comer-agora" | "negocios" | "servicos";

/** Comer Agora: quem serve comida pronta para consumo imediato. */
export const FOOD_KEYWORDS = [
  "acai",
  "bar",
  "boteco",
  "botequim",
  "burger",
  "cafe",
  "cafeteria",
  "choperia",
  "chopperia",
  "churrascaria",
  "churrasco",
  "confeitaria",
  "creperia",
  "doceria",
  "esfiharia",
  "espetinho",
  "gastro",
  "gastronomia",
  "hamburgueria",
  "hamburguer",
  "lanchonete",
  "lanches",
  "marmita",
  "marmitex",
  "padaria",
  "panificadora",
  "pastelaria",
  "petiscaria",
  "pizza",
  "pizzaria",
  "pub",
  "restaurante",
  "rotisseria",
  "sorveteria",
  "sushi",
  "temakeria",
] as const;

/** Negócios: comércio com ponto físico (varejo e atacado). */
export const RETAIL_KEYWORDS = [
  "acougue",
  "adega",
  "agropecuaria",
  "armazem",
  "atacadista",
  "atacado",
  "autopecas",
  "auto pecas",
  "bazar",
  "boutique",
  "calcados",
  "confeccoes",
  "deposito",
  "distribuidora",
  "drogaria",
  "eletronicos",
  "farmacia",
  "ferragens",
  "floricultura",
  "hortifruti",
  "joalheria",
  "livraria",
  "loja",
  "madeireira",
  "magazine",
  "material de construcao",
  "materiais de construcao",
  "mercado",
  "mercearia",
  "minimercado",
  "moveis",
  "otica",
  "papelaria",
  "pet shop",
  "petshop",
  "presentes",
  "quitanda",
  "relojoaria",
  "sapataria",
  "supermercado",
  "tabacaria",
  "tintas",
  "utilidades",
  "variedades",
] as const;

/** Serviços: quem vende mão de obra, atendimento ou locação. */
export const SERVICE_KEYWORDS = [
  "academia",
  "advocacia",
  "advogado",
  "arquitetura",
  "assistencia tecnica",
  "autoescola",
  "auto center",
  "autocenter",
  "barbearia",
  "borracharia",
  "cabeleireiro",
  "cartorio",
  "chaveiro",
  "clinica",
  "colegio",
  "construtora",
  "consultorio",
  "contabilidade",
  "contador",
  "corretora",
  "costureira",
  "creche",
  "dentista",
  "despachante",
  "eletricista",
  "empreiteira",
  "encanador",
  "engenharia",
  "escola",
  "estetica",
  "fisioterapia",
  "funeraria",
  "funilaria",
  "grafica",
  "guincho",
  "hotel",
  "imobiliaria",
  "laboratorio",
  "lava jato",
  "lava rapido",
  "lavanderia",
  "manicure",
  "marceneiro",
  "mecanica",
  "mecanico",
  "medico",
  "odontologia",
  "oficina",
  "pedreiro",
  "posto de combustivel",
  "posto de gasolina",
  "pousada",
  "provedor",
  "psicologo",
  "refrigeracao",
  "salao",
  "seguros",
  "serralheria",
  "terraplenagem",
  "transportadora",
  "veterinario",
  "vidracaria",
] as const;

/** Minúsculas e sem acento — o mesmo tratamento aplicado às palavras-chave. */
export function normalizeForCategoryMatch(text: string): string {
  return String(text ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Monta a regex de uma lista com limite de palavra em cada ponta. Sem isso
 * `bar` casaria dentro de "barbearia" — foi exatamente o que a versão anterior
 * tentou evitar com `bar\\b` e acabou escapando duas vezes, de modo que o termo
 * nunca casava e todo bar caía em "servicos".
 */
function buildKeywordRegex(keywords: readonly string[]): RegExp {
  const escaped = keywords.map((keyword) =>
    keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  return new RegExp(`\\b(?:${escaped.join("|")})\\b`, "i");
}

export const FOOD_REGEX = buildKeywordRegex(FOOD_KEYWORDS);
export const RETAIL_REGEX = buildKeywordRegex(RETAIL_KEYWORDS);
export const SERVICE_REGEX = buildKeywordRegex(SERVICE_KEYWORDS);

/**
 * Classifica um comércio a partir de qualquer texto que o descreva (nome,
 * categoria, descrição). A ordem importa: comida vence comércio, que vence
 * serviço — "Padaria e Mercearia" é comer-agora, "Loja de Materiais" é negócio.
 *
 * @param text     nome + categoria (+ descrição) concatenados
 * @param fallback usado quando nada casa; cada chamador tem o seu padrão
 */
export function guessCategorySlug(
  text: string,
  fallback: CategorySlug = "servicos",
): CategorySlug {
  const normalized = normalizeForCategoryMatch(text);

  if (FOOD_REGEX.test(normalized)) return "comer-agora";
  if (RETAIL_REGEX.test(normalized)) return "negocios";
  if (SERVICE_REGEX.test(normalized)) return "servicos";
  return fallback;
}
