import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { db } from "@/db";
import { activityLogs, type Organization, type User } from "@/db/schema";
import { NotFoundError, ValidationError } from "@/server/errors";
import { changeLeadStatus, createLead, getLead, updateLead } from "@/server/services/lead.service";
import { cleanup, createTestOrganization, createTestUser } from "@/test/fixtures";
import type { LeadFormInput } from "@/validators/leads";

const input: LeadFormInput = {
  name: "Acme Co.",
  email: "hello@acme.com",
  phone: null,
  company: "Acme",
  website: null,
  source: "Referral",
  service: null,
  estimatedValue: "2500.50",
  currency: "EUR",
  notes: null,
};

function activityFor(leadId: string) {
  return db.select().from(activityLogs).where(eq(activityLogs.resourceId, leadId)).orderBy(activityLogs.createdAt);
}

describe("lead.service", () => {
  let user: User;
  let orgA: Organization;
  let orgB: Organization;
  let leadB: string;

  const ctxA = () => ({ user, organization: orgA });
  const ctxB = () => ({ user, organization: orgB });

  beforeAll(async () => {
    [user, orgA, orgB] = await Promise.all([createTestUser(), createTestOrganization("USD"), createTestOrganization("USD")]);
    leadB = await createLead(ctxB(), { ...input, name: "Org B lead" });
  });

  afterAll(async () => {
    await cleanup({ organizationIds: [orgA.id, orgB.id], userIds: [user.id] });
  });

  it("creates a lead with an exact value and logs LEAD_CREATED", async () => {
    const leadId = await createLead(ctxA(), input);
    const lead = await getLead(orgA.id, leadId);

    expect(lead).toMatchObject({ name: "Acme Co.", status: "NEW", estimatedValue: "2500.50", currency: "EUR" });
    expect((await activityFor(leadId)).map((entry) => entry.action)).toEqual(["LEAD_CREATED"]);
  });

  it("updates a lead and changes its status, logging each change", async () => {
    const leadId = await createLead(ctxA(), input);

    await updateLead(ctxA(), leadId, { ...input, name: "Acme Ltd" });
    await changeLeadStatus(ctxA(), leadId, "QUALIFIED");
    await changeLeadStatus(ctxA(), leadId, "QUALIFIED");

    expect(await getLead(orgA.id, leadId)).toMatchObject({ name: "Acme Ltd", status: "QUALIFIED" });

    const actions = (await activityFor(leadId)).map((entry) => entry.action);
    expect(actions).toEqual(["LEAD_CREATED", "LEAD_UPDATED", "LEAD_STATUS_CHANGED"]);
  });

  it("refuses to mark a lead won by hand", async () => {
    const leadId = await createLead(ctxA(), input);

    await expect(changeLeadStatus(ctxA(), leadId, "WON")).rejects.toBeInstanceOf(ValidationError);
  });

  describe("tenant isolation", () => {
    it("treats another organization's lead as not found", async () => {
      await expect(getLead(orgA.id, leadB)).rejects.toBeInstanceOf(NotFoundError);
      await expect(updateLead(ctxA(), leadB, { ...input, name: "Hijacked" })).rejects.toBeInstanceOf(NotFoundError);
      await expect(changeLeadStatus(ctxA(), leadB, "LOST")).rejects.toBeInstanceOf(NotFoundError);
    });

    it("leaves the other organization's lead untouched", async () => {
      expect(await getLead(orgB.id, leadB)).toMatchObject({ name: "Org B lead", status: "NEW" });
      expect((await activityFor(leadB)).map((entry) => entry.action)).toEqual(["LEAD_CREATED"]);
    });
  });
});
