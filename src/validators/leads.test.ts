import { describe, expect, it } from "vitest";

import { leadFormSchema, leadListQuerySchema } from "@/validators/leads";

const validLead = { name: "Acme Co.", currency: "USD" };

function parseLead(overrides: Record<string, string>) {
  return leadFormSchema.safeParse({ ...validLead, ...overrides });
}

describe("leadFormSchema", () => {
  it.each(["1500", "1500.5", "1500.50", "1,500.50"])("accepts the amount %s as an exact string", (value) => {
    const result = parseLead({ estimatedValue: value });
    expect(result.success && result.data.estimatedValue).toBe(value.replaceAll(",", ""));
  });

  it.each(["1e3", "-5", "1.234", "abc"])("rejects the amount %s", (value) => {
    expect(parseLead({ estimatedValue: value }).success).toBe(false);
  });

  it("turns empty optional fields into null", () => {
    const result = parseLead({ email: "", phone: " ", estimatedValue: "", website: "" });

    expect(result.success && result.data).toMatchObject({ email: null, phone: null, estimatedValue: null, website: null });
  });

  it("adds a scheme to websites and lower-cases emails", () => {
    const result = parseLead({ website: "acme.com", email: "Hello@Acme.COM" });

    expect(result.success && result.data).toMatchObject({ website: "https://acme.com", email: "hello@acme.com" });
  });

  it("requires a name and a known currency", () => {
    expect(parseLead({ name: "  " }).success).toBe(false);
    expect(parseLead({ currency: "XYZ" }).success).toBe(false);
  });
});

describe("leadListQuerySchema", () => {
  it("falls back to safe defaults for bad query params", () => {
    expect(leadListQuerySchema.parse({ view: "grid", status: "MAYBE", page: "-2", q: ["a", "b"] })).toEqual({
      view: "list",
      q: "",
      status: undefined,
      page: 1,
    });
  });

  it("keeps valid query params", () => {
    expect(leadListQuerySchema.parse({ view: "pipeline", status: "QUALIFIED", page: "3", q: " acme " })).toEqual({
      view: "pipeline",
      q: "acme",
      status: "QUALIFIED",
      page: 3,
    });
  });
});
