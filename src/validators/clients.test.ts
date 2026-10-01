import { describe, expect, it } from "vitest";

import { clientFormSchema, clientListQuerySchema, clientTabSchema, contactFormSchema } from "@/validators/clients";

describe("clientFormSchema", () => {
  it("turns empty optional fields into null and normalises website and email", () => {
    const result = clientFormSchema.safeParse({ name: "Acme", email: "Hi@Acme.COM", website: "acme.com", country: "", address: " " });

    expect(result.success && result.data).toMatchObject({
      name: "Acme",
      email: "hi@acme.com",
      website: "https://acme.com",
      country: null,
      address: null,
      phone: null,
    });
  });

  it("requires a name and a known country code", () => {
    expect(clientFormSchema.safeParse({ name: " " }).success).toBe(false);
    expect(clientFormSchema.safeParse({ name: "Acme", country: "XX" }).success).toBe(false);
    expect(clientFormSchema.safeParse({ name: "Acme", country: "NG" }).success).toBe(true);
  });
});

describe("contactFormSchema", () => {
  it("reads the primary checkbox", () => {
    expect(contactFormSchema.parse({ name: "Jane", isPrimary: "on" }).isPrimary).toBe(true);
    expect(contactFormSchema.parse({ name: "Jane" }).isPrimary).toBe(false);
  });
});

describe("client query params", () => {
  it("falls back to safe defaults", () => {
    expect(clientListQuerySchema.parse({ q: ["a"], page: "zero" })).toEqual({ q: "", page: 1 });
    expect(clientTabSchema.parse("billing")).toBe("overview");
  });
});
