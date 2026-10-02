"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { publicLimits, withinLimits, workspaceLimits } from "@/lib/redis/rate-limit";
import { readFormFields } from "@/lib/utils/form-data";
import { proposalPublicUrl } from "@/lib/utils/public-url";
import { toActionError } from "@/server/actions/action-error";
import { requireWithinLimit } from "@/server/actions/rate-limit-guard";
import { getClientIp } from "@/server/auth/client-ip";
import { requireOrganizationContext } from "@/server/auth/organization";
import { permissions, requirePermission, type Permission } from "@/server/authorization/permissions";
import { RateLimitError } from "@/server/errors";
import { createProposal, sendProposal, updateProposal, withdrawProposal } from "@/server/services/proposal.service";
import { acceptProposal, declineProposal } from "@/server/services/public-proposal.service";
import type { FormState } from "@/types/form-state";
import {
  acceptProposalSchema,
  declineProposalSchema,
  proposalFormSchema,
  proposalIdSchema,
  proposalPublicIdSchema,
} from "@/validators/proposals";

const proposalFields = [
  "clientId",
  "title",
  "description",
  "currency",
  "subtotal",
  "discount",
  "tax",
  "timeline",
  "terms",
  "sections",
] as const;

const invalidForm = "Check the highlighted fields and try again.";
const proposalMissing = "This proposal no longer exists.";
const unavailable = "This proposal is no longer available.";
const workspaceErrors = { scope: "proposals", notFound: proposalMissing };
const publicErrors = { scope: "public-proposal", notFound: unavailable };

export type ResponseState = { error?: string; fieldErrors?: Record<string, string[] | undefined> } | { done: true } | null;

async function requireProposalWriter(permission: Permission) {
  const ctx = await requireOrganizationContext();
  requirePermission(ctx, permission);
  await requireWithinLimit(ctx, workspaceLimits.writesPerUser);
  return ctx;
}

function revalidateProposals(proposalId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/proposals");
  if (proposalId) revalidatePath(`/dashboard/proposals/${proposalId}`);
}

async function requirePublicLimit() {
  const allowed = await withinLimits([publicLimits.documentActionsPerIp, await getClientIp()]);
  if (!allowed) throw new RateLimitError();
}

export async function createProposalAction(_previous: FormState, formData: FormData): Promise<FormState> {
  let proposalId: string;

  try {
    const ctx = await requireProposalWriter(permissions.proposalsCreate);

    const parsed = proposalFormSchema.safeParse(readFormFields(formData, proposalFields));
    if (!parsed.success) {
      return { error: invalidForm, fieldErrors: z.flattenError(parsed.error).fieldErrors };
    }

    proposalId = await createProposal(ctx, parsed.data);
  } catch (error) {
    return { error: toActionError(error, workspaceErrors) };
  }

  revalidateProposals(proposalId);
  redirect(`/dashboard/proposals/${proposalId}?notice=proposal-created`);
}

export async function updateProposalAction(id: string, _previous: FormState, formData: FormData): Promise<FormState> {
  const proposalId = proposalIdSchema.safeParse(id);

  if (!proposalId.success) {
    return { error: proposalMissing };
  }

  try {
    const ctx = await requireProposalWriter(permissions.proposalsCreate);

    const parsed = proposalFormSchema.safeParse(readFormFields(formData, proposalFields));
    if (!parsed.success) {
      return { error: invalidForm, fieldErrors: z.flattenError(parsed.error).fieldErrors };
    }

    await updateProposal(ctx, proposalId.data, parsed.data);
  } catch (error) {
    return { error: toActionError(error, workspaceErrors) };
  }

  revalidateProposals(proposalId.data);
  redirect(`/dashboard/proposals/${proposalId.data}?notice=proposal-saved`);
}

export async function sendProposalAction(id: string): Promise<{ error?: string; publicUrl?: string }> {
  const proposalId = proposalIdSchema.safeParse(id);

  if (!proposalId.success) {
    return { error: proposalMissing };
  }

  try {
    const ctx = await requireProposalWriter(permissions.proposalsSend);
    const publicId = await sendProposal(ctx, proposalId.data);
    revalidateProposals(proposalId.data);
    return { publicUrl: proposalPublicUrl(publicId) };
  } catch (error) {
    return { error: toActionError(error, workspaceErrors) };
  }
}

export async function withdrawProposalAction(id: string): Promise<{ error?: string }> {
  const proposalId = proposalIdSchema.safeParse(id);

  if (!proposalId.success) {
    return { error: proposalMissing };
  }

  try {
    const ctx = await requireProposalWriter(permissions.proposalsSend);
    await withdrawProposal(ctx, proposalId.data);
  } catch (error) {
    return { error: toActionError(error, workspaceErrors) };
  }

  revalidateProposals(proposalId.data);
  return {};
}

export async function acceptProposalAction(
  publicId: string,
  _previous: ResponseState,
  formData: FormData,
): Promise<ResponseState> {
  const id = proposalPublicIdSchema.safeParse(publicId);
  const parsed = acceptProposalSchema.safeParse(readFormFields(formData, ["signerName"]));

  if (!id.success) return { error: unavailable };
  if (!parsed.success) return { error: invalidForm, fieldErrors: z.flattenError(parsed.error).fieldErrors };

  try {
    await requirePublicLimit();
    await acceptProposal(id.data, parsed.data.signerName);
  } catch (error) {
    return { error: toActionError(error, publicErrors) };
  }

  revalidatePath(`/proposal/${id.data}`);
  revalidatePath("/dashboard/proposals", "layout");
  return { done: true };
}

export async function declineProposalAction(
  publicId: string,
  _previous: ResponseState,
  formData: FormData,
): Promise<ResponseState> {
  const id = proposalPublicIdSchema.safeParse(publicId);
  const parsed = declineProposalSchema.safeParse(readFormFields(formData, ["reason"]));

  if (!id.success) return { error: unavailable };
  if (!parsed.success) return { error: invalidForm, fieldErrors: z.flattenError(parsed.error).fieldErrors };

  try {
    await requirePublicLimit();
    await declineProposal(id.data, parsed.data.reason);
  } catch (error) {
    return { error: toActionError(error, publicErrors) };
  }

  revalidatePath(`/proposal/${id.data}`);
  revalidatePath("/dashboard/proposals", "layout");
  return { done: true };
}
