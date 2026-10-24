import { z } from "zod";

import type { EmittedNotificationType } from "@/features/notifications/notification-types";
import { imageTargets, MAX_IMAGE_BYTES } from "@/features/settings/image-types";
import { preferenceTypes } from "@/features/settings/notification-preferences";
import { emailSchema, passwordSchema } from "@/validators/auth";
import { optionalText, optionalWebsite } from "@/validators/fields";
import { businessProfileFields } from "@/validators/onboarding";

const checkbox = z
  .literal("on")
  .optional()
  .transform((value) => value === "on");

export const profileSchema = z
  .object({
    firstName: optionalText(120),
    lastName: optionalText(120),
  })
  .refine((input) => input.firstName || input.lastName, {
    path: ["firstName"],
    message: "Enter your name.",
  });

export type ProfileInput = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string({ error: "Enter your current password." }).min(1, "Enter your current password.").max(128),
    newPassword: passwordSchema,
    confirmPassword: z.string({ error: "Type your new password again." }),
    revokeOtherSessions: checkbox,
  })
  .refine((input) => input.newPassword === input.confirmPassword, {
    path: ["confirmPassword"],
    message: "The passwords don't match.",
  })
  .refine((input) => input.newPassword !== input.currentPassword, {
    path: ["newPassword"],
    message: "Choose a password that's different from your current one.",
  });

export const businessSchema = z.object({
  ...businessProfileFields,
  website: optionalWebsite,
  address: optionalText(500),
});

export type BusinessInput = z.infer<typeof businessSchema>;

export const assignableRoles = ["ADMIN", "MEMBER"] as const;

export type AssignableRole = (typeof assignableRoles)[number];

export const memberRoleSchema = z.enum(assignableRoles, { error: "Choose a role." });

export const inviteMemberSchema = z.object({
  email: emailSchema,
  role: memberRoleSchema,
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const recordIdSchema = z.uuid();

export const invitationTokenSchema = z.string().min(20).max(128).regex(/^[A-Za-z0-9_-]+$/);

export const notificationPreferencesSchema = z.object(
  Object.fromEntries(preferenceTypes.map((type) => [type, checkbox])) as Record<EmittedNotificationType, typeof checkbox>,
);

export const imageTargetSchema = z.enum(imageTargets);

export const prepareImageUploadSchema = z.object({
  target: imageTargetSchema,
  name: z.string().trim().min(1).max(255),
  sizeBytes: z.number().int().positive().max(MAX_IMAGE_BYTES, "Images can be up to 2 MB."),
});

export type PrepareImageUploadInput = z.infer<typeof prepareImageUploadSchema>;

export const completeImageUploadSchema = prepareImageUploadSchema.extend({
  objectKey: z.string().min(1).max(512),
});

export type CompleteImageUploadInput = z.infer<typeof completeImageUploadSchema>;
