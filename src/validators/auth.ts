import { z } from "zod";

import type { PlanId } from "@/features/subscriptions/plans";

const planIds = ["free", "pro", "agency"] as const satisfies readonly PlanId[];

export const planIdSchema = z.enum(planIds).optional().catch(undefined);

export const emailSchema = z
  .string({ error: "Enter your email address." })
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Enter a valid email address." }).max(320));

export const signUpSchema = z.object({
  name: z
    .string({ error: "Enter your name." })
    .trim()
    .min(1, "Enter your name.")
    .max(120, "Use 120 characters or fewer."),
  email: emailSchema,
  password: z
    .string({ error: "Enter a password." })
    .min(8, "Use at least 8 characters.")
    .max(128, "Use 128 characters or fewer."),
  plan: planIdSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string({ error: "Enter your password." }).min(1, "Enter your password."),
  next: z.string().optional(),
});

export const verifyEmailSchema = z.object({
  otp: z
    .string({ error: "Enter the 6-digit code from your email." })
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
  plan: planIdSchema,
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
