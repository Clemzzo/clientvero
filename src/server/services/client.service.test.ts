import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { db } from "@/db";
import { activityLogs, clients, type Organization, type User } from "@/db/schema";
import { ConflictError, NotFoundError } from "@/server/errors";
import {
  archiveClient,
  createClient,
  deleteClientPermanently,
  getClient,
  restoreClient,
  updateClient,
} from "@/server/services/client.service";
import { createProject } from "@/server/services/project.service";
import { createProposal } from "@/server/services/proposal.service";
import { cleanup, createTestOrganization, createTestUser } from "@/test/fixtures";
import type { ClientFormInput } from "@/validators/clients";

const clientInput: ClientFormInput = {
  name: "Acme Co.",
  email: "hello@acme.com",
  phone: null,
  company: "Acme",
  website: null,
  address: null,
  country: "NG",
  notes: null,
};

async function actionsFor(resourceId: string) {
  const rows = await db.select().from(activityLogs).where(eq(activityLogs.resourceId, resourceId)).orderBy(activityLogs.createdAt);
  return rows.map((row) => row.action);
}

describe("client services", () => {
  let user: User;
  let orgA: Organization;
  let orgB: Organization;
  let clientB: string;

  const ctxA = () => ({ user, organization: orgA });

  function addProposal(clientId: string) {
    return createProposal(ctxA(), {
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

  beforeAll(async () => {
    [user, orgA, orgB] = await Promise.all([createTestUser(), createTestOrganization(), createTestOrganization()]);
    clientB = await createClient({ user, organization: orgB }, { ...clientInput, name: "Org B client" });
  });

  afterAll(async () => {
    await cleanup({ organizationIds: [orgA.id, orgB.id], userIds: [user.id] });
  });

  it("creates and updates a client, logging each change", async () => {
    const clientId = await createClient(ctxA(), clientInput);
    await updateClient(ctxA(), clientId, { ...clientInput, name: "Acme Ltd" });

    expect(await getClient(orgA.id, clientId)).toMatchObject({ name: "Acme Ltd", country: "NG" });
    expect(await actionsFor(clientId)).toEqual(["CLIENT_CREATED", "CLIENT_UPDATED"]);
  });

  it("archives a client: hidden from the workspace, row and history kept", async () => {
    const clientId = await createClient(ctxA(), clientInput);

    await archiveClient(ctxA(), clientId);

    await expect(getClient(orgA.id, clientId)).rejects.toBeInstanceOf(NotFoundError);
    expect(await db.select().from(clients).where(eq(clients.id, clientId))).toHaveLength(1);
    expect(await actionsFor(clientId)).toEqual(["CLIENT_CREATED", "CLIENT_DELETED"]);
  });

  it("permanently deletes a client and its history, leaving only the deletion entry", async () => {
    const clientId = await createClient(ctxA(), clientInput);

    await deleteClientPermanently(ctxA(), clientId);

    expect(await db.select().from(clients).where(eq(clients.id, clientId))).toHaveLength(0);
    expect(await actionsFor(clientId)).toEqual(["CLIENT_DELETED_PERMANENTLY"]);
  });

  it("refuses to permanently delete a client that has proposals", async () => {
    const clientId = await createClient(ctxA(), clientInput);
    await addProposal(clientId);

    await expect(deleteClientPermanently(ctxA(), clientId)).rejects.toBeInstanceOf(ConflictError);
    expect(await getClient(orgA.id, clientId)).toMatchObject({ name: "Acme Co." });
    expect(await actionsFor(clientId)).toEqual(["CLIENT_CREATED"]);
  });

  it("refuses to permanently delete a client that has a project", async () => {
    const clientId = await createClient(ctxA(), clientInput);
    await createProject(ctxA(), {
      clientId,
      proposalId: null,
      name: "Website build",
      description: null,
      budget: null,
      currency: "USD",
      startDate: null,
      dueDate: null,
    });

    await expect(deleteClientPermanently(ctxA(), clientId)).rejects.toBeInstanceOf(ConflictError);
    expect(await getClient(orgA.id, clientId)).toMatchObject({ name: "Acme Co." });
  });

  it("permanently deletes an archived client, but not one with proposals", async () => {
    const plain = await createClient(ctxA(), clientInput);
    const withProposal = await createClient(ctxA(), clientInput);
    await addProposal(withProposal);
    await archiveClient(ctxA(), plain);
    await archiveClient(ctxA(), withProposal);

    await deleteClientPermanently(ctxA(), plain);
    await expect(deleteClientPermanently(ctxA(), withProposal)).rejects.toBeInstanceOf(ConflictError);

    expect(await db.select().from(clients).where(eq(clients.id, plain))).toHaveLength(0);
    expect(await db.select().from(clients).where(eq(clients.id, withProposal))).toHaveLength(1);
  });

  it("restores an archived client and logs CLIENT_RESTORED", async () => {
    const clientId = await createClient(ctxA(), clientInput);
    await archiveClient(ctxA(), clientId);

    await restoreClient(ctxA(), clientId);

    expect(await getClient(orgA.id, clientId)).toMatchObject({ name: "Acme Co.", deletedAt: null });
    expect(await actionsFor(clientId)).toEqual(["CLIENT_CREATED", "CLIENT_DELETED", "CLIENT_RESTORED"]);
  });

  it("treats restoring an active client as not found", async () => {
    const clientId = await createClient(ctxA(), clientInput);

    await expect(restoreClient(ctxA(), clientId)).rejects.toBeInstanceOf(NotFoundError);
  });

  describe("tenant isolation", () => {
    it("treats another workspace's client as not found", async () => {
      await expect(getClient(orgA.id, clientB)).rejects.toBeInstanceOf(NotFoundError);
      await expect(updateClient(ctxA(), clientB, clientInput)).rejects.toBeInstanceOf(NotFoundError);
      await expect(archiveClient(ctxA(), clientB)).rejects.toBeInstanceOf(NotFoundError);
      await expect(deleteClientPermanently(ctxA(), clientB)).rejects.toBeInstanceOf(NotFoundError);
      expect(await getClient(orgB.id, clientB)).toMatchObject({ name: "Org B client" });
    });

    it("can't restore or permanently delete another workspace's archived client", async () => {
      const ctxB = { user, organization: orgB };
      const archivedB = await createClient(ctxB, { ...clientInput, name: "Org B archived" });
      await archiveClient(ctxB, archivedB);

      await expect(restoreClient(ctxA(), archivedB)).rejects.toBeInstanceOf(NotFoundError);
      await expect(deleteClientPermanently(ctxA(), archivedB)).rejects.toBeInstanceOf(NotFoundError);
      expect(await db.select().from(clients).where(eq(clients.id, archivedB))).toMatchObject([
        { name: "Org B archived", deletedAt: expect.any(Date) },
      ]);
    });
  });
});
