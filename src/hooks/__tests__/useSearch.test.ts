import { renderHook } from "@testing-library/react";
import { vi } from "vitest";
import { useSearch } from "../useSearch";

vi.mock("../useSearchEngine", () => ({
  useSearchEngine: () => ({ 
    business: [], 
    listing: [], 
    deal: [], 
    event: [], 
    news: [], 
    isLoading: false 
  }),
}));

test("returns search results shape", () => {
  const { result } = renderHook(() => useSearch("", []));
  expect(result.current.business).toEqual([]);
  expect(result.current.isLoading).toBe(false);
});
