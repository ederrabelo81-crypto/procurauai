import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  FOOD_KEYWORDS,
  RETAIL_KEYWORDS,
  SERVICE_KEYWORDS,
  guessBusinessCategorySlug,
  guessCategorySlug,
  matchCategorySlug,
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

describe("matchCategorySlug", () => {
  it("devolve null quando nenhuma palavra-chave casa", () => {
    expect(matchCategorySlug("Julio Cesar Prado")).toBeNull();
    expect(matchCategorySlug("")).toBeNull();
  });

  it("devolve o slug quando casa", () => {
    expect(matchCategorySlug("Bar do Zé")).toBe("comer-agora");
    expect(matchCategorySlug("Barbearia do Alisson")).toBe("servicos");
  });
});

describe("guessBusinessCategorySlug", () => {
  // O caso dos 351 registros da carga antiga: `category` é "Serviços" para
  // todos e o nome não tem palavra-chave; só a descrição sabe o que é o lugar.
  it("usa a descrição quando nome e categoria não decidem", () => {
    expect(
      guessBusinessCategorySlug({
        name: "Alforria",
        category: "Serviços",
        description: "Bar em Centro. Nota 4,2 (18 avaliações).",
      }),
    ).toBe("comer-agora");

    expect(
      guessBusinessCategorySlug({
        name: "Casa da Sogra",
        category: "Serviços",
        description: "Loja de materiais de construção em Centro.",
      }),
    ).toBe("negocios");
  });

  it("não deixa a descrição atropelar nome ou categoria", () => {
    expect(
      guessBusinessCategorySlug({
        name: "Barbearia do Alisson",
        category: "Serviços",
        description: "Loja em Centro. Nota 4,8 (32 avaliações).",
      }),
    ).toBe("servicos");

    expect(
      guessBusinessCategorySlug({
        name: "Pizzaria Alforria",
        category: "Serviços",
        description: "Loja de conveniência em Centro.",
      }),
    ).toBe("comer-agora");
  });

  it("cai no fallback quando nem a descrição casa", () => {
    expect(
      guessBusinessCategorySlug({
        name: "Julio Cesar Prado",
        category: "Serviços",
        description: "Escritório em Centro.",
      }),
    ).toBe("servicos");

    expect(
      guessBusinessCategorySlug(
        { name: "Julio Cesar Prado", category: "Serviços" },
        "negocios",
      ),
    ).toBe("negocios");
  });

  it("aceita campos ausentes ou nulos", () => {
    expect(guessBusinessCategorySlug({})).toBe("servicos");
    expect(
      guessBusinessCategorySlug({
        name: null,
        category: null,
        description: "Padaria em Centro.",
      }),
    ).toBe("comer-agora");
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

  const sqlFunction = (name: string): string => {
    const start = schemaSql.indexOf(
      `create or replace function public.${name}(`,
    );
    expect(start, `função ${name}() não encontrada no schema`).toBeGreaterThan(
      -1,
    );

    const end = schemaSql.indexOf("$$;", start);
    expect(end, `fim de ${name}() não encontrado`).toBeGreaterThan(start);

    return schemaSql.slice(start, end);
  };

  /** match_business_category_slug() é o equivalente SQL de matchCategorySlug(). */
  const matchBody = sqlFunction("match_business_category_slug");
  const triggerBody = sqlFunction("set_business_category_slug");

  /** Extrai as palavras da regex que devolve `slug`. */
  const keywordsForSlug = (slug: string): string[] => {
    const assignment = matchBody.indexOf(`then '${slug}'`);
    expect(
      assignment,
      `retorno de '${slug}' não encontrado em match_business_category_slug()`,
    ).toBeGreaterThan(-1);

    const condition = matchBody.slice(0, assignment);
    const match = condition.match(/~ '\\y\(([^)]+)\)\\y'\s*$/);
    expect(
      match,
      `regex de '${slug}' não encontrada em match_business_category_slug()`,
    ).not.toBeNull();

    return match![1].split("|");
  };

  it("usa \\y (limite de palavra do Postgres) e não \\b", () => {
    expect(matchBody).not.toContain("\\\\b");
    expect(matchBody).toContain("\\y(");
  });

  it("normaliza o texto com unaccent, como o front", () => {
    expect(matchBody).toContain("public.unaccent(");
  });

  // Espelha guessBusinessCategorySlug(): nome + categoria primeiro, descrição
  // como desempate, e só então o fallback.
  it("consulta nome + categoria antes da descrição", () => {
    const nameAndCategory = triggerBody.indexOf("coalesce(new.name, '')");
    const description = triggerBody.indexOf("new.description");

    expect(nameAndCategory, "nome + categoria fora do trigger").toBeGreaterThan(
      -1,
    );
    expect(description, "descrição fora do trigger").toBeGreaterThan(-1);
    expect(description).toBeGreaterThan(nameAndCategory);
  });

  it("mantém 'servicos' como último recurso", () => {
    expect(triggerBody).toContain("'servicos'");
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
