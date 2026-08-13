import { describe, expect, it } from "vitest";

import { normalizeBusinessData } from "@/lib/dataNormalization";

describe("normalizeBusinessData", () => {
  // A nota do Google só existe dentro do texto da descrição em parte da base,
  // por isso o fallback. Os dois formatos convivem enquanto o
  // scripts/fix-descriptions.mjs não roda sobre tudo.
  it("lê a nota da descrição no formato antigo", () => {
    const business = normalizeBusinessData({
      name: "Alforria",
      description:
        "Pizza restaurant em Centro. Nota: 4.400000 (46 avaliações).",
    });

    expect(business.averageRating).toBe(4.4);
    expect(business.reviewCount).toBe(46);
  });

  it("lê a nota da descrição normalizada, com vírgula", () => {
    const business = normalizeBusinessData({
      name: "Alforria",
      description: "Pizzaria em Centro. Nota 4,4 (46 avaliações).",
    });

    expect(business.averageRating).toBe(4.4);
    expect(business.reviewCount).toBe(46);
  });

  it("prefere a nota explícita do registro à da descrição", () => {
    const business = normalizeBusinessData({
      name: "Alforria",
      rating: 4.8,
      description: "Pizzaria em Centro. Nota 4,4 (46 avaliações).",
    });

    expect(business.averageRating).toBe(4.8);
  });

  it("fica sem nota quando a descrição não traz nenhuma", () => {
    const business = normalizeBusinessData({
      name: "Alforria",
      description: "Oficina mecânica em Centro.",
    });

    expect(business.averageRating).toBeUndefined();
    expect(business.reviewCount).toBeUndefined();
  });

  it("classifica pela heurística quando não vem categorySlug", () => {
    expect(
      normalizeBusinessData({ name: "Bar da Montanha" }).categorySlug,
    ).toBe("comer-agora");
    expect(
      normalizeBusinessData({ name: "Barbearia do Alisson" }).categorySlug,
    ).toBe("servicos");
    expect(normalizeBusinessData({ name: "Center Tudo" }).categorySlug).toBe(
      "negocios",
    );
  });

  it("respeita o categorySlug já definido no banco", () => {
    const business = normalizeBusinessData({
      name: "Bar da Montanha",
      categorySlug: "negocios",
    });

    expect(business.categorySlug).toBe("negocios");
  });
});
