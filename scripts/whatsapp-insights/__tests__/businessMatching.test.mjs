import { describe, expect, it } from "vitest";

import {
  clusterBusinessMentions,
  extractBusinessNameCandidate,
  withListedStatus,
} from "../lib/businessMatching.mjs";

describe("extractBusinessNameCandidate", () => {
  it("extrai o nome do negócio removendo o padrão de pergunta", () => {
    expect(extractBusinessNameCandidate("Alguém tem o número da Vanutt massas ?")).toBe(
      "Vanutt massas",
    );
  });

  it("devolve null quando não sobra nada além do padrão de pergunta", () => {
    expect(extractBusinessNameCandidate("Alguém sabe?")).toBeNull();
  });
});

describe("clusterBusinessMentions — negócio \"fantasma\" (pedido várias vezes, nunca listado)", () => {
  const vcfContacts = [{ fileName: "Vanlutt Massas.vcf", name: "Vanlutt Massas", phone: "" }];

  const mentions = [
    {
      candidate: "vanlutt massas",
      category: "comida",
      isoDate: "2025-06-22",
      text: "Alguém tem contato da vanlutt massas",
    },
    {
      candidate: "Vanutt massas",
      category: "comida",
      isoDate: "2025-08-10",
      text: "Alguém tem o número da Vanutt massas ?",
    },
    {
      candidate: "Vanuti Massas",
      category: "comida",
      isoDate: "2026-02-25",
      text: "Onde acho a Vanuti Massas mesmo?",
    },
  ];

  it("agrupa as variações de grafia num único negócio, ancorado no contato .vcf mais próximo", () => {
    const [entry] = clusterBusinessMentions(mentions, vcfContacts);

    expect(entry.negocio_normalizado).toBe("Vanlutt Massas");
    expect(entry.contato_vcf_encontrado).toBe("Vanlutt Massas.vcf");
    expect(entry.vezes_pedido).toBe(3);
    expect(entry.primeira_mencao).toBe("2025-06-22");
    expect(entry.ultima_mencao).toBe("2026-02-25");
    expect(entry.categoria).toBe("comida");
    expect(entry.exemplos_pedido.length).toBeGreaterThan(0);
  });

  it("agrupa menções sem contato .vcf conhecido entre si mesmas", () => {
    const semVcf = [
      { candidate: "Padoca do Zé", category: "comida", isoDate: "2025-07-01", text: "a" },
      { candidate: "Padoca do Ze", category: "comida", isoDate: "2025-07-15", text: "b" },
    ];

    const [entry] = clusterBusinessMentions(semVcf, []);
    expect(entry.vezes_pedido).toBe(2);
    expect(entry.contato_vcf_encontrado).toBeNull();
  });

  it("não agrupa negócios claramente diferentes", () => {
    const mistos = [
      { candidate: "Vanutt Massas", category: "comida", isoDate: "2025-06-01", text: "a" },
      { candidate: "Farmácia São Geraldo", category: "saude_medico", isoDate: "2025-06-02", text: "b" },
    ];

    const entries = clusterBusinessMentions(mistos, []);
    expect(entries).toHaveLength(2);
  });
});

describe("withListedStatus", () => {
  it("marca ja_listado quando o negócio já existe no mockData", () => {
    const entry = { negocio_normalizado: "Empório di Mineiro" };
    const result = withListedStatus(entry, ["Emporio di Mineiro", "Padaria Kiko"]);
    expect(result.status).toBe("ja_listado");
  });

  it("marca nao_listado quando não há negócio parecido", () => {
    const entry = { negocio_normalizado: "Vanlutt Massas" };
    const result = withListedStatus(entry, ["Emporio di Mineiro", "Padaria Kiko"]);
    expect(result.status).toBe("nao_listado");
  });
});
