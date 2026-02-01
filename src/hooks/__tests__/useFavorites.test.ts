import { renderHook, act } from "@testing-library/react";
import { beforeEach, test, expect } from "vitest";
import { useFavorites } from "../useFavorites";

beforeEach(() => {
  localStorage.clear();
});

test("adds favorites", () => {
  const { result } = renderHook(() => useFavorites());
  act(() => result.current.toggleFavorite("business", "biz-1"));
  expect(result.current.favorites).toEqual([{ type: "business", id: "biz-1" }]);
});
