import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { BusinessCard } from "../cards/BusinessCard";
import { PHOTO_PLACEHOLDER } from "@/lib/businessPhotos";

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

const renderCard = (business: Parameters<typeof BusinessCard>[0]["business"]) =>
  render(
    <MemoryRouter>
      <BusinessCard business={business} />
    </MemoryRouter>,
  );

describe("BusinessCard — capa", () => {
  test("exibe a foto do comércio mesmo tendo coordenadas", () => {
    // A carga de comércios preencheu latitude/longitude de toda a base. Antes,
    // qualquer coordenada fazia o mapa cobrir a foto.
    renderCard({
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

  test("recupera a foto curada quando a linha do banco veio sem cover_images", () => {
    renderCard({ ...base, name: "Haru Sushi", coverImages: [] });

    const img = screen.getByAltText("Haru Sushi");
    expect(img.getAttribute("src")).toMatch(/^https:\/\//);
    expect(img).not.toHaveAttribute("src", PHOTO_PLACEHOLDER);
  });

  test("cai no mapa quando não há foto nenhuma", () => {
    renderCard({ ...base, latitude: -20.8903, longitude: -46.7029 });

    // Sem chave do Maps o MiniMap renderiza o MapPlaceholder, que se anuncia
    // como imagem com rótulo próprio.
    expect(screen.queryByAltText(base.name)).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Mapa/i })).toBeInTheDocument();
  });

  test("nunca renderiza <img> com src vazio", () => {
    renderCard({ ...base, coverImages: ["", "   "] });

    document.querySelectorAll("img").forEach((img) => {
      expect(img.getAttribute("src")).toBeTruthy();
    });
  });
});
