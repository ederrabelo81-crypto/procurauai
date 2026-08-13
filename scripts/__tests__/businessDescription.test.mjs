import { describe, expect, it } from "vitest";

import {
  buildDescription,
  formatRating,
  formatReviewCount,
  parseDescription,
  translateDescription,
} from "../lib/businessDescription.mjs";
import { isTranslatedType, translateGoogleType } from "../lib/googleTypes.mjs";

describe("parseDescription", () => {
  it("lê o template gravado na carga inicial", () => {
    expect(parseDescription("Beauty salon em Centro. Nota: 4.400000 (21 avaliações).")).toEqual({
      type: "Beauty salon",
      place: "Centro",
      rating: 4.4,
      reviewsCount: 21,
    });
  });

  it("lê os registros gravados sem tipo", () => {
    expect(parseDescription("em Centro. Nota: 0.000000 (0 avaliações).")).toEqual({
      type: "",
      place: "Centro",
      rating: 0,
      reviewsCount: 0,
    });
  });

  it("lê o formato já corrigido, para ser idempotente", () => {
    expect(parseDescription("Salão de beleza em Centro. Nota 4,4 (21 avaliações).")).toEqual({
      type: "Salão de beleza",
      place: "Centro",
      rating: 4.4,
      reviewsCount: 21,
    });
  });

  it("aceita local com mais de uma palavra", () => {
    expect(parseDescription("Lawyer em Monte Santo de Minas. Nota: 5.000000 (4 avaliações).")).toMatchObject({
      type: "Lawyer",
      place: "Monte Santo de Minas",
    });
  });

  it("devolve null fora do template", () => {
    expect(parseDescription("Texto escrito pelo comerciante.")).toBeNull();
    expect(parseDescription("")).toBeNull();
    expect(parseDescription(null)).toBeNull();
  });
});

describe("formatRating", () => {
  it("usa uma casa decimal e vírgula", () => {
    expect(formatRating(4.4)).toBe("4,4");
    expect(formatRating(4.400000)).toBe("4,4");
    expect(formatRating(5)).toBe("5,0");
    expect(formatRating(4.45)).toBe("4,5");
  });

  it("devolve null sem número", () => {
    expect(formatRating(null)).toBeNull();
    expect(formatRating("abc")).toBeNull();
  });
});

describe("formatReviewCount", () => {
  it("acerta o singular", () => {
    expect(formatReviewCount(1)).toBe("1 avaliação");
    expect(formatReviewCount(21)).toBe("21 avaliações");
    expect(formatReviewCount(0)).toBe("0 avaliações");
  });
});

describe("buildDescription", () => {
  it("monta a frase completa", () => {
    expect(
      buildDescription({ type: "Salão de beleza", place: "Centro", rating: 4.4, reviewsCount: 21 }),
    ).toBe("Salão de beleza em Centro. Nota 4,4 (21 avaliações).");
  });

  it("omite a nota quando ninguém avaliou", () => {
    expect(buildDescription({ type: "Advogado", place: "Centro", rating: 0, reviewsCount: 0 })).toBe(
      "Advogado em Centro.",
    );
  });

  it("funciona sem tipo", () => {
    expect(buildDescription({ type: "", place: "Centro", rating: 4.8, reviewsCount: 6 })).toBe(
      "Centro. Nota 4,8 (6 avaliações).",
    );
  });
});

describe("translateGoogleType", () => {
  it("traduz os tipos do Google", () => {
    expect(translateGoogleType("Beauty salon")).toBe("Salão de beleza");
    expect(translateGoogleType("auto repair shop")).toBe("Oficina mecânica");
    expect(translateGoogleType("Pizza restaurant")).toBe("Pizzaria");
  });

  it("devolve null para tipo desconhecido, em vez de chutar", () => {
    expect(translateGoogleType("Quantum bakery")).toBeNull();
    expect(translateGoogleType("")).toBeNull();
  });

  it("reconhece o que já está em pt-BR", () => {
    expect(isTranslatedType("Salão de beleza")).toBe(true);
    expect(isTranslatedType("Beauty salon")).toBe(false);
  });
});

describe("translateDescription", () => {
  it("traduz o tipo e corrige as casas decimais", () => {
    const result = translateDescription("Beauty salon em Centro. Nota: 4.400000 (21 avaliações).");
    expect(result.description).toBe("Salão de beleza em Centro. Nota 4,4 (21 avaliações).");
    expect(result.changed).toBe(true);
    expect(result.untranslatedType).toBeNull();
  });

  it("usa a categoria da linha quando o registro veio sem tipo", () => {
    const result = translateDescription("em Centro. Nota: 4.800000 (6 avaliações).", {
      fallbackType: "Serviços",
    });
    expect(result.description).toBe("Serviços em Centro. Nota 4,8 (6 avaliações).");
  });

  it("omite a nota zerada", () => {
    const result = translateDescription("Lawyer em Centro. Nota: 0.000000 (0 avaliações).");
    expect(result.description).toBe("Advogado em Centro.");
  });

  it("é idempotente sobre a descrição já corrigida", () => {
    const primeira = translateDescription("Beauty salon em Centro. Nota: 4.400000 (21 avaliações).");
    const segunda = translateDescription(primeira.description);
    expect(segunda.description).toBe(primeira.description);
    expect(segunda.changed).toBe(false);
  });

  it("mantém o tipo desconhecido e sinaliza para revisão", () => {
    const result = translateDescription("Quantum bakery em Centro. Nota: 4.000000 (2 avaliações).");
    expect(result.untranslatedType).toBe("Quantum bakery");
    expect(result.description).toBe("Quantum bakery em Centro. Nota 4,0 (2 avaliações).");
  });

  it("devolve null fora do template", () => {
    expect(translateDescription("Descrição escrita à mão pelo comerciante.")).toBeNull();
  });
});
