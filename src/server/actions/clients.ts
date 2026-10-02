"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { workspaceLimits } from "@/lib/redis/rate-limit";
import { readFormFields } from "@/lib/utils/form-data";
import { toActionError } from "@/server/actions/action-error";
import { requireWithinLimit } from "@/server/actions/rate-limit-guard";
import { requireOrganizationContext } from "@/server/auth/organization";
import { permissions, requirePermission } from "@/server/authorization/permissions";
import { addContact, removeContact, updateContact } from "@/server/services/client-contact.service";
import {
  archiveClient,
  createClient,
  deleteClientPermanently,
  restoreClient,
  updateClient,
} from "@/server/services/client.service";
import type { FormState } from "@/types/form-state";
import { deletionModeSchema } from "@/validators/fields";
import { clientFormSchema, clientIdSchema, contactFormSchema, contactIdSchema } from "@/validators/clients";

const clientFields = ["name", "email", "phone", "company", "website", "address", "country", "notes"] as const;
const contactFields = ["name", "email", "phone", "role", "isPrimary"] as const;

const invalidForm = "Check the highlighted fields and try again.";
const clientMissing = "This client no longer exists.";
const errorOptions = { scope: "clients", notFound: clientMissing };

export type ContactFormState = FormState | { success: true };

type ClientWritePermission =
  | typeof permissions.clientsCreate
  | typeof permissions.clientsUpdate
  | typeof permissions.clientsDelete;

async function requireClientWriter(permission: ClientWritePermission) {
  const ctx = await requireOrganizationContext();
  requirePermission(ctx, permission);
  await requireWithinLimit(ctx, workspaceLimits.writesPerUser);
  return ctx;
}

function revalidateClients(clientId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard/clients/archived");
  if (clientId) revalidatePath(`/dashboard/clients/${clientId}`);
}

export async function createClientAction(_previous: FormState, formData: FormData): Promise<FormState> {
  let clientId: string;

  try {
    const ctx = await requireClientWriter(permissions.clientsCreate);

    const parsed = clientFormSchema.safeParse(readFormFields(formData, clientFields));
    if (!parsed.success) {
      return { error: invalidForm, fieldErrors: z.flattenError(parsed.error).fieldErrors };
    }

    clientId = await createClient(ctx, parsed.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateClients(clientId);
  redirect(`/dashboard/clients/${clientId}?notice=client-created`);
}

export async function updateClientAction(id: string, _previous: FormState, formData: FormData): Promise<FormState> {
  const clientId = clientIdSchema.safeParse(id);

  if (!clientId.success) {
    return { error: clientMissing };
  }

  try {
    const ctx = await requireClientWriter(permissions.clientsUpdate);

    const parsed = clientFormSchema.safeParse(readFormFields(formData, clientFields));
    if (!parsed.success) {
      return { error: invalidForm, fieldErrors: z.flattenError(parsed.error).fieldErrors };
    }

    await updateClient(ctx, clientId.data, parsed.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateClients(clientId.data);
  redirect(`/dashboard/clients/${clientId.data}`);
}

export async function deleteClientAction(id: string, mode: string): Promise<{ error?: string }> {
  const clientId = clientIdSchema.safeParse(id);
  const deletion = deletionModeSchema.safeParse(mode);

  if (!clientId.success) {
    return { error: clientMissing };
  }

  if (!deletion.success) {
    return { error: "That delete option isn't valid." };
  }

  try {
    const ctx = await requireClientWriter(permissions.clientsDelete);

    if (deletion.data === "permanent") {
      await deleteClientPermanently(ctx, clientId.data);
    } else {
      await archiveClient(ctx, clientId.data);
    }
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateClients(clientId.data);
  return {};
}

export async function restoreClientAction(id: string): Promise<{ error?: string }> {
  const clientId = clientIdSchema.safeParse(id);

  if (!clientId.success) {
    return { error: clientMissing };
  }

  try {
    const ctx = await requireClientWriter(permissions.clientsDelete);
    await restoreClient(ctx, clientId.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateClients(clientId.data);
  return {};
}

export async function saveContactAction(
  ids: { clientId: string; contactId?: string },
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const clientId = clientIdSchema.safeParse(ids.clientId);
  const contactId = contactIdSchema.optional().safeParse(ids.contactId);

  if (!clientId.success || !contactId.success) {
    return { error: clientMissing };
  }

  try {
    const ctx = await requireClientWriter(permissions.clientsUpdate);

    const parsed = contactFormSchema.safeParse(readFormFields(formData, contactFields));
    if (!parsed.success) {
      return { error: invalidForm, fieldErrors: z.flattenError(parsed.error).fieldErrors };
    }

    if (contactId.data) {
      await updateContact(ctx, clientId.data, contactId.data, parsed.data);
    } else {
      await addContact(ctx, clientId.data, parsed.data);
    }
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateClients(clientId.data);
  return { success: true };
}

export async function removeContactAction(ids: { clientId: string; contactId: string }): Promise<{ error?: string }> {
  const clientId = clientIdSchema.safeParse(ids.clientId);
  const contactId = contactIdSchema.safeParse(ids.contactId);

  if (!clientId.success || !contactId.success) {
    return { error: clientMissing };
  }

  try {
    const ctx = await requireClientWriter(permissions.clientsUpdate);
    await removeContact(ctx, clientId.data, contactId.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateClients(clientId.data);
  return {};
}
