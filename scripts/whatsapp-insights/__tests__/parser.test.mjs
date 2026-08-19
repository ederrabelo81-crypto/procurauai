import { describe, expect, it } from "vitest";

import { parseWhatsAppExport, toIsoDate } from "../lib/parser.mjs";

describe("parseWhatsAppExport", () => {
  it("faz o parse de uma mensagem simples de remetente numérico", () => {
    const raw = "20/06/2025 23:53 - +55 15 99691-4772: Alguém sabe um açougue que mói carne?";
    const [entry] = parseWhatsAppExport(raw);

    expect(entry).toEqual({
      date: "20/06/2025",
      time: "23:53",
      sender: "+55 15 99691-4772",
      text: "Alguém sabe um açougue que mói carne?",
    });
  });

  it("concatena mensagem multilinha até a próxima linha com data/hora", () => {
    const raw = [
      "21/06/2025 06:22 - +55 41 9143-1656: PREPARA",
      "",
      " MÓNTE SANTO",
      "CONFERE ABAÍXOOO",
      "21/06/2025 06:23 - +55 35 9216-8652: Jura??",
    ].join("\n");

    const entries = parseWhatsAppExport(raw);

    expect(entries).toHaveLength(2);
    expect(entries[0].text).toBe("PREPARA\n\n MÓNTE SANTO\nCONFERE ABAÍXOOO");
    expect(entries[1].text).toBe("Jura??");
  });

  it("ignora <Mídia oculta>", () => {
    const raw = "21/06/2025 06:42 - +55 19 99383-0146: <Mídia oculta>";
    expect(parseWhatsAppExport(raw)).toEqual([]);
  });

  it("ignora Mensagem apagada", () => {
    const raw = "21/06/2025 06:24 - +55 41 9143-1656: Mensagem apagada";
    expect(parseWhatsAppExport(raw)).toEqual([]);
  });

  it("ignora linhas de sistema (entrada/saída, criação de grupo, número trocado)", () => {
    const raw = [
      '21/01/2023 18:43 - Um admin criou o grupo "Tv Web Monte Santo 2".',
      "21/06/2025 08:50 - ‎~ Rafael Silveira entrou usando o link do grupo",
      "25/06/2025 03:48 - ‎+55 19 99929-6103 mudou para +55 19 99633-7218",
      "15/07/2025 08:28 - ‎~ Ellen mudou a descrição do grupo",
      "29/07/2025 15:59 - ‎~ Gaah removeu +55 98 9993-1431",
      "22/06/2025 20:39 - As mensagens e ligações são protegidas com a criptografia de ponta a ponta. Somente as pessoas que fazem parte da conversa podem ler, ouvir e compartilhar esse conteúdo. *Saiba mais*",
    ].join("\n");

    expect(parseWhatsAppExport(raw)).toEqual([]);
  });

  it("ignora mensagem vazia (mídia sem legenda)", () => {
    const raw = "21/06/2025 08:34 - +55 35 9219-5117: ";
    expect(parseWhatsAppExport(raw)).toEqual([]);
  });

  it("não deixa uma linha de sistema no meio virar continuação da mensagem anterior", () => {
    const raw = [
      "20/06/2025 23:53 - +55 15 99691-4772: Alguém sabe um açougue?",
      "21/06/2025 08:50 - ‎~ Rafael Silveira entrou usando o link do grupo",
      "21/06/2025 09:00 - +55 15 99691-4772: Por favor",
    ].join("\n");

    const entries = parseWhatsAppExport(raw);
    expect(entries).toHaveLength(2);
    expect(entries[0].text).toBe("Alguém sabe um açougue?");
    expect(entries[1].text).toBe("Por favor");
  });

  it("mantém ': ' dentro do texto da mensagem (só separa no primeiro)", () => {
    const raw = "20/06/2025 23:53 - +55 15 99691-4772: Perdi meu cão: alguém viu?";
    const [entry] = parseWhatsAppExport(raw);
    expect(entry.text).toBe("Perdi meu cão: alguém viu?");
  });
});

describe("toIsoDate", () => {
  it("converte DD/MM/AAAA para AAAA-MM-DD", () => {
    expect(toIsoDate("20/06/2025")).toBe("2025-06-20");
  });

  it("devolve null para formato inválido", () => {
    expect(toIsoDate("data inválida")).toBeNull();
  });
});
