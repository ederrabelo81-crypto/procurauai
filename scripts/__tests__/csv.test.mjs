import { describe, expect, it } from "vitest";

import { parseCsv, parseCsvRecords, toCsv, toCsvCell } from "../lib/csv.mjs";

describe("toCsvCell", () => {
  it("deixa valor simples sem aspas", () => {
    expect(toCsvCell("Padaria Central")).toBe("Padaria Central");
  });

  it("põe aspas quando há vírgula", () => {
    expect(toCsvCell("Rua São João, 320")).toBe('"Rua São João, 320"');
  });

  it("duplica aspas internas", () => {
    expect(toCsvCell('Bar do "Zé"')).toBe('"Bar do ""Zé"""');
  });

  it("trata null e undefined como célula vazia", () => {
    expect(toCsvCell(null)).toBe("");
    expect(toCsvCell(undefined)).toBe("");
  });
});

describe("parseCsv", () => {
  it("não quebra o campo no meio de um endereço com vírgula", () => {
    const linhas = parseCsv('id,address,action\n1,"Rua São João, 320 - Centro",verified');
    expect(linhas[1]).toEqual(["1", "Rua São João, 320 - Centro", "verified"]);
  });

  it("aceita quebra de linha dentro do campo", () => {
    const linhas = parseCsv('id,obs\n1,"linha 1\nlinha 2"');
    expect(linhas[1]).toEqual(["1", "linha 1\nlinha 2"]);
  });

  it("aceita terminador CRLF (arquivo salvo pelo Excel no Windows)", () => {
    const linhas = parseCsv("id,action\r\n1,verified\r\n");
    expect(linhas).toEqual([
      ["id", "action"],
      ["1", "verified"],
    ]);
  });

  it("descarta linhas em branco", () => {
    expect(parseCsv("id,action\n\n1,verified\n\n")).toHaveLength(2);
  });
});

describe("parseCsvRecords", () => {
  it("casa as colunas pelo nome do cabeçalho", () => {
    const [registro] = parseCsvRecords('id,name,action\nabc,"Bar do Zé",verified');
    expect(registro).toEqual({ id: "abc", name: "Bar do Zé", action: "verified" });
  });

  it("sobrevive a colunas reordenadas pelo revisor", () => {
    const [registro] = parseCsvRecords("action,id\nrejected,abc");
    expect(registro.id).toBe("abc");
    expect(registro.action).toBe("rejected");
  });

  it("ida e volta preserva o endereço com vírgula", () => {
    const csv = toCsv(
      ["id", "address", "action"],
      [["abc", "Av. Brasil, 1.020 - Centro", "verified"]],
    );
    const [registro] = parseCsvRecords(csv);
    expect(registro.address).toBe("Av. Brasil, 1.020 - Centro");
    expect(registro.action).toBe("verified");
  });

  it("devolve lista vazia para arquivo sem conteúdo", () => {
    expect(parseCsvRecords("")).toEqual([]);
  });
});
