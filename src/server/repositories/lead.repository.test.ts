import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Organization } from "@/db/schema";
import { listLeads, pipelineLeads } from "@/server/repositories/lead.repository";
import { escapeLike } from "@/server/repositories/search";
import { cleanup, createTestOrganization, insertTestLeads } from "@/test/fixtures";
import { LEADS_PAGE_SIZE } from "@/validators/leads";

describe("lead.repository", () => {
  let orgA: Organization;
  let orgB: Organization;

  beforeAll(async () => {
    [orgA, orgB] = await Promise.all([createTestOrganization(), createTestOrganization()]);

    await insertTestLeads(orgA.id, [
      ...Array.from({ length: 26 }, (_, index) => ({ name: `Bulk lead ${index}`, status: "NEW" as const })),
      { name: "Jane Doe", email: "jane@northwind.com", status: "QUALIFIED" },
      { name: "Globex", company: "Globex 100% Corp", status: "NEGOTIATION" },
      { name: "Hidden", status: "QUALIFIED", deletedAt: new Date() },
      { name: "Closed", status: "WON" },
    ]);
    await insertTestLeads(orgB.id, [{ name: "Jane Other Org", email: "jane@other.com" }]);
  });

  afterAll(async () => {
    await cleanup({ organizationIds: [orgA.id, orgB.id], userIds: [] });
  });

  it("paginates and counts only visible leads", async () => {
    const first = await listLeads(orgA.id, { q: "", page: 1 });
    const second = await listLeads(orgA.id, { q: "", page: 2 });

    expect(first.total).toBe(29);
    expect(first.pageCount).toBe(Math.ceil(29 / LEADS_PAGE_SIZE));
    expect(first.rows).toHaveLength(LEADS_PAGE_SIZE);
    expect(second.rows).toHaveLength(29 - LEADS_PAGE_SIZE);
    expect([...first.rows, ...second.rows].some((lead) => lead.name === "Hidden")).toBe(false);
  });

  it("searches name, email and company within the organization only", async () => {
    expect((await listLeads(orgA.id, { q: "northwind", page: 1 })).rows.map((lead) => lead.name)).toEqual(["Jane Doe"]);
    expect((await listLeads(orgA.id, { q: "jane", page: 1 })).total).toBe(1);
    expect((await listLeads(orgA.id, { q: "globex 100%", page: 1 })).total).toBe(1);
  });

  it("treats LIKE wildcards literally", async () => {
    expect(escapeLike("100%_\\")).toBe("100\\%\\_\\\\");
    expect((await listLeads(orgA.id, { q: "%", page: 1 })).total).toBe(1);
  });

  it("filters by status", async () => {
    const result = await listLeads(orgA.id, { q: "", status: "QUALIFIED", page: 1 });
    expect(result.rows.map((lead) => lead.name)).toEqual(["Jane Doe"]);
  });

  it("caps pipeline columns and reports full totals", async () => {
    const pipeline = await pipelineLeads(orgA.id, { q: "" });
    const column = (status: string) => pipeline.columns.find((entry) => entry.status === status);

    expect(column("NEW")).toMatchObject({ total: 26 });
    expect(column("NEW")?.leads).toHaveLength(25);
    expect(column("QUALIFIED")?.total).toBe(1);
    expect(pipeline.closed).toEqual({ WON: 1, LOST: 0 });
  });

  it("never returns another organization's leads", async () => {
    const result = await listLeads(orgB.id, { q: "", page: 1 });
    expect(result.rows.map((lead) => lead.name)).toEqual(["Jane Other Org"]);
  });
});
