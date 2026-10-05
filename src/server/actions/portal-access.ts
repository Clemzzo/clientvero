"use server";

import { revalidatePath } from "next/cache";

import { workspaceLimits } from "@/lib/redis/rate-limit";
import { toActionError } from "@/server/actions/action-error";
import { requireWithinLimit } from "@/server/actions/rate-limit-guard";
import { requireOrganizationContext } from "@/server/auth/organization";
import { permissions, requirePermission } from "@/server/authorization/permissions";
import {
  disableClientPortal,
  invitePortalClient,
  issuePortalLink,
  revokePortalAccess,
} from "@/server/services/portal-access.service";
import { clientIdSchema } from "@/validators/clients";
import { portalAccountIdSchema } from "@/validators/portal";

type LinkResult = { error?: string; url?: string };

const accessMissing = "This portal access no longer exists.";
const errorOptions = { scope: "portal-access", notFound: accessMissing };

async function requirePortalManager() {
  const ctx = await requireOrganizationContext();
  requirePermission(ctx, permissions.clientsUpdate);
  await requireWithinLimit(ctx, workspaceLimits.writesPerUser);
  return ctx;
}

function revalidateClients() {
  revalidatePath("/dashboard/clients", "layout");
}

export async function invitePortalClientAction(id: string): Promise<LinkResult> {
  const clientId = clientIdSchema.safeParse(id);

  if (!clientId.success) {
    return { error: "This client no longer exists." };
  }

  try {
    const ctx = await requirePortalManager();
    const url = await invitePortalClient(ctx, clientId.data);
    revalidateClients();
    return { url };
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }
}

export async function issuePortalLinkAction(id: string): Promise<LinkResult> {
  const accountId = portalAccountIdSchema.safeParse(id);

  if (!accountId.success) {
    return { error: accessMissing };
  }

  try {
    const ctx = await requirePortalManager();
    const url = await issuePortalLink(ctx, accountId.data);
    revalidateClients();
    return { url };
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }
}

export async function revokePortalAccessAction(id: string): Promise<{ error?: string }> {
  const accountId = portalAccountIdSchema.safeParse(id);

  if (!accountId.success) {
    return { error: accessMissing };
  }

  try {
    const ctx = await requirePortalManager();
    await revokePortalAccess(ctx, accountId.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateClients();
  return {};
}

export async function disableClientPortalAction(id: string): Promise<{ error?: string }> {
  const clientId = clientIdSchema.safeParse(id);

  if (!clientId.success) {
    return { error: "This client no longer exists." };
  }

  try {
    const ctx = await requirePortalManager();
    await disableClientPortal(ctx, clientId.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateClients();
  return {};
}
