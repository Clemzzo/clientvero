import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { db } from "@/db";
import { activityLogs, type Organization, type User } from "@/db/schema";
import { NotFoundError } from "@/server/errors";
import { addContact, listContacts, removeContact, updateContact } from "@/server/services/client-contact.service";
import { createClient, getClient, updateClient } from "@/server/services/client.service";
import { cleanup, createTestOrganization, createTestUser } from "@/test/fixtures";
import type { ClientFormInput, ContactFormInput } from "@/validators/clients";

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

function contact(name: string, isPrimary = false): ContactFormInput {
  return { name, email: null, phone: null, role: null, isPrimary };
}

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

  it("keeps exactly one primary contact", async () => {
    const clientId = await createClient(ctxA(), clientInput);

    await addContact(ctxA(), clientId, contact("Jane", true));
    await addContact(ctxA(), clientId, contact("Sam", true));

    const contacts = await listContacts(orgA.id, clientId);
    expect(contacts.filter((entry) => entry.isPrimary).map((entry) => entry.name)).toEqual(["Sam"]);
    expect(contacts.map((entry) => entry.name)).toEqual(["Sam", "Jane"]);
  });

  it("edits and removes contacts, logging each change", async () => {
    const clientId = await createClient(ctxA(), clientInput);
    await addContact(ctxA(), clientId, contact("Jane"));
    const [jane] = await listContacts(orgA.id, clientId);

    await updateContact(ctxA(), clientId, jane.id, { ...contact("Jane Doe"), role: "Founder" });
    expect((await listContacts(orgA.id, clientId))[0]).toMatchObject({ name: "Jane Doe", role: "Founder" });

    await removeContact(ctxA(), clientId, jane.id);
    expect(await listContacts(orgA.id, clientId)).toHaveLength(0);
    expect(await actionsFor(clientId)).toEqual(["CLIENT_CREATED", "CONTACT_ADDED", "CONTACT_UPDATED", "CONTACT_REMOVED"]);
  });

  describe("tenant isolation", () => {
    it("treats another workspace's client as not found", async () => {
      await expect(getClient(orgA.id, clientB)).rejects.toBeInstanceOf(NotFoundError);
      await expect(updateClient(ctxA(), clientB, clientInput)).rejects.toBeInstanceOf(NotFoundError);
      await expect(addContact(ctxA(), clientB, contact("Intruder"))).rejects.toBeInstanceOf(NotFoundError);
    });

    it("can't edit or remove another workspace's contacts", async () => {
      await addContact({ user, organization: orgB }, clientB, contact("Their contact"));
      const [theirs] = await listContacts(orgB.id, clientB);

      await expect(updateContact(ctxA(), clientB, theirs.id, contact("Changed"))).rejects.toBeInstanceOf(NotFoundError);
      await expect(removeContact(ctxA(), clientB, theirs.id)).rejects.toBeInstanceOf(NotFoundError);
      expect(await listContacts(orgA.id, clientB)).toHaveLength(0);
      expect((await listContacts(orgB.id, clientB))[0].name).toBe("Their contact");
    });
  });
});
