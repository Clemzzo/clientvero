import { describe, expect, it } from "vitest";

import { proposalFormSchema, proposalListQuerySchema, proposalPublicIdSchema } from "@/validators/proposals";

const base = {
  clientId: "6f1c2a8e-4b4d-4d8e-9a3f-2b6a1c9d0e11",
  title: "Website redesign",
  currency: "USD",
  subtotal: "1500",
  sections: JSON.stringify([{ title: "Scope", content: "Five pages", sectionType: "SCOPE" }]),
};

function parse(overrides: Record<string, string>) {
  return proposalFormSchema.safeParse({ ...base, ...overrides });
}

describe("proposalFormSchema", () => {
  it("requires an amount above zero and defaults discount and tax to zero", () => {
    expect(parse({ subtotal: "" }).success).toBe(false);
    expect(parse({ subtotal: "0" }).success).toBe(false);

    const result = parse({});
    expect(result.success && result.data).toMatchObject({ subtotal: "1500", discount: "0", tax: "0" });
  });

  it("rejects a discount larger than the amount", () => {
    const result = parse({ discount: "1500.01" });
    expect(result.success).toBe(false);
    expect(!result.success && result.error.issues[0].path).toEqual(["discount"]);
  });

  it("parses sections and enforces their limits", () => {
    expect(parse({ sections: "not json" }).success).toBe(false);
    expect(parse({ sections: "[]" }).success).toBe(false);
    expect(parse({ sections: JSON.stringify([{ title: "", content: "", sectionType: "INTRO" }]) }).success).toBe(false);
    expect(parse({ sections: JSON.stringify([{ title: "X", content: "", sectionType: "BOGUS" }]) }).success).toBe(false);

    const tooMany = Array.from({ length: 21 }, () => ({ title: "X", content: "", sectionType: "CUSTOM" }));
    expect(parse({ sections: JSON.stringify(tooMany) }).success).toBe(false);
  });
});

describe("proposal ids and query params", () => {
  it("accepts only well-formed public ids", () => {
    expect(proposalPublicIdSchema.safeParse("a".repeat(22)).success).toBe(true);
    expect(proposalPublicIdSchema.safeParse("a".repeat(21)).success).toBe(false);
    expect(proposalPublicIdSchema.safeParse("../../etc/passwd-xxxxxx").success).toBe(false);
  });

  it("falls back to safe defaults", () => {
    expect(proposalListQuerySchema.parse({ status: "archived", page: "-1" })).toEqual({ q: "", status: "all", page: 1 });
  });
});
