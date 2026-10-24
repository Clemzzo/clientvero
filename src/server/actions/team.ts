"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { workspaceLimits } from "@/lib/redis/rate-limit";
import { readFormFields } from "@/lib/utils/form-data";
import { toActionError } from "@/server/actions/action-error";
import { requireWithinLimit } from "@/server/actions/rate-limit-guard";
import { requireCurrentAccount } from "@/server/auth/current-user";
import { requireOrganizationContext } from "@/server/auth/organization";
import { permissions, requirePermission } from "@/server/authorization/permissions";
import {
  acceptInvitation,
  acceptInvitationByToken,
  changeMemberRole,
  invitationLink,
  inviteMember,
  leaveWorkspace,
  removeMember,
  revokeInvitation,
} from "@/server/services/team.service";
import type { FormState } from "@/types/form-state";
import { invitationTokenSchema, inviteMemberSchema, memberRoleSchema, recordIdSchema } from "@/validators/settings";

export type InviteFormState = (FormState & { link?: string; email?: string }) | null;

type ActionResult = { error?: string };
type LinkResult = { error: string } | { link: string };

const teamPath = "/dashboard/settings/team";
const invalidForm = "Check the highlighted fields and try again.";
const errorOptions = { scope: "team", notFound: "This person or invitation no longer exists." };
const invitationErrors = { scope: "team", notFound: "This invitation is no longer available." };

async function requireTeamManager() {
  const ctx = await requireOrganizationContext();
  requirePermission(ctx, permissions.teamManage);
  await requireWithinLimit(ctx, workspaceLimits.writesPerUser);
  return ctx;
}

function revalidateTeam() {
  revalidatePath(teamPath);
  revalidatePath("/dashboard/activity");
}

export async function inviteMemberAction(_previous: InviteFormState, formData: FormData): Promise<InviteFormState> {
  try {
    const ctx = await requireTeamManager();

    const parsed = inviteMemberSchema.safeParse(readFormFields(formData, ["email", "role"]));
    if (!parsed.success) {
      return { error: invalidForm, fieldErrors: z.flattenError(parsed.error).fieldErrors };
    }

    const link = await inviteMember(ctx, parsed.data);
    revalidateTeam();
    return { link, email: parsed.data.email };
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }
}

export async function copyInvitationLinkAction(id: string): Promise<LinkResult> {
  const invitationId = recordIdSchema.safeParse(id);
  if (!invitationId.success) return { error: errorOptions.notFound };

  try {
    const ctx = await requireTeamManager();
    return { link: await invitationLink(ctx, invitationId.data) };
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }
}

export async function revokeInvitationAction(id: string): Promise<ActionResult> {
  const invitationId = recordIdSchema.safeParse(id);
  if (!invitationId.success) return { error: errorOptions.notFound };

  try {
    const ctx = await requireTeamManager();
    await revokeInvitation(ctx, invitationId.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateTeam();
  return {};
}

export async function changeMemberRoleAction(id: string, role: string): Promise<ActionResult> {
  const memberId = recordIdSchema.safeParse(id);
  const nextRole = memberRoleSchema.safeParse(role);
  if (!memberId.success) return { error: errorOptions.notFound };
  if (!nextRole.success) return { error: "Choose a valid role." };

  try {
    const ctx = await requireTeamManager();
    await changeMemberRole(ctx, memberId.data, nextRole.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateTeam();
  return {};
}

export async function removeMemberAction(id: string): Promise<ActionResult> {
  const memberId = recordIdSchema.safeParse(id);
  if (!memberId.success) return { error: errorOptions.notFound };

  try {
    const ctx = await requireTeamManager();
    await removeMember(ctx, memberId.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateTeam();
  return {};
}

export async function leaveWorkspaceAction(): Promise<ActionResult> {
  try {
    const ctx = await requireOrganizationContext();
    await requireWithinLimit(ctx, workspaceLimits.writesPerUser);
    await leaveWorkspace(ctx);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidatePath("/", "layout");
  redirect("/onboarding");
}

async function joinWith(accept: () => Promise<void>): Promise<ActionResult> {
  try {
    await accept();
  } catch (error) {
    return { error: toActionError(error, invitationErrors) };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard?notice=joined");
}

export async function acceptInvitationAction(id: string): Promise<ActionResult> {
  const invitationId = recordIdSchema.safeParse(id);
  if (!invitationId.success) return { error: invitationErrors.notFound };

  return joinWith(async () => {
    const { user } = await requireCurrentAccount();
    await requireWithinLimit({ user }, workspaceLimits.writesPerUser);
    await acceptInvitation(user, invitationId.data);
  });
}

export async function acceptInvitationTokenAction(token: string): Promise<ActionResult> {
  const parsed = invitationTokenSchema.safeParse(token);
  if (!parsed.success) return { error: invitationErrors.notFound };

  return joinWith(async () => {
    const { user } = await requireCurrentAccount();
    await requireWithinLimit({ user }, workspaceLimits.writesPerUser);
    await acceptInvitationByToken(user, parsed.data);
  });
}
