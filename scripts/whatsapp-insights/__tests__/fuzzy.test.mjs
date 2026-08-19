import { describe, expect, it } from "vitest";

import { confidenceFromRatio, findBestMatch, levenshteinDistance, similarityRatio } from "../lib/fuzzy.mjs";

describe("levenshteinDistance", () => {
  it("é 0 para strings idênticas", () => {
    expect(levenshteinDistance("vanutt", "vanutt")).toBe(0);
  });

  it("conta as edições entre variações de grafia", () => {
    // "vanutt" -> "vanlutt": insere "l"
    expect(levenshteinDistance("vanutt", "vanlutt")).toBe(1);
  });
});

describe("similarityRatio", () => {
  it("é 1 para strings iguais (ignorando acento/caixa)", () => {
    expect(similarityRatio("Vanutt Massas", "vanutt massas")).toBe(1);
  });

  it("é alto para variações de grafia do mesmo nome", () => {
    expect(similarityRatio("Vanutt Massas", "Vanlutt Massas")).toBeGreaterThan(0.85);
  });

  it("é baixo para nomes sem relação", () => {
    expect(similarityRatio("Vanutt Massas", "Farmácia São Geraldo")).toBeLessThan(0.4);
  });
});

describe("findBestMatch", () => {
  const contatos = [
    { name: "Vanlutt Massas" },
    { name: "Farmácia São Geraldo" },
    { name: "Andre Chaveiro" },
  ];

  it("acha o contato mais parecido", () => {
    const result = findBestMatch("Vanutt massas", contatos, { getText: (c) => c.name });
    expect(result.match.name).toBe("Vanlutt Massas");
  });

  it("devolve null quando nada bate o mínimo", () => {
    const result = findBestMatch("xyz completamente diferente", contatos, {
      getText: (c) => c.name,
      minRatio: 0.6,
    });
    expect(result).toBeNull();
  });
});

describe("confidenceFromRatio", () => {
  it("classifica alta/média/baixa", () => {
    expect(confidenceFromRatio(0.95)).toBe("alta");
    expect(confidenceFromRatio(0.75)).toBe("media");
    expect(confidenceFromRatio(0.5)).toBe("baixa");
  });
});
