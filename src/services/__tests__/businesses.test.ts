import { describe, expect, test, vi } from "vitest";
import { getBusinessesByCategorySlug } from "../businesses";

const chain = {
  select: () => chain,
  in: () => chain,
  or: () => chain,
  limit: () => Promise.resolve({ data: [], error: null }),
};

vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    from: () => chain,
  },
}));

vi.mock("../supabaseRequest", () => ({
  executeSupabase: (operation: () => Promise<{ data: [] }>) => operation(),
}));

describe("getBusinessesByCategorySlug", () => {
  test("handles empty data", async () => {
    const result = await getBusinessesByCategorySlug("comer-agora");
    expect(result).toEqual([]);
  });
});
