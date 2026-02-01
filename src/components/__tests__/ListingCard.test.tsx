import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ListingCard } from "../cards/ListingCard";

const listing = {
  id: "listing-1",
  type: "venda" as const,
  title: "Loja X",
  neighborhood: "Centro",
  images: ["https://example.com/image.jpg"],
  whatsapp: "5511999999999",
  createdAt: "2024-01-01",
};

test("renders listing title", () => {
  render(
    <MemoryRouter>
      <ListingCard listing={listing} />
    </MemoryRouter>
  );
  expect(screen.getByText("Loja X")).toBeInTheDocument();
});
