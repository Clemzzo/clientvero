import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Organization } from "@/db/schema";
import { getDashboardOverview } from "@/server/repositories/dashboard.repository";
import { cleanup, createTestOrganization, insertTestLeads } from "@/test/fixtures";

describe("getDashboardOverview", () => {
  let orgA: Organization;
  let orgB: Organization;

  beforeAll(async () => {
    [orgA, orgB] = await Promise.all([createTestOrganization("USD"), createTestOrganization("USD")]);

    await insertTestLeads(orgA.id, [
      { name: "New USD", status: "NEW", estimatedValue: "1000.50", currency: "USD" },
      { name: "Qualified USD", status: "QUALIFIED", estimatedValue: "2000.25", currency: "USD" },
      { name: "Negotiation EUR", status: "NEGOTIATION", estimatedValue: "500.00", currency: "EUR" },
      { name: "Won USD", status: "WON", estimatedValue: "9999.00", currency: "USD" },
      { name: "Lost", status: "LOST", currency: "USD" },
      { name: "Deleted", status: "NEW", estimatedValue: "7777.00", currency: "USD", deletedAt: new Date() },
    ]);

    await insertTestLeads(orgB.id, [{ name: "Other tenant", status: "NEW", estimatedValue: "123456.00", currency: "USD" }]);
  });

  afterAll(async () => {
    await cleanup({ organizationIds: [orgA.id, orgB.id], userIds: [] });
  });

  it("counts only this organization's non-deleted leads", async () => {
    const { leads } = await getDashboardOverview(orgA.id, "USD");

    expect(leads.total).toBe(5);
    expect(leads.open).toBe(3);
    expect(leads.newThisWeek).toBe(5);
    expect(leads.byStatus).toEqual({ NEW: 1, QUALIFIED: 1, PROPOSAL_SENT: 0, NEGOTIATION: 1, WON: 1, LOST: 1 });
  });

  it("sums open pipeline value in the organization's currency as an exact decimal", async () => {
    const { leads } = await getDashboardOverview(orgA.id, "USD");

    expect(leads.pipelineValue).toBe("3000.75");
    expect(leads.openInOtherCurrencies).toBe(1);
  });

  it("never includes another organization's leads", async () => {
    const { leads } = await getDashboardOverview(orgB.id, "USD");

    expect(leads.total).toBe(1);
    expect(leads.pipelineValue).toBe("123456.00");
  });
});
