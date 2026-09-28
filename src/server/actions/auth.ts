"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import type { PlanId } from "@/features/subscriptions/plans";
import { auth } from "@/lib/auth/server";
import { safeRedirectPath } from "@/lib/utils/safe-redirect";
import { authErrorMessage } from "@/server/auth/auth-error-message";
import {
  clearPendingVerificationEmail,
  getPendingVerificationEmail,
  setPendingVerificationEmail,
} from "@/server/auth/pending-verification";
import { signInSchema, signUpSchema, verifyEmailSchema } from "@/validators/auth";

export type AuthFormState = {
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
} | null;

type AuthApiError = { code?: string; status?: number };

const invalidForm = "Check the highlighted fields and try again.";
const verificationExpired = "Your verification session has expired. Sign in again to get a new code.";
const codeResent = "If your email still needs verifying, we've sent a new code.";

function readForm(formData: FormData, keys: readonly string[]) {
  return Object.fromEntries(
    keys.map((key) => {
      const value = formData.get(key);
      return [key, typeof value === "string" && value !== "" ? value : undefined];
    }),
  );
}

function logAuthFailure(action: string, error: AuthApiError) {
  console.error(`[auth] ${action} failed`, { code: error.code, status: error.status });
}

function withPlan(path: string, plan: PlanId | undefined) {
  return plan ? `${path}?plan=${plan}` : path;
}

export async function signUpAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse(readForm(formData, ["name", "email", "password", "plan"]));

  if (!parsed.success) {
    return { error: invalidForm, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { plan, ...credentials } = parsed.data;
  const { data, error } = await auth.signUp.email(credentials);

  if (error) {
    logAuthFailure("sign-up", error);
    return { error: authErrorMessage(error) };
  }

  if (data?.token) {
    redirect(withPlan("/onboarding", plan));
  }

  await setPendingVerificationEmail(credentials.email);
  redirect(withPlan("/verify-email", plan));
}

export async function signInAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse(readForm(formData, ["email", "password", "next"]));

  if (!parsed.success) {
    return { error: invalidForm, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { next, ...credentials } = parsed.data;
  const { error } = await auth.signIn.email(credentials);

  if (error?.code?.startsWith("EMAIL_NOT_VERIFIED")) {
    await setPendingVerificationEmail(credentials.email);
    redirect("/verify-email");
  }

  if (error) {
    logAuthFailure("sign-in", error);
    return { error: authErrorMessage(error) };
  }

  redirect(safeRedirectPath(next, "/app"));
}

export async function verifyEmailAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = verifyEmailSchema.safeParse(readForm(formData, ["otp", "plan"]));

  if (!parsed.success) {
    return { error: invalidForm, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const email = await getPendingVerificationEmail();

  if (!email) {
    return { error: verificationExpired };
  }

  const { otp, plan } = parsed.data;
  const { data, error } = await auth.emailOtp.verifyEmail({ email, otp });

  if (error) {
    logAuthFailure("verify-email", error);
    return { error: authErrorMessage(error) };
  }

  await clearPendingVerificationEmail();
  redirect(data?.token ? withPlan("/onboarding", plan) : "/sign-in");
}

export async function resendVerificationAction(): Promise<AuthFormState> {
  const email = await getPendingVerificationEmail();

  if (!email) {
    return { error: verificationExpired };
  }

  const { error } = await auth.emailOtp.sendVerificationOtp({ email, type: "email-verification" });

  if (error) {
    logAuthFailure("resend-verification", error);

    if (error.status === 429 || error.code?.startsWith("NETWORK_")) {
      return { error: authErrorMessage(error) };
    }
  }

  return { message: codeResent };
}

export async function signOutAction(): Promise<void> {
  const { error } = await auth.signOut();

  if (error) {
    logAuthFailure("sign-out", error);
  }

  redirect("/sign-in");
}
