import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  checkStreetViewCoverage,
  getStreetViewCoverage,
  resetStreetViewCoverage,
} from "@/lib/streetView";
import type * as MapsModule from "@/lib/maps";

const POSICAO = { lat: -20.8903, lng: -46.7029 };

// A cadeia só monta URL de Street View com chave configurada.
vi.mock("@/lib/maps", async (importOriginal) => {
  const original = await importOriginal<typeof MapsModule>();
  return {
    ...original,
    mapsStreetViewMetadataUrl: (target: { lat: number; lng: number }) =>
      `https://maps.googleapis.com/maps/api/streetview/metadata?location=${target.lat},${target.lng}&key=teste`,
  };
});

function mockFetch(body: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: () => Promise.resolve(body),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("checkStreetViewCoverage", () => {
  beforeEach(() => {
    resetStreetViewCoverage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('status OK vira "disponivel"', async () => {
    mockFetch({ status: "OK" });
    await expect(checkStreetViewCoverage(POSICAO)).resolves.toBe("disponivel");
  });

  it('ZERO_RESULTS vira "indisponivel" — não peça a imagem', async () => {
    mockFetch({ status: "ZERO_RESULTS" });
    await expect(checkStreetViewCoverage(POSICAO)).resolves.toBe(
      "indisponivel",
    );
  });

  it('falha de rede/CORS vira "assumida" — mantém o comportamento antigo', async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("CORS")));
    await expect(checkStreetViewCoverage(POSICAO)).resolves.toBe("assumida");
  });

  it('REQUEST_DENIED vira "assumida" — é configuração, não cobertura', async () => {
    mockFetch({ status: "REQUEST_DENIED" });
    await expect(checkStreetViewCoverage(POSICAO)).resolves.toBe("assumida");
  });

  it("consulta uma única vez por coordenada", async () => {
    const fetchMock = mockFetch({ status: "OK" });

    await checkStreetViewCoverage(POSICAO);
    await checkStreetViewCoverage(POSICAO);
    // Diferença abaixo de ~1 m: mesmo panorama, mesma chave de cache.
    await checkStreetViewCoverage({ lat: -20.890302, lng: -46.702898 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("coordenadas distantes são consultadas separadamente", async () => {
    const fetchMock = mockFetch({ status: "OK" });

    await checkStreetViewCoverage(POSICAO);
    await checkStreetViewCoverage({ lat: -20.8915, lng: -46.7042 });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("compartilha a requisição entre chamadas simultâneas", async () => {
    const fetchMock = mockFetch({ status: "OK" });

    await Promise.all([
      checkStreetViewCoverage(POSICAO),
      checkStreetViewCoverage(POSICAO),
      checkStreetViewCoverage(POSICAO),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("sem coordenada não consulta nada", async () => {
    const fetchMock = mockFetch({ status: "OK" });

    await expect(checkStreetViewCoverage(null)).resolves.toBe("indisponivel");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("getStreetViewCoverage", () => {
  beforeEach(() => {
    resetStreetViewCoverage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("devolve undefined antes de qualquer consulta", () => {
    expect(getStreetViewCoverage(POSICAO)).toBeUndefined();
  });

  it("lê o resultado depois da consulta, sem nova requisição", async () => {
    mockFetch({ status: "OK" });
    await checkStreetViewCoverage(POSICAO);

    expect(getStreetViewCoverage(POSICAO)).toBe("disponivel");
  });

  it('não guarda "assumida": a próxima visita tenta checar de novo', async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("CORS")));
    await checkStreetViewCoverage(POSICAO);

    // Fica em memória para a tela atual, mas não é persistido na sessão.
    expect(
      sessionStorage.getItem("procura-uai-streetview") ?? "{}",
    ).not.toContain("assumida");
  });
});
