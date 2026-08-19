import { describe, expect, it } from "vitest";

import { categorizeMessage, detectSearchIntent, isRealtimeIntent } from "../lib/patterns.mjs";

describe("detectSearchIntent", () => {
  it("detecta 'alguém sabe'", () => {
    expect(detectSearchIntent("Alguém sabe um açougue que mói carne?")).toContain("alguem_sabe");
  });

  it("detecta 'onde tem'", () => {
    expect(detectSearchIntent("onde tem uma farmácia aberta agora?")).toContain("onde_tem_acho");
  });

  it("detecta 'quem faz'", () => {
    expect(detectSearchIntent("quem conserta geladeira aqui?")).toContain("quem_faz_tem");
  });

  it("não marca intenção de busca numa mensagem qualquer", () => {
    expect(detectSearchIntent("Bom dia pessoal, tudo bem?")).toEqual([]);
  });
});

describe("categorizeMessage — uma mensagem de cada categoria principal", () => {
  const casos = [
    ["Alguém sabe o número de um dentista bom?", "saude_medico"],
    ["Alguém indica um veterinário pra castrar meu gato?", "pet_veterinario"],
    ["Quem conserta pneu furado aqui perto?", "auto_mecanico"],
    ["Alguém sabe um eletricista pra hoje?", "reparos_casa"],
    ["Alguém sabe um frete pra fazer uma mudança?", "transporte"],
    ["Alguém sabe de um apartamento pra alugar no centro?", "aluguel_imovel"],
    ["Onde acho uma marmita boa pro almoço?", "comida"],
    ["Alguém indica uma manicure boa?", "beleza_estetica"],
    ["Alguém sabe uma diarista disponível essa semana?", "servico_domestico"],
    ["Alguém indica professor de reforço escolar?", "educacao"],
    ["Alguém sabe um despachante pra tirar documento?", "documentos_juridico"],
    ["Onde tem loja de roupa boa e barata?", "roupa_loja"],
    ["Quem faz reforma e pintura de casa?", "construcao"],
    ["Alguém sabe onde tem gás de cozinha disponível?", "gas_agua"],
    ["Alguém indica um chaveiro de confiança?", "outros_servicos"],
  ];

  it.each(casos)("categoriza %j como %s", (texto, categoriaEsperada) => {
    expect(categorizeMessage(texto)).toContain(categoriaEsperada);
  });

  it("uma mensagem sem palavra de nenhuma categoria não casa nada", () => {
    expect(categorizeMessage("Bom dia, tudo bem com vocês?")).toEqual([]);
  });

  it("uma mensagem pode casar mais de uma categoria", () => {
    const categorias = categorizeMessage("Alguém sabe um mecânico que também conserta geladeira?");
    expect(categorias).toContain("auto_mecanico");
    expect(categorias).toContain("reparos_casa");
  });
});

describe("isRealtimeIntent", () => {
  it("marca 'está aberto' como tempo real", () => {
    expect(isRealtimeIntent("A farmácia tá aberto agora?")).toBe(true);
  });

  it("marca 'que horas abre' como tempo real", () => {
    expect(isRealtimeIntent("Que horas abre o mercado?")).toBe(true);
  });

  it("não marca uma pergunta comum como tempo real", () => {
    expect(isRealtimeIntent("Alguém sabe um dentista bom?")).toBe(false);
  });
});
