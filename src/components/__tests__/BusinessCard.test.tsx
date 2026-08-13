import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { BusinessCard } from "../cards/BusinessCard";
import { PHOTO_PLACEHOLDER } from "@/lib/businessPhotos";
import { resetStreetViewCoverage } from "@/lib/streetView";
import type * as MapsModule from "@/lib/maps";

/**
 * As URLs do Maps dependem da chave, que não existe no ambiente de teste.
 * Aqui elas são controladas por teste: `null` (padrão) reproduz o app sem
 * chave configurada.
 */
const maps = vi.hoisted(() => ({
  metadataUrl: null as string | null,
  streetViewUrl: null as string | null,
}));

vi.mock("@/lib/maps", async (importOriginal) => {
  const original = await importOriginal<typeof MapsModule>();
  return {
    ...original,
    mapsStreetViewMetadataUrl: () => maps.metadataUrl,
    mapsStreetViewUrl: () => maps.streetViewUrl,
  };
});

const base = {
  id: "uuid-1",
  name: "Comércio Sem Acervo XPTO",
  category: "Padaria",
  categorySlug: "negocios",
  tags: [],
  neighborhood: "Centro",
  hours: "Consultar horários",
  whatsapp: "5535990000000",
  coverImages: [] as string[],
  isOpenNow: false,
};

/**
 * O `useStreetViewProbe` resolve numa microtask mesmo quando não há consulta a
 * fazer. Sem deixar o React aplicar esse estado antes das asserções, todo teste
 * vaza warning de `act()`.
 */
const renderCard = async (
  business: Parameters<typeof BusinessCard>[0]["business"],
) => {
  const result = render(
    <MemoryRouter>
      <BusinessCard business={business} />
    </MemoryRouter>,
  );
  await act(async () => {});
  return result;
};

beforeEach(() => {
  resetStreetViewCoverage();
  maps.metadataUrl = null;
  maps.streetViewUrl = null;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("BusinessCard — capa", () => {
  test("exibe a foto do comércio mesmo tendo coordenadas", async () => {
    // A carga de comércios preencheu latitude/longitude de toda a base. Antes,
    // qualquer coordenada fazia o mapa cobrir a foto.
    await renderCard({
      ...base,
      coverImages: ["https://exemplo.com/fachada.jpg"],
      latitude: -20.8903,
      longitude: -46.7029,
    });

    expect(screen.getByAltText(base.name)).toHaveAttribute(
      "src",
      "https://exemplo.com/fachada.jpg",
    );
  });

  test("recupera a foto curada quando a linha do banco veio sem cover_images", async () => {
    await renderCard({ ...base, name: "Haru Sushi", coverImages: [] });

    const img = screen.getByAltText("Haru Sushi");
    expect(img.getAttribute("src")).toMatch(/^https:\/\//);
    expect(img).not.toHaveAttribute("src", PHOTO_PLACEHOLDER);
  });

  test("cai no mapa quando não há foto nenhuma", async () => {
    await renderCard({ ...base, latitude: -20.8903, longitude: -46.7029 });

    // Sem chave do Maps o MiniMap renderiza o MapPlaceholder, que se anuncia
    // como imagem com rótulo próprio.
    expect(screen.queryByAltText(base.name)).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Mapa/i })).toBeInTheDocument();
  });

  test("nunca renderiza <img> com src vazio", async () => {
    await renderCard({ ...base, coverImages: ["", "   "] });

    document.querySelectorAll("img").forEach((img) => {
      expect(img.getAttribute("src")).toBeTruthy();
    });
  });
});

describe("BusinessCard — Street View", () => {
  const semFoto = {
    ...base,
    latitude: -20.8903,
    longitude: -46.7029,
  };

  const comChave = () => {
    maps.metadataUrl =
      "https://maps.googleapis.com/maps/api/streetview/metadata";
    maps.streetViewUrl =
      "https://maps.googleapis.com/maps/api/streetview?location=x";
  };

  const respondeMetadata = (status: string) => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ status }),
    });
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  };

  test("com cobertura confirmada, usa a fachada do Street View", async () => {
    comChave();
    respondeMetadata("OK");

    await renderCard(semFoto);

    await waitFor(() => {
      expect(screen.getByAltText(semFoto.name)).toHaveAttribute(
        "src",
        expect.stringContaining("streetview"),
      );
    });
  });

  test("sem cobertura, não pede a imagem e mostra o mapa", async () => {
    comChave();
    const fetchMock = respondeMetadata("ZERO_RESULTS");

    await renderCard(semFoto);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    // Só a consulta gratuita aconteceu; a capa é o mapa da localização.
    expect(screen.queryByAltText(semFoto.name)).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Mapa/i })).toBeInTheDocument();
  });

  test("consulta falhando (CORS), pede a imagem assim mesmo", async () => {
    comChave();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("CORS")));

    await renderCard(semFoto);

    // "assumida": a checagem é otimização, não requisito.
    await waitFor(() => {
      expect(screen.getByAltText(semFoto.name)).toHaveAttribute(
        "src",
        expect.stringContaining("streetview"),
      );
    });
  });

  test("não consulta cobertura de quem já tem foto própria", async () => {
    comChave();
    const fetchMock = respondeMetadata("OK");

    await renderCard({
      ...semFoto,
      coverImages: ["https://exemplo.com/fachada.jpg"],
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("sem chave do Maps, não consulta nada", async () => {
    const fetchMock = respondeMetadata("OK");

    await renderCard(semFoto);

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
