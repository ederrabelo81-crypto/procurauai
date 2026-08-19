/**
 * Utilidades de comparação aproximada de texto (distância de Levenshtein),
 * usadas para casar menções no grupo com nomes de contatos `.vcf` e com
 * negócios já cadastrados em `src/data/mockData.ts`.
 */

/** Minúsculas, sem acento, pontuação removida, espaços colapsados. */
export function normalizeForMatch(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Distância de Levenshtein clássica (DP iterativo, uma linha). */
export function levenshteinDistance(a, b) {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let previousRow = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 0; i < a.length; i += 1) {
    const currentRow = [i + 1];
    for (let j = 0; j < b.length; j += 1) {
      const deletionCost = previousRow[j + 1] + 1;
      const insertionCost = currentRow[j] + 1;
      const substitutionCost = previousRow[j] + (a[i] === b[j] ? 0 : 1);
      currentRow.push(Math.min(deletionCost, insertionCost, substitutionCost));
    }
    previousRow = currentRow;
  }

  return previousRow[b.length];
}

/**
 * Similaridade em [0, 1] (1 = idêntico) a partir da distância de Levenshtein,
 * normalizada pelo tamanho da maior string. Strings vazias são tratadas como
 * totalmente diferentes (0), nunca como "match perfeito".
 */
export function similarityRatio(a, b) {
  const normalizedA = normalizeForMatch(a);
  const normalizedB = normalizeForMatch(b);
  const maxLength = Math.max(normalizedA.length, normalizedB.length);
  if (maxLength === 0) return 0;
  return 1 - levenshteinDistance(normalizedA, normalizedB) / maxLength;
}

/**
 * Melhor candidato em `options` para `query`, por similaridade de Levenshtein.
 * `getText` extrai a string comparável de cada opção (padrão: identidade).
 * Retorna `null` se nada bater pelo menos `minRatio`.
 */
export function findBestMatch(query, options, { minRatio = 0.6, getText = (x) => x } = {}) {
  let best = null;
  let bestRatio = 0;

  for (const option of options) {
    const ratio = similarityRatio(query, getText(option));
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = option;
    }
  }

  if (!best || bestRatio < minRatio) return null;
  return { match: best, ratio: bestRatio };
}

/** Classifica a confiança de um match a partir do ratio de similaridade. */
export function confidenceFromRatio(ratio) {
  if (ratio >= 0.85) return "alta";
  if (ratio >= 0.7) return "media";
  return "baixa";
}
