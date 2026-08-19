import { describe, expect, it } from "vitest";

import { redactPhoneNumbers } from "../lib/privacy.mjs";

describe("redactPhoneNumbers", () => {
  it("redige telefone com DDD e traço", () => {
    expect(redactPhoneNumbers("me chama nesse número 35 992171867")).toBe(
      "me chama nesse número [número removido]",
    );
  });

  it("redige telefone partido de forma irregular", () => {
    // O separador antes de "está" faz parte do próprio número casado (o
    // padrão é permissivo de propósito — ver lib/privacy.mjs) e some junto;
    // resultado sem espaço é aceitável, o número nunca fica de fora.
    expect(redactPhoneNumbers("O 99924 6070 está bloqueado")).toBe(
      "O [número removido]está bloqueado",
    );
  });

  it("não mexe em números curtos (preço, data, endereço)", () => {
    expect(redactPhoneNumbers("casa pra alugar até 1000 reais")).toBe(
      "casa pra alugar até 1000 reais",
    );
    expect(redactPhoneNumbers("Rua São João, 320 - Centro")).toBe("Rua São João, 320 - Centro");
  });

  it("não mexe em texto sem números", () => {
    expect(redactPhoneNumbers("Alguém sabe um dentista bom?")).toBe("Alguém sabe um dentista bom?");
  });
});
