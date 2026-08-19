import { describe, expect, it } from "vitest";

import { classifyInstitutionalCategory, clusterInstitutionalContacts } from "../lib/institutional.mjs";

describe("classifyInstitutionalCategory", () => {
  const casos = [
    ["PSF São Camilo", "posto_saude"],
    ["Pronto Socorro", "pronto_socorro"],
    ["Santa Casa De Monte Santo", "pronto_socorro"],
    ["Farmácia São Geraldo", "farmacia"],
    ["Dsg Farma Monte Santo", "farmacia"],
    ["CRAS - Monte Santo de Minas", "assistencia_social"],
    ["Conselho Tutelar Monte Santo", "conselho_tutelar"],
    ["Defensoria Pública do Estado de Minas Gerais", "defensoria"],
    ["Vigilância Sanitária", "vigilancia_sanitaria"],
    ["Ambulatório Municipal", "posto_saude"],
    ["Call Center Prefeitura Monte Santo", "prefeitura"],
  ];

  it.each(casos)("classifica %j como %s", (nome, categoriaEsperada) => {
    expect(classifyInstitutionalCategory(nome)).toBe(categoriaEsperada);
  });

  it("devolve null para um contato que não é institucional", () => {
    expect(classifyInstitutionalCategory("Andre Chaveiro")).toBeNull();
  });

  it("exclui contatos que amarram apelido pessoal a função da prefeitura (LGPD)", () => {
    expect(classifyInstitutionalCategory("Gordo Prefeitura")).toBeNull();
    expect(classifyInstitutionalCategory("Daniela Transporte Prefeitura")).toBeNull();
  });
});

describe("clusterInstitutionalContacts", () => {
  it("agrupa duplicatas do mesmo PSF e conta menções por fragmento distintivo", () => {
    const contatos = [
      { fileName: "PSF São Camilo.vcf", name: "PSF São Camilo", phone: "+55 35 3591-0000" },
      { fileName: "Psf Sao Camilo .vcf", name: "Psf Sao Camilo", phone: "" },
    ];
    const mensagens = [
      "alguém sabe o telefone do psf são camilo?",
      "o psf são camilo abre que horas?",
      "alguém tem o número do CRAS?",
    ];

    const [entry] = clusterInstitutionalContacts(contatos, mensagens);

    expect(entry.categoria_servico).toBe("posto_saude");
    expect(entry.telefone).toBe("+55 35 3591-0000");
    expect(entry.status).toBe("pendente_validacao_manual");
    expect(entry.vezes_mencionado_no_grupo).toBe(2);
    expect(entry.confianca_contagem).toBe("alta");
  });

  it("marca confiança baixa quando duas unidades da mesma categoria não têm nome distintivo", () => {
    const contatos = [
      { fileName: "Farmácia Pública.vcf", name: "Farmácia Pública", phone: "111" },
      { fileName: "Farmácia Municipal.vcf", name: "Farmácia Municipal", phone: "222" },
    ];

    const entries = clusterInstitutionalContacts(contatos, ["alguém sabe qual farmácia está aberta?"]);

    expect(entries).toHaveLength(2);
    for (const entry of entries) {
      expect(entry.confianca_contagem).toBe("baixa_soma_categoria");
    }
  });
});
