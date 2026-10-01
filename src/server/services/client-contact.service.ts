import "server-only";

import { randomUUID } from "node:crypto";

import { and, asc, desc, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import { clientContacts, type ClientContact } from "@/db/schema";
import { activityActions } from "@/features/activity/activity-actions";
import type { WorkspaceActor } from "@/server/auth/organization";
import { NotFoundError } from "@/server/errors";
import { clientActivity, getClient } from "@/server/services/client.service";
import type { ContactFormInput } from "@/validators/clients";

function contactScope(organizationId: string, clientId: string, contactId: string) {
  return and(
    eq(clientContacts.id, contactId),
    eq(clientContacts.clientId, clientId),
    eq(clientContacts.organizationId, organizationId),
  );
}

function clearOtherPrimaries(organizationId: string, clientId: string, keepContactId: string) {
  return db
    .update(clientContacts)
    .set({ isPrimary: false })
    .where(
      and(
        eq(clientContacts.organizationId, organizationId),
        eq(clientContacts.clientId, clientId),
        eq(clientContacts.isPrimary, true),
        ne(clientContacts.id, keepContactId),
      ),
    );
}

async function getContact(organizationId: string, clientId: string, contactId: string): Promise<ClientContact> {
  const [contact] = await db
    .select()
    .from(clientContacts)
    .where(contactScope(organizationId, clientId, contactId))
    .limit(1);

  if (!contact) {
    throw new NotFoundError("This contact no longer exists.");
  }

  return contact;
}

export function listContacts(organizationId: string, clientId: string): Promise<ClientContact[]> {
  return db
    .select()
    .from(clientContacts)
    .where(and(eq(clientContacts.organizationId, organizationId), eq(clientContacts.clientId, clientId)))
    .orderBy(desc(clientContacts.isPrimary), asc(clientContacts.name));
}

export async function addContact(ctx: WorkspaceActor, clientId: string, input: ContactFormInput): Promise<void> {
  const organizationId = ctx.organization.id;
  await getClient(organizationId, clientId);
  const contactId = randomUUID();

  const insert = db.insert(clientContacts).values({ ...input, id: contactId, organizationId, clientId });
  const activity = clientActivity(ctx, clientId, activityActions.contactAdded, { contactName: input.name });

  await db.batch(
    input.isPrimary ? [clearOtherPrimaries(organizationId, clientId, contactId), insert, activity] : [insert, activity],
  );
}

export async function updateContact(
  ctx: WorkspaceActor,
  clientId: string,
  contactId: string,
  input: ContactFormInput,
): Promise<void> {
  const organizationId = ctx.organization.id;
  await getContact(organizationId, clientId, contactId);

  const update = db.update(clientContacts).set(input).where(contactScope(organizationId, clientId, contactId));
  const activity = clientActivity(ctx, clientId, activityActions.contactUpdated, { contactName: input.name });

  await db.batch(
    input.isPrimary ? [clearOtherPrimaries(organizationId, clientId, contactId), update, activity] : [update, activity],
  );
}

export async function removeContact(ctx: WorkspaceActor, clientId: string, contactId: string): Promise<void> {
  const organizationId = ctx.organization.id;
  const contact = await getContact(organizationId, clientId, contactId);

  await db.batch([
    db.delete(clientContacts).where(contactScope(organizationId, clientId, contactId)),
    clientActivity(ctx, clientId, activityActions.contactRemoved, { contactName: contact.name }),
  ]);
}
