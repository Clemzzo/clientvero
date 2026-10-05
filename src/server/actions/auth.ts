"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import type { PlanId } from "@/features/subscriptions/plans";
import { auth } from "@/lib/auth/server";
import { env } from "@/lib/env";
import { authLimits, withinLimits } from "@/lib/redis/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile/verify";
import { authErrorMessage } from "@/server/auth/auth-error-message";
import { emailHasAccount } from "@/server/auth/account-exists";
import { getClientIp } from "@/server/auth/client-ip";
import { pathAfterSignIn } from "@/server/auth/redirect-after-sign-in";
import {
  clearPendingVerificationEmail,
  getPendingVerificationEmail,
  setPendingVerificationEmail,
} from "@/server/auth/pending-verification";
import type { TurnstileAction } from "@/types/turnstile";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  turnstileTokenSchema,
  verifyEmailSchema,
} from "@/validators/auth";

export type AuthFormState = {
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
} | null;

type AuthApiError = { code?: string; status?: number };

const invalidForm = "Check the highlighted fields and try again.";
const verificationExpired = "Your verification session has expired. Sign in again to get a new code.";
const codeResent = "If your email still needs verifying, we've sent a new code.";
const rateLimited = authErrorMessage({ status: 429 });
const accountExists = authErrorMessage({ code: "USER_ALREADY_EXISTS" });
const botCheckFailed = "We couldn't verify you're human. Please try again.";
const resetLinkSent = "If an account exists for that email, we've sent a link to reset your password. It expires in 15 minutes.";

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

async function accountAlreadyExists(email: string) {
  try {
    return await emailHasAccount(email);
  } catch (error) {
    console.error("[auth] existing-account check failed", error instanceof Error ? error.message : error);
    return false;
  }
}

async function passesBotCheck(formData: FormData, action: TurnstileAction, ip: string) {
  const token = turnstileTokenSchema.safeParse(formData.get("cf-turnstile-response"));
  return token.success && (await verifyTurnstile(token.data, action, ip));
}

function withPlan(path: string, plan: PlanId | undefined) {
  return plan ? `${path}?plan=${plan}` : path;
}

export async function signUpAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse(readForm(formData, ["name", "email", "password", "plan"]));

  if (!parsed.success) {
    return { error: invalidForm, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const ip = await getClientIp();

  if (!(await withinLimits([authLimits.signUpPerIp, ip]))) {
    return { error: rateLimited };
  }

  if (!(await passesBotCheck(formData, "signup", ip))) {
    return { error: botCheckFailed };
  }

  const { plan, ...credentials } = parsed.data;

  if (await accountAlreadyExists(credentials.email)) {
    return { error: accountExists };
  }

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
  const parsed = signInSchema.safeParse(readForm(formData, ["email", "password", "rememberMe", "next"]));

  if (!parsed.success) {
    return { error: invalidForm, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { next, ...credentials } = parsed.data;
  const ip = await getClientIp();

  const allowed = await withinLimits(
    [authLimits.signInPerIp, ip],
    [authLimits.signInPerEmail, credentials.email],
  );

  if (!allowed) {
    return { error: rateLimited };
  }

  if (!(await passesBotCheck(formData, "login", ip))) {
    return { error: botCheckFailed };
  }

  const { data, error } = await auth.signIn.email(credentials);

  if (error?.code?.startsWith("EMAIL_NOT_VERIFIED")) {
    await setPendingVerificationEmail(credentials.email);
    redirect("/verify-email");
  }

  if (error) {
    logAuthFailure("sign-in", error);
    return { error: authErrorMessage(error) };
  }

  redirect(await pathAfterSignIn(data.user.id, next));
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

  const ip = await getClientIp();

  const allowed = await withinLimits(
    [authLimits.verifyPerIp, ip],
    [authLimits.verifyPerEmail, email],
  );

  if (!allowed) {
    return { error: rateLimited };
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

  const ip = await getClientIp();

  const allowed = await withinLimits(
    [authLimits.resendPerIp, ip],
    [authLimits.resendPerEmailBurst, email],
    [authLimits.resendPerEmail, email],
  );

  if (!allowed) {
    return { error: rateLimited };
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

export async function requestPasswordResetAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = forgotPasswordSchema.safeParse(readForm(formData, ["email"]));

  if (!parsed.success) {
    return { error: invalidForm, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { email } = parsed.data;
  const ip = await getClientIp();

  const allowed = await withinLimits(
    [authLimits.resetRequestPerIp, ip],
    [authLimits.resetRequestPerEmailBurst, email],
    [authLimits.resetRequestPerEmail, email],
  );

  if (!allowed) {
    return { error: rateLimited };
  }

  if (!(await passesBotCheck(formData, "password-reset", ip))) {
    return { error: botCheckFailed };
  }

  const redirectTo = new URL("/reset-password", env.NEXT_PUBLIC_APP_URL).toString();
  const { error } = await auth.requestPasswordReset({ email, redirectTo });

  if (error) {
    logAuthFailure("request-password-reset", error);
  }

  return { message: resetLinkSent };
}

export async function resetPasswordAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = resetPasswordSchema.safeParse(readForm(formData, ["token", "password", "confirmPassword"]));

  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return fieldErrors.token
      ? { error: authErrorMessage({ code: "INVALID_TOKEN" }) }
      : { error: invalidForm, fieldErrors };
  }

  if (!(await withinLimits([authLimits.resetSubmitPerIp, await getClientIp()]))) {
    return { error: rateLimited };
  }

  const { token, password } = parsed.data;
  const { error } = await auth.resetPassword({ newPassword: password, token });

  if (error) {
    logAuthFailure("reset-password", error);
    return { error: authErrorMessage(error) };
  }

  redirect("/sign-in?reset=1");
}

export async function signOutAction(): Promise<void> {
  const { error } = await auth.signOut();

  if (error) {
    logAuthFailure("sign-out", error);
  }

  redirect("/sign-in");
}
