import { z } from "zod";

export const portalSlugSchema = z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/);

export const portalTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/);

export const portalAccountIdSchema = z.uuid();

const password = z
  .string({ error: "Choose a password." })
  .min(10, "Use at least 10 characters.")
  .max(128, "Use 128 characters or fewer.");

export const portalSetupSchema = z
  .object({
    password,
    confirmPassword: z.string({ error: "Type your password again." }),
  })
  .refine((input) => input.password === input.confirmPassword, {
    path: ["confirmPassword"],
    message: "The passwords don't match.",
  });

export const portalSignInSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email({ error: "Enter the email your invitation was sent to." }).max(320)),
  password: z.string({ error: "Enter your password." }).min(1, "Enter your password.").max(128),
});
