import { describe, expect, it } from "vitest";

import { formatRating, formatReviewCount } from "@/lib/formatters";

describe("formatRating", () => {
  // O Postgres devolve numeric como "4.400000"; a UI imprimia isso cru.
  it("reduz a uma casa decimal e usa vírgula", () => {
    expect(formatRating(4.4)).toBe("4,4");
    expect(formatRating("4.400000")).toBe("4,4");
    expect(formatRating(5)).toBe("5,0");
    expect(formatRating(0)).toBe("0,0");
  });

  it("devolve null quando não há nota", () => {
    expect(formatRating(null)).toBeNull();
    expect(formatRating(undefined)).toBeNull();
    expect(formatRating("")).toBeNull();
    expect(formatRating("sem nota")).toBeNull();
  });
});

describe("formatReviewCount", () => {
  it("acerta o singular", () => {
    expect(formatReviewCount(1)).toBe("1 avaliação");
    expect(formatReviewCount(46)).toBe("46 avaliações");
    expect(formatReviewCount(0)).toBe("0 avaliações");
  });

  it("devolve null sem contagem", () => {
    expect(formatReviewCount(null)).toBeNull();
  });
});
