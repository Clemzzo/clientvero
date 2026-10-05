import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { db } from "@/db";
import { clients, portalAccounts, type Organization } from "@/db/schema";
import { listArchivedClients, listClients } from "@/server/repositories/client.repository";
import { cleanup, createTestOrganization } from "@/test/fixtures";
import { CLIENTS_PAGE_SIZE } from "@/validators/clients";

describe("listClients", () => {
  let orgA: Organization;
  let orgB: Organization;

  beforeAll(async () => {
    [orgA, orgB] = await Promise.all([createTestOrganization(), createTestOrganization()]);

    const inserted = await db
      .insert(clients)
      .values([
        ...Array.from({ length: 22 }, (_, index) => ({ organizationId: orgA.id, name: `Client ${index}` })),
        { organizationId: orgA.id, name: "Northwind", email: "ops@northwind.com" },
        { organizationId: orgA.id, name: "Globex", company: "Globex 100% Corp" },
        { organizationId: orgA.id, name: "Archived", deletedAt: new Date() },
        { organizationId: orgB.id, name: "Northwind (other workspace)" },
      ])
      .returning();

    const northwind = inserted.find((client) => client.name === "Northwind")!;
    await db
      .insert(portalAccounts)
      .values({ organizationId: orgA.id, clientId: northwind.id, email: "ops@northwind.com", status: "ACTIVE" });
  });

  afterAll(async () => {
    await cleanup({ organizationIds: [orgA.id, orgB.id], userIds: [] });
  });

  it("paginates visible clients only", async () => {
    const first = await listClients(orgA.id, { q: "", page: 1 });

    expect(first.total).toBe(24);
    expect(first.rows).toHaveLength(CLIENTS_PAGE_SIZE);
    expect(first.pageCount).toBe(2);
  });

  it("searches name, email and company and shows portal status", async () => {
    const byEmail = await listClients(orgA.id, { q: "northwind.com", page: 1 });

    expect(byEmail.rows.map((client) => [client.name, client.portalStatus])).toEqual([["Northwind", "ACTIVE"]]);
    expect((await listClients(orgA.id, { q: "globex", page: 1 })).rows[0].portalStatus).toBeNull();
    expect((await listClients(orgA.id, { q: "100%", page: 1 })).total).toBe(1);
    expect((await listClients(orgA.id, { q: "archived", page: 1 })).total).toBe(0);
  });

  it("never returns another workspace's clients", async () => {
    const result = await listClients(orgB.id, { q: "", page: 1 });
    expect(result.rows.map((client) => client.name)).toEqual(["Northwind (other workspace)"]);
  });

  it("lists only this workspace's archived clients, with search", async () => {
    const archived = await listArchivedClients(orgA.id, { q: "", page: 1 });

    expect(archived.total).toBe(1);
    expect(archived.rows).toEqual([expect.objectContaining({ name: "Archived", archivedAt: expect.any(Date) })]);
    expect((await listArchivedClients(orgA.id, { q: "northwind", page: 1 })).total).toBe(0);
    expect((await listArchivedClients(orgB.id, { q: "", page: 1 })).total).toBe(0);
  });
});
