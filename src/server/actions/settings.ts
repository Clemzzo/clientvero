"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth/server";
import { authLimits, workspaceLimits } from "@/lib/redis/rate-limit";
import { readFormFields } from "@/lib/utils/form-data";
import { toActionError } from "@/server/actions/action-error";
import { requireWithinLimit } from "@/server/actions/rate-limit-guard";
import { authErrorMessage } from "@/server/auth/auth-error-message";
import { requireOrganizationContext, type OrganizationContext } from "@/server/auth/organization";
import { permissions, requirePermission } from "@/server/authorization/permissions";
import type { PreparedUpload } from "@/server/services/file.service";
import { updateNotificationPreferences } from "@/server/services/notification.service";
import { updateBusiness } from "@/server/services/organization.service";
import { completeImageUpload, prepareImageUpload, removeImage } from "@/server/services/settings-image.service";
import { updateProfile } from "@/server/services/user.service";
import type { FormState } from "@/types/form-state";
import {
  businessSchema,
  changePasswordSchema,
  completeImageUploadSchema,
  imageTargetSchema,
  notificationPreferencesSchema,
  prepareImageUploadSchema,
  profileSchema,
} from "@/validators/settings";

export type SettingsFormState = (FormState & { saved?: boolean }) | null;

type ActionResult = { error?: string };

const invalidForm = "Check the highlighted fields and try again.";
const errorOptions = { scope: "settings", notFound: "We couldn't find your workspace." };

const profileFields = ["firstName", "lastName"] as const;
const passwordFields = ["currentPassword", "newPassword", "confirmPassword", "revokeOtherSessions"] as const;
const businessFields = ["name", "businessType", "country", "currency", "website", "address"] as const;

async function requireSettingsWriter(permission?: typeof permissions.organizationUpdate): Promise<OrganizationContext> {
  const ctx = await requireOrganizationContext();
  if (permission) requirePermission(ctx, permission);
  await requireWithinLimit(ctx, workspaceLimits.writesPerUser);
  return ctx;
}

function revalidateWorkspace() {
  revalidatePath("/dashboard", "layout");
}

export async function updateProfileAction(_previous: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  try {
    const ctx = await requireSettingsWriter();

    const parsed = profileSchema.safeParse(readFormFields(formData, profileFields));
    if (!parsed.success) {
      return { error: invalidForm, fieldErrors: z.flattenError(parsed.error).fieldErrors };
    }

    await updateProfile(ctx.user.id, parsed.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateWorkspace();
  return { saved: true };
}

export async function changePasswordAction(_previous: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  try {
    const ctx = await requireOrganizationContext();
    await requireWithinLimit(ctx, authLimits.changePasswordPerUser);

    const parsed = changePasswordSchema.safeParse(readFormFields(formData, passwordFields));
    if (!parsed.success) {
      return { error: invalidForm, fieldErrors: z.flattenError(parsed.error).fieldErrors };
    }

    const { currentPassword, newPassword, revokeOtherSessions } = parsed.data;
    const { error } = await auth.changePassword({ currentPassword, newPassword, revokeOtherSessions });

    if (error) {
      console.error("[settings] change password failed", { code: error.code, status: error.status });
      if (error.code === "INVALID_PASSWORD") {
        return { fieldErrors: { currentPassword: ["Your current password is incorrect."] } };
      }
      return { error: authErrorMessage(error) };
    }
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  return { saved: true };
}

export async function updateBusinessAction(_previous: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  try {
    const ctx = await requireSettingsWriter(permissions.organizationUpdate);

    const parsed = businessSchema.safeParse(readFormFields(formData, businessFields));
    if (!parsed.success) {
      return { error: invalidForm, fieldErrors: z.flattenError(parsed.error).fieldErrors };
    }

    await updateBusiness(ctx, parsed.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateWorkspace();
  return { saved: true };
}

export async function updateNotificationPreferencesAction(
  _previous: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  try {
    const ctx = await requireSettingsWriter();

    const parsed = notificationPreferencesSchema.safeParse(
      readFormFields(formData, Object.keys(notificationPreferencesSchema.shape)),
    );
    if (!parsed.success) {
      return { error: invalidForm };
    }

    await updateNotificationPreferences(ctx, parsed.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidatePath("/dashboard/settings/notifications");
  return { saved: true };
}

async function requireImageWriter(target: "avatar" | "logo") {
  const ctx = await requireOrganizationContext();
  if (target === "logo") requirePermission(ctx, permissions.organizationUpdate);
  await requireWithinLimit(ctx, workspaceLimits.uploadsPerUser);
  return ctx;
}

export async function prepareImageUploadAction(input: unknown): Promise<{ error: string } | PreparedUpload> {
  const parsed = prepareImageUploadSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Upload a PNG or JPG image up to 2 MB." };
  }

  try {
    const ctx = await requireImageWriter(parsed.data.target);
    return await prepareImageUpload(ctx, parsed.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }
}

export async function completeImageUploadAction(input: unknown): Promise<ActionResult> {
  const parsed = completeImageUploadSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "The upload didn't finish. Try uploading the image again." };
  }

  try {
    const ctx = await requireImageWriter(parsed.data.target);
    await completeImageUpload(ctx, parsed.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateWorkspace();
  return {};
}

export async function removeImageAction(target: unknown): Promise<ActionResult> {
  const parsed = imageTargetSchema.safeParse(target);

  if (!parsed.success) {
    return { error: "That image can't be removed." };
  }

  try {
    const ctx = await requireImageWriter(parsed.data);
    await removeImage(ctx, parsed.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateWorkspace();
  return {};
}
