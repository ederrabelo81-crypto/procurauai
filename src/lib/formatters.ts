/**
 * Formatação de números em pt-BR para a interface.
 *
 * Notas ficam com **uma casa decimal e vírgula**: o Postgres devolve `numeric`
 * como "4.400000" e alguns pontos da UI imprimiam esse valor cru.
 *
 * O equivalente para os scripts de carga vive em
 * `scripts/lib/businessDescription.mjs` — os dois lados precisam produzir o
 * mesmo texto, mas não compartilham módulo (um roda no navegador, o outro no
 * Node, sem build).
 */

/** Ausência não é zero: Number(null) e Number("") valem 0. */
function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

/** `4.400000` → `"4,4"`. Devolve `null` quando não há nota. */
export function formatRating(rating: unknown): string | null {
  const value = toNumber(rating);
  if (value === null) return null;
  return value.toFixed(1).replace(".", ",");
}

/** `1` → `"1 avaliação"`, `21` → `"21 avaliações"`. */
export function formatReviewCount(count: unknown): string | null {
  const value = toNumber(count);
  if (value === null) return null;
  return `${value} ${value === 1 ? "avaliação" : "avaliações"}`;
}
