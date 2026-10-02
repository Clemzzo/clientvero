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
import { convertLead } from "@/server/services/lead-conversion.service";
import {
  archiveLead,
  changeLeadStatus,
  createLead,
  deleteLeadPermanently,
  restoreLead,
  updateLead,
} from "@/server/services/lead.service";
import type { FormState } from "@/types/form-state";
import { deletionModeSchema } from "@/validators/fields";
import { leadFormSchema, leadIdSchema, leadStatusSchema } from "@/validators/leads";

const leadFields = [
  "name",
  "email",
  "phone",
  "company",
  "website",
  "source",
  "service",
  "estimatedValue",
  "currency",
  "notes",
] as const;

const invalidForm = "Check the highlighted fields and try again.";
const leadMissing = "This lead no longer exists.";
const errorOptions = { scope: "leads", notFound: leadMissing };

function revalidateLeads(leadId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/leads/archived");
  if (leadId) revalidatePath(`/dashboard/leads/${leadId}`);
}

export async function createLeadAction(_previous: FormState, formData: FormData): Promise<FormState> {
  let leadId: string;

  try {
    const ctx = await requireOrganizationContext();
    requirePermission(ctx, permissions.leadsCreate);
    await requireWithinLimit(ctx, workspaceLimits.writesPerUser);

    const parsed = leadFormSchema.safeParse(readFormFields(formData, leadFields));
    if (!parsed.success) {
      return { error: invalidForm, fieldErrors: z.flattenError(parsed.error).fieldErrors };
    }

    leadId = await createLead(ctx, parsed.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateLeads(leadId);
  redirect(`/dashboard/leads/${leadId}?notice=lead-created`);
}

export async function updateLeadAction(id: string, _previous: FormState, formData: FormData): Promise<FormState> {
  const leadId = leadIdSchema.safeParse(id);

  if (!leadId.success) {
    return { error: leadMissing };
  }

  try {
    const ctx = await requireOrganizationContext();
    requirePermission(ctx, permissions.leadsUpdate);
    await requireWithinLimit(ctx, workspaceLimits.writesPerUser);

    const parsed = leadFormSchema.safeParse(readFormFields(formData, leadFields));
    if (!parsed.success) {
      return { error: invalidForm, fieldErrors: z.flattenError(parsed.error).fieldErrors };
    }

    await updateLead(ctx, leadId.data, parsed.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateLeads(leadId.data);
  redirect(`/dashboard/leads/${leadId.data}`);
}

export async function changeLeadStatusAction(id: string, status: string): Promise<{ error?: string }> {
  const leadId = leadIdSchema.safeParse(id);
  const nextStatus = leadStatusSchema.safeParse(status);

  if (!leadId.success || !nextStatus.success) {
    return { error: "That status change isn't valid." };
  }

  try {
    const ctx = await requireOrganizationContext();
    requirePermission(ctx, permissions.leadsUpdate);
    await requireWithinLimit(ctx, workspaceLimits.writesPerUser);
    await changeLeadStatus(ctx, leadId.data, nextStatus.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateLeads(leadId.data);
  return {};
}

export async function deleteLeadAction(id: string, mode: string): Promise<{ error?: string }> {
  const leadId = leadIdSchema.safeParse(id);
  const deletion = deletionModeSchema.safeParse(mode);

  if (!leadId.success) {
    return { error: leadMissing };
  }

  if (!deletion.success) {
    return { error: "That delete option isn't valid." };
  }

  try {
    const ctx = await requireOrganizationContext();
    requirePermission(ctx, permissions.leadsDelete);
    await requireWithinLimit(ctx, workspaceLimits.writesPerUser);

    if (deletion.data === "permanent") {
      await deleteLeadPermanently(ctx, leadId.data);
    } else {
      await archiveLead(ctx, leadId.data);
    }
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateLeads(leadId.data);
  return {};
}

export async function restoreLeadAction(id: string): Promise<{ error?: string }> {
  const leadId = leadIdSchema.safeParse(id);

  if (!leadId.success) {
    return { error: leadMissing };
  }

  try {
    const ctx = await requireOrganizationContext();
    requirePermission(ctx, permissions.leadsDelete);
    await requireWithinLimit(ctx, workspaceLimits.writesPerUser);
    await restoreLead(ctx, leadId.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateLeads(leadId.data);
  return {};
}

export async function convertLeadAction(id: string): Promise<{ error?: string }> {
  const leadId = leadIdSchema.safeParse(id);

  if (!leadId.success) {
    return { error: leadMissing };
  }

  let clientId: string;

  try {
    const ctx = await requireOrganizationContext();
    requirePermission(ctx, permissions.leadsUpdate);
    requirePermission(ctx, permissions.clientsCreate);
    await requireWithinLimit(ctx, workspaceLimits.writesPerUser, workspaceLimits.conversionsPerUser);
    clientId = await convertLead(ctx, leadId.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateLeads(leadId.data);
  revalidatePath("/dashboard/clients");
  redirect(`/dashboard/clients/${clientId}?notice=lead-converted`);
}
