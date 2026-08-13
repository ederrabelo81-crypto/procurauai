/**
 * Leitura e reescrita da descrição gerada na carga inicial dos comércios.
 *
 * O formato gravado era:
 *   "Beauty salon em Centro. Nota: 4.400000 (21 avaliações)."
 *
 * Três problemas: o tipo vem em inglês, a nota sai com as seis casas decimais
 * do Postgres e o plural de "avaliações" não acompanha a contagem. O formato
 * novo é:
 *   "Salão de beleza em Centro. Nota 4,4 (21 avaliações)."
 *
 * Com zero avaliações a frase da nota some — "Nota 0,0 (0 avaliações)" passa a
 * impressão de comércio mal avaliado, quando o caso é ninguém ter avaliado.
 */

import { isTranslatedType, translateGoogleType } from "./googleTypes.mjs";

/**
 * `<tipo> em <local>. Nota: <n> (<m> avaliações).`
 * O tipo é opcional: 8 registros da base foram gravados sem ele
 * ("em Centro. Nota: 0.000000 (0 avaliações).").
 */
const DESCRIPTION_PATTERN =
  /^(?<type>.*?)\s*\bem\s+(?<place>.+?)\.\s*Nota:?\s*(?<rating>[\d.,]+)\s*\((?<reviews>\d+)\s*avalia(?:ção|ções)\)\.?$/i;

/** Divide a descrição no template. Devolve null quando não casa. */
export function parseDescription(description) {
  const match = String(description ?? "").trim().match(DESCRIPTION_PATTERN);
  if (!match) return null;

  const { type, place, rating, reviews } = match.groups;

  return {
    type: type.trim(),
    place: place.trim(),
    rating: Number(String(rating).replace(",", ".")),
    reviewsCount: Number(reviews),
  };
}

/** Number(null) e Number("") valem 0 — aqui ausência não é zero. */
function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

/** Nota com uma casa decimal e vírgula, como o resto da interface em pt-BR. */
export function formatRating(rating) {
  const value = toNumber(rating);
  if (value === null) return null;
  return value.toFixed(1).replace(".", ",");
}

/** "1 avaliação" / "21 avaliações". */
export function formatReviewCount(count) {
  const value = toNumber(count);
  if (value === null) return null;
  return `${value} ${value === 1 ? "avaliação" : "avaliações"}`;
}

/**
 * Remonta a descrição em pt-BR.
 *
 * @param {object}  parts
 * @param {string}  parts.type         tipo do comércio (já em pt-BR)
 * @param {string}  parts.place        bairro ou cidade
 * @param {number}  parts.rating       nota do Google
 * @param {number}  parts.reviewsCount quantidade de avaliações
 */
export function buildDescription({ type, place, rating, reviewsCount }) {
  const sentences = [];

  const localizacao = [type, place].filter((part) => part && String(part).trim()).join(" em ");
  if (localizacao) sentences.push(`${localizacao}.`);

  // Sem avaliação não há nota a exibir — só ruído.
  if (Number(reviewsCount) > 0) {
    const nota = formatRating(rating);
    if (nota) sentences.push(`Nota ${nota} (${formatReviewCount(reviewsCount)}).`);
  }

  return sentences.join(" ");
}

/**
 * Converte uma descrição antiga na versão pt-BR.
 *
 * @param {string} description  descrição atual
 * @param {object} [options]
 * @param {string} [options.fallbackType] usado quando o registro foi gravado
 *   sem tipo; normalmente a coluna `category` da própria linha.
 * @returns {{description: string, changed: boolean, untranslatedType: string|null}|null}
 *   null quando a descrição não segue o template (nada a fazer).
 */
export function translateDescription(description, { fallbackType = "" } = {}) {
  const parsed = parseDescription(description);
  if (!parsed) return null;

  let untranslatedType = null;
  let type = parsed.type;

  if (!type) {
    type = String(fallbackType ?? "").trim();
  } else if (!isTranslatedType(type)) {
    const traduzido = translateGoogleType(type);
    if (traduzido) type = traduzido;
    else untranslatedType = type; // fica como está; o script relata para revisão
  }

  const rebuilt = buildDescription({
    type,
    place: parsed.place,
    rating: parsed.rating,
    reviewsCount: parsed.reviewsCount,
  });

  return {
    description: rebuilt,
    changed: rebuilt !== String(description ?? "").trim(),
    untranslatedType,
  };
}
