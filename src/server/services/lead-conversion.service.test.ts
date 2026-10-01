import { and, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { db } from "@/db";
import { activityLogs, clients, type Organization, type User } from "@/db/schema";
import { ConflictError, NotFoundError, ValidationError } from "@/server/errors";
import { getClient } from "@/server/services/client.service";
import { convertLead, getConversionClientId } from "@/server/services/lead-conversion.service";
import { changeLeadStatus, getLead } from "@/server/services/lead.service";
import { cleanup, createTestOrganization, createTestUser, insertTestLeads } from "@/test/fixtures";

function clientsIn(organizationId: string) {
  return db.select().from(clients).where(eq(clients.organizationId, organizationId));
}

describe("convertLead", () => {
  let user: User;
  let orgA: Organization;
  let orgB: Organization;

  const ctxA = () => ({ user, organization: orgA });

  beforeAll(async () => {
    [user, orgA, orgB] = await Promise.all([createTestUser(), createTestOrganization(), createTestOrganization()]);
  });

  afterAll(async () => {
    await cleanup({ organizationIds: [orgA.id, orgB.id], userIds: [user.id] });
  });

  it("creates a client from the lead, marks it won and logs both events", async () => {
    const [lead] = await insertTestLeads(orgA.id, [
      { name: "Acme Co.", email: "hi@acme.com", company: "Acme", service: "Website", source: "Referral", status: "QUALIFIED" },
    ]);

    const clientId = await convertLead(ctxA(), lead.id);
    const client = await getClient(orgA.id, clientId);

    expect(client).toMatchObject({ name: "Acme Co.", email: "hi@acme.com", company: "Acme" });
    expect(client.notes).toBe("Service: Website\n\nSource: Referral");
    expect((await getLead(orgA.id, lead.id)).status).toBe("WON");
    expect(await getConversionClientId(orgA.id, lead.id)).toBe(clientId);

    const clientActivity = await db
      .select()
      .from(activityLogs)
      .where(and(eq(activityLogs.resourceId, clientId), eq(activityLogs.action, "CLIENT_CREATED")));
    expect(clientActivity).toHaveLength(1);
  });

  it("refuses to convert the same lead twice", async () => {
    const [lead] = await insertTestLeads(orgA.id, [{ name: "Twice Ltd" }]);
    const before = (await clientsIn(orgA.id)).length;

    await convertLead(ctxA(), lead.id);
    await expect(convertLead(ctxA(), lead.id)).rejects.toBeInstanceOf(ConflictError);

    expect((await clientsIn(orgA.id)).length).toBe(before + 1);
    await expect(changeLeadStatus(ctxA(), lead.id, "QUALIFIED")).rejects.toBeInstanceOf(ValidationError);
  });

  it("creates exactly one client when two conversions race", async () => {
    const [lead] = await insertTestLeads(orgA.id, [{ name: "Race Inc" }]);
    const before = (await clientsIn(orgA.id)).length;

    const results = await Promise.allSettled([convertLead(ctxA(), lead.id), convertLead(ctxA(), lead.id)]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect((await clientsIn(orgA.id)).length).toBe(before + 1);
  });

  it("treats deleted leads and other workspaces' leads as not found", async () => {
    const [deleted] = await insertTestLeads(orgA.id, [{ name: "Gone", deletedAt: new Date() }]);
    const [foreign] = await insertTestLeads(orgB.id, [{ name: "Other workspace" }]);

    await expect(convertLead(ctxA(), deleted.id)).rejects.toBeInstanceOf(NotFoundError);
    await expect(convertLead(ctxA(), foreign.id)).rejects.toBeInstanceOf(NotFoundError);

    expect(await clientsIn(orgB.id)).toHaveLength(0);
    expect((await getLead(orgB.id, foreign.id)).status).toBe("NEW");
  });
});
