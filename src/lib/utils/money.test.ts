import { describe, expect, it } from "vitest";

import { fromCents, proposalTotal, toCents } from "@/lib/utils/money";

describe("money", () => {
  it("round-trips decimal strings through cents", () => {
    for (const value of ["0.00", "0.10", "1500.50", "999999999999.99"]) {
      expect(fromCents(toCents(value))).toBe(value);
    }
    expect(fromCents(toCents("12.5"))).toBe("12.50");
  });

  it("adds without floating-point drift", () => {
    expect(fromCents(toCents("0.10") + toCents("0.20"))).toBe("0.30");
  });

  it("computes the proposal total as amount − discount + tax", () => {
    expect(proposalTotal({ subtotal: "1500.00", discount: "100.00", tax: "75.00" })).toBe("1475.00");
    expect(proposalTotal({ subtotal: "999999999999.99", discount: "0.99", tax: "0" })).toBe("999999999999.00");
  });

  it("rejects malformed amounts", () => {
    expect(() => toCents("1e3")).toThrow();
    expect(() => toCents("1.234")).toThrow();
  });
});
