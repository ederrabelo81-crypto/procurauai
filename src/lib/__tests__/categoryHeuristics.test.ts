import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  FOOD_KEYWORDS,
  RETAIL_KEYWORDS,
  SERVICE_KEYWORDS,
  guessCategorySlug,
  normalizeForCategoryMatch,
} from "@/lib/categoryHeuristics";

describe("guessCategorySlug", () => {
  it("classifica comida como comer-agora", () => {
    expect(guessCategorySlug("Alforria - Pizzaria e Chopperia")).toBe(
      "comer-agora",
    );
    expect(guessCategorySlug("Pesqueiro Apolinario", "servicos")).toBe(
      "servicos",
    );
    expect(guessCategorySlug("Sorveteria Pingo de Mel")).toBe("comer-agora");
  });

  // O bug que motivou este módulo: 'bar\\b' no trigger nunca casava e todo bar
  // da base foi classificado como serviço.
  it("reconhece 'bar' como palavra inteira", () => {
    expect(guessCategorySlug("Bar da Montanha")).toBe("comer-agora");
    expect(guessCategorySlug("Bar do Zé", "negocios")).toBe("comer-agora");
    expect(guessCategorySlug("Alisson Barbeiro Barbearia")).toBe("servicos");
  });

  it("não confunde barbearia, bazar e outros vizinhos de 'bar'", () => {
    expect(guessCategorySlug("Barbearia do Alisson")).toBe("servicos");
    expect(guessCategorySlug("Bazar da Praça")).toBe("negocios");
  });

  it("classifica comércio como negocios", () => {
    expect(guessCategorySlug("Farmácia Brasil")).toBe("negocios");
    expect(guessCategorySlug("Mercearia São José")).toBe("negocios");
    expect(guessCategorySlug("ADEGA ARMAZEM")).toBe("negocios");
    expect(guessCategorySlug("Loja de Materiais de Construção")).toBe(
      "negocios",
    );
  });

  it("classifica prestador como servicos mesmo com fallback diferente", () => {
    expect(guessCategorySlug("Mecânica Auto Center", "negocios")).toBe(
      "servicos",
    );
    expect(guessCategorySlug("Aline Lima - Advocacia", "negocios")).toBe(
      "servicos",
    );
    expect(
      guessCategorySlug("Paula Kariane Studio Beauty Salão", "negocios"),
    ).toBe("servicos");
  });

  it("ignora acentuação", () => {
    expect(guessCategorySlug("Café Central")).toBe("comer-agora");
    expect(guessCategorySlug("Ótica Visão")).toBe("negocios");
    expect(guessCategorySlug("Gráfica Rápida")).toBe("servicos");
  });

  it("cai no fallback quando nada casa", () => {
    expect(guessCategorySlug("Julio Cesar Prado")).toBe("servicos");
    expect(guessCategorySlug("Julio Cesar Prado", "negocios")).toBe("negocios");
    expect(guessCategorySlug("")).toBe("servicos");
  });

  it("dá precedência a comida sobre comércio", () => {
    expect(guessCategorySlug("Padaria e Mercearia Central")).toBe(
      "comer-agora",
    );
  });
});

describe("normalizeForCategoryMatch", () => {
  it("remove acento e caixa", () => {
    expect(normalizeForCategoryMatch("Açaí da Praça")).toBe("acai da praca");
  });
});

// O trigger set_business_category_slug() roda no Postgres e não consegue
// importar o módulo TypeScript. Esta suíte compara as duas cópias para que a
// divergência apareça no CI em vez de virar dado errado no banco.
describe("paridade com o trigger set_business_category_slug()", () => {
  const schemaSql = readFileSync(
    path.resolve(__dirname, "../../../supabase/schema.sql"),
    "utf8",
  );

  const triggerBody = schemaSql.slice(
    schemaSql.indexOf(
      "create or replace function public.set_business_category_slug()",
    ),
  );

  /** Extrai as palavras da regex que atribui `slug` no trigger. */
  const keywordsForSlug = (slug: string): string[] => {
    const assignment = triggerBody.indexOf(`new.category_slug := '${slug}';`);
    expect(
      assignment,
      `atribuição de '${slug}' não encontrada no trigger`,
    ).toBeGreaterThan(-1);

    const condition = triggerBody.slice(0, assignment);
    const match = condition.match(/~ '\\y\(([^)]+)\)\\y'[^~]*$/);
    expect(
      match,
      `regex de '${slug}' não encontrada no trigger`,
    ).not.toBeNull();

    return match![1].split("|");
  };

  it("usa \\y (limite de palavra do Postgres) e não \\b", () => {
    expect(triggerBody).not.toContain("\\\\b");
    expect(triggerBody).toContain("\\y(");
  });

  it("normaliza o texto com unaccent, como o front", () => {
    expect(triggerBody).toContain("public.unaccent(");
  });

  it.each([
    ["comer-agora", FOOD_KEYWORDS],
    ["negocios", RETAIL_KEYWORDS],
    ["servicos", SERVICE_KEYWORDS],
  ] as const)("mantém as mesmas palavras-chave de %s", (slug, keywords) => {
    expect(keywordsForSlug(slug)).toEqual([...keywords]);
  });

  it("mantém as palavras-chave sem acento nos dois lados", () => {
    const todas = [...FOOD_KEYWORDS, ...RETAIL_KEYWORDS, ...SERVICE_KEYWORDS];
    for (const keyword of todas) {
      expect(normalizeForCategoryMatch(keyword)).toBe(keyword);
    }
  });
});
