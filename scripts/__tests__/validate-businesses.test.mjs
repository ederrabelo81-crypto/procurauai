import { describe, expect, it } from "vitest";

import { parseCsvRecords, toCsv } from "../lib/csv.mjs";

import { planUpdate } from "../validate-businesses.mjs";

const AGORA = new Date("2026-08-18T12:00:00.000Z");
const existente = { id: "abc", name: "Bar do Zé", phone: "3533221100", whatsapp: "" };

describe("planUpdate", () => {
  it("aprova e marca is_verified quando a ação é verified", () => {
    const plano = planUpdate({ id: "abc", action: "verified" }, existente, { now: AGORA });

    expect(plano.action).toBe("verified");
    expect(plano.updates.verification_status).toBe("verified");
    expect(plano.updates.is_verified).toBe(true);
    expect(plano.updates.verified_at).toBe(AGORA.toISOString());
  });

  it("rejeita sem marcar is_verified e limpa verified_at", () => {
    const plano = planUpdate({ id: "abc", action: "rejected" }, existente, { now: AGORA });

    expect(plano.updates.is_verified).toBe(false);
    expect(plano.updates.verified_at).toBeNull();
  });

  it("não grava verified_by sem um usuário real (a coluna é FK para auth.users)", () => {
    const plano = planUpdate({ id: "abc", action: "verified" }, existente, { now: AGORA });
    expect(plano.updates).not.toHaveProperty("verified_by");
  });

  it("grava verified_by quando o UUID é informado", () => {
    const uuid = "11111111-2222-3333-4444-555555555555";
    const plano = planUpdate({ id: "abc", action: "verified" }, existente, {
      verifiedBy: uuid,
      now: AGORA,
    });
    expect(plano.updates.verified_by).toBe(uuid);
  });

  it("aplica o whatsapp preenchido pelo revisor", () => {
    const plano = planUpdate(
      { id: "abc", action: "verified", whatsapp: "35999887766" },
      existente,
      { now: AGORA },
    );
    expect(plano.updates.whatsapp).toBe("35999887766");
  });

  it("não regrava campo que o revisor não mexeu", () => {
    const plano = planUpdate(
      { id: "abc", action: "verified", phone: "3533221100" },
      existente,
      { now: AGORA },
    );
    expect(plano.updates).not.toHaveProperty("phone");
  });

  it("pula linha sem decisão na coluna action", () => {
    expect(planUpdate({ id: "abc", action: "" }, existente).skip).toBeTruthy();
  });

  it("pula linha sem id", () => {
    expect(planUpdate({ id: "", action: "verified" }, existente).skip).toBeTruthy();
  });

  it("recusa ação desconhecida em vez de gravar lixo", () => {
    expect(planUpdate({ id: "abc", action: "aprovado" }, existente).invalid).toBeTruthy();
  });

  it("aceita a ação com espaços e maiúsculas, como sai do Excel", () => {
    const plano = planUpdate({ id: "abc", action: " Verified " }, existente, { now: AGORA });
    expect(plano.action).toBe("verified");
  });

  it("ida e volta pela planilha não desloca a decisão quando o endereço tem vírgula", () => {
    // Era o bug do parser anterior: split(",") quebrava dentro do endereço e a
    // coluna lida como `action` vinha do meio do texto.
    const csv = toCsv(
      ["id", "name", "address", "city", "category", "phone", "whatsapp", "google_place_id", "action"],
      [["abc", "Bar do Zé", "Rua São João, 320 - Centro", "Guaxupé", "Bar", "", "35999887766", "", "verified"]],
    );

    const [registro] = parseCsvRecords(csv);
    const plano = planUpdate(registro, existente, { now: AGORA });

    expect(plano.action).toBe("verified");
    expect(plano.updates.whatsapp).toBe("35999887766");
  });
});
