import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Organization, User } from "@/db/schema";
import { PlanLimitError } from "@/server/errors";
import { archiveClient, createClient, restoreClient } from "@/server/services/client.service";
import { createInvoice } from "@/server/services/invoice.service";
import { convertLead } from "@/server/services/lead-conversion.service";
import { archiveProject, changeProjectStatus, createProject, restoreProject } from "@/server/services/project.service";
import { createProposal } from "@/server/services/proposal.service";
import { cleanup, createTestOrganization, createTestUser, insertTestLeads, setTestSubscription } from "@/test/fixtures";
import type { ClientFormInput } from "@/validators/clients";

const clientInput: ClientFormInput = {
  name: "Acme Co.",
  email: "hello@acme.com",
  phone: null,
  company: null,
  website: null,
  address: null,
  country: "NG",
  notes: null,
};

const projectInput = {
  name: "Website",
  description: null,
  budget: null,
  currency: "USD",
  startDate: null,
  dueDate: null,
  proposalId: null,
};

describe("Free plan limits", () => {
  let user: User;
  let org: Organization;
  const ctx = () => ({ user, organization: org });

  function addProposal(clientId: string) {
    return createProposal(ctx(), {
      clientId,
      title: "Website redesign",
      description: null,
      currency: "USD",
      subtotal: "1000.00",
      discount: "0",
      tax: "0",
      timeline: null,
      terms: null,
      sections: [{ title: "Scope", content: "Five pages", sectionType: "SCOPE" }],
    });
  }

  function addInvoice(clientId: string) {
    return createInvoice(ctx(), {
      clientId,
      projectId: null,
      currency: "USD",
      issueDate: "2026-10-26",
      dueDate: "2026-11-09",
      discount: "0",
      notes: null,
      paymentInstructions: null,
      items: [{ description: "Design", quantity: "1", unitPrice: "100.00" }],
    });
  }

  beforeAll(async () => {
    [user, org] = await Promise.all([createTestUser(), createTestOrganization("USD", { plan: "free" })]);
  });

  afterAll(async () => {
    await cleanup({ organizationIds: [org.id], userIds: [user.id] });
  });

  it("blocks a third client, including by conversion and restore", async () => {
    const first = await createClient(ctx(), clientInput);
    await createClient(ctx(), clientInput);

    await expect(createClient(ctx(), clientInput)).rejects.toBeInstanceOf(PlanLimitError);
    await expect(createClient(ctx(), clientInput)).rejects.toThrow("Your Free plan includes 2 clients.");

    const [lead] = await insertTestLeads(org.id, [{ name: "Lead", status: "QUALIFIED" }]);
    await expect(convertLead(ctx(), lead.id)).rejects.toBeInstanceOf(PlanLimitError);

    await archiveClient(ctx(), first);
    await createClient(ctx(), clientInput);
    await expect(restoreClient(ctx(), first)).rejects.toBeInstanceOf(PlanLimitError);
  });

  it("counts only active projects", async () => {
    await setTestSubscription(org.id, "ACTIVE");
    const anyClient = await createClient(ctx(), clientInput);
    await setTestSubscription(org.id, "CANCELLED");

    const paused = await createProject(ctx(), { ...projectInput, clientId: anyClient });
    await createProject(ctx(), { ...projectInput, clientId: anyClient });
    await expect(createProject(ctx(), { ...projectInput, clientId: anyClient })).rejects.toBeInstanceOf(PlanLimitError);

    await changeProjectStatus(ctx(), paused, "PAUSED");
    const archived = await createProject(ctx(), { ...projectInput, clientId: anyClient });
    await expect(changeProjectStatus(ctx(), paused, "IN_PROGRESS")).rejects.toBeInstanceOf(PlanLimitError);
    await changeProjectStatus(ctx(), paused, "COMPLETED");

    await archiveProject(ctx(), archived);
    await createProject(ctx(), { ...projectInput, clientId: anyClient });
    await expect(restoreProject(ctx(), archived)).rejects.toBeInstanceOf(PlanLimitError);
  });

  it("blocks the third proposal and invoice this month", async () => {
    await setTestSubscription(org.id, "ACTIVE");
    const clientId = await createClient(ctx(), clientInput);
    await setTestSubscription(org.id, "CANCELLED");

    await addProposal(clientId);
    await addProposal(clientId);
    await expect(addProposal(clientId)).rejects.toBeInstanceOf(PlanLimitError);

    await addInvoice(clientId);
    await addInvoice(clientId);
    await expect(addInvoice(clientId)).rejects.toBeInstanceOf(PlanLimitError);
  });

  it("lifts the limits on an active paid plan, and brings them back while past due", async () => {
    await setTestSubscription(org.id, "ACTIVE");
    await expect(createClient(ctx(), clientInput)).resolves.toEqual(expect.any(String));

    await setTestSubscription(org.id, "PAST_DUE");
    await expect(createClient(ctx(), clientInput)).rejects.toBeInstanceOf(PlanLimitError);
  });
});
