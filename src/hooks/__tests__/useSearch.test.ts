import { renderHook } from "@testing-library/react";
import { vi } from "vitest";
import { useSearch } from "../useSearch";

vi.mock("../useSearchEngine", () => ({
  useSearchEngine: () => ({ results: [], isLoading: false, error: null }),
}));

test("returns search results shape", () => {
  const { result } = renderHook(() => useSearch("", []));
  expect(result.current.results).toEqual([]);
});
