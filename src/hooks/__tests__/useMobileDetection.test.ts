import { renderHook } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { useIsMobile } from "../use-mobile";

test("returns false when width is desktop", () => {
  Object.defineProperty(window, "innerWidth", { writable: true, value: 1024 });
  const { result } = renderHook(() => useIsMobile());

  act(() => {
    window.dispatchEvent(new Event("resize"));
  });

  expect(result.current).toBe(false);
});
