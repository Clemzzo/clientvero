import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { db } from "@/db";
import { clients, proposals, type Organization, type ProposalStatus, type User } from "@/db/schema";
import { countPendingProposals, listClientOptions, listProposals } from "@/server/repositories/proposal.repository";
import { generatePublicId } from "@/server/services/proposal.service";
import { cleanup, createTestOrganization, createTestUser } from "@/test/fixtures";

describe("proposal.repository", () => {
  let user: User;
  let orgA: Organization;
  let orgB: Organization;

  async function seed(organization: Organization, clientName: string, rows: { title: string; status: ProposalStatus }[]) {
    const [client] = await db.insert(clients).values({ organizationId: organization.id, name: clientName }).returning();

    await db.insert(proposals).values(
      rows.map((row) => ({
        ...row,
        organizationId: organization.id,
        clientId: client.id,
        createdBy: user.id,
        publicId: generatePublicId(),
        sentAt: row.status === "DRAFT" ? null : new Date(),
      })),
    );
  }

  beforeAll(async () => {
    [user, orgA, orgB] = await Promise.all([createTestUser(), createTestOrganization(), createTestOrganization()]);

    await seed(orgA, "Northwind", [
      { title: "Website redesign", status: "DRAFT" },
      { title: "Brand refresh", status: "SENT" },
      { title: "SEO audit", status: "VIEWED" },
      { title: "App MVP", status: "ACCEPTED" },
      { title: "Retainer", status: "DECLINED" },
    ]);
    await seed(orgB, "Other workspace client", [{ title: "Website redesign", status: "SENT" }]);
  });

  afterAll(async () => {
    await cleanup({ organizationIds: [orgA.id, orgB.id], userIds: [user.id] });
  });

  it("counts every status tab, with viewed proposals awaiting a response", async () => {
    const result = await listProposals(orgA.id, { q: "", status: "all", page: 1 });

    expect(result.counts).toEqual({ all: 5, draft: 1, sent: 2, accepted: 1, declined: 1 });
    expect((await listProposals(orgA.id, { q: "", status: "sent", page: 1 })).rows.map((row) => row.title).sort()).toEqual([
      "Brand refresh",
      "SEO audit",
    ]);
  });

  it("searches titles and client names", async () => {
    expect((await listProposals(orgA.id, { q: "audit", status: "all", page: 1 })).total).toBe(1);
    expect((await listProposals(orgA.id, { q: "northwind", status: "all", page: 1 })).total).toBe(5);
  });

  it("counts pending and sent proposals for the dashboard", async () => {
    expect(await countPendingProposals(orgA.id)).toEqual({ pending: 2, sent: 4 });
  });

  it("never returns another workspace's proposals or clients", async () => {
    const result = await listProposals(orgB.id, { q: "", status: "all", page: 1 });

    expect(result.rows.map((row) => row.clientName)).toEqual(["Other workspace client"]);
    expect((await listClientOptions(orgB.id)).map((option) => option.label)).toEqual(["Other workspace client"]);
  });
});
