"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { portalLimits, withinLimits } from "@/lib/redis/rate-limit";
import { readFormFields } from "@/lib/utils/form-data";
import { toActionError } from "@/server/actions/action-error";
import { getClientIp } from "@/server/auth/client-ip";
import {
  clearPortalSessionCookie,
  readPortalSessionToken,
  setPortalSessionCookie,
} from "@/server/auth/portal-session";
import { RateLimitError } from "@/server/errors";
import { completeSetup, signIn, signOut } from "@/server/services/portal-auth.service";
import type { FormState } from "@/types/form-state";
import { portalSetupSchema, portalSignInSchema, portalSlugSchema, portalTokenSchema } from "@/validators/portal";

const invalidForm = "Check the highlighted fields and try again.";
const unavailable = "This portal isn't available.";
const errorOptions = { scope: "portal", notFound: unavailable };

async function requirePortalAuthLimit(email?: string) {
  const checks: Parameters<typeof withinLimits> = [[portalLimits.authPerIp, await getClientIp()]];
  if (email) checks.push([portalLimits.authPerEmail, email]);

  if (!(await withinLimits(...checks))) {
    throw new RateLimitError("Too many attempts. Please wait a few minutes and try again.");
  }
}

export async function completePortalSetupAction(
  ids: { slug: string; token: string },
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const slug = portalSlugSchema.safeParse(ids.slug);
  const token = portalTokenSchema.safeParse(ids.token);

  if (!slug.success || !token.success) {
    return { error: "This link isn't valid. Ask for a new one." };
  }

  const parsed = portalSetupSchema.safeParse(readFormFields(formData, ["password", "confirmPassword"]));
  if (!parsed.success) {
    return { error: invalidForm, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    await requirePortalAuthLimit();
    const session = await completeSetup(slug.data, token.data, parsed.data.password);
    await setPortalSessionCookie(session.token, session.expiresAt);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  redirect(`/portal/${slug.data}`);
}

export async function portalSignInAction(slugValue: string, _previous: FormState, formData: FormData): Promise<FormState> {
  const slug = portalSlugSchema.safeParse(slugValue);

  if (!slug.success) {
    return { error: unavailable };
  }

  const parsed = portalSignInSchema.safeParse(readFormFields(formData, ["email", "password"]));
  if (!parsed.success) {
    return { error: invalidForm, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    await requirePortalAuthLimit(parsed.data.email);
    const session = await signIn(slug.data, parsed.data.email, parsed.data.password);
    await setPortalSessionCookie(session.token, session.expiresAt);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  redirect(`/portal/${slug.data}`);
}

export async function portalSignOutAction(slugValue: string): Promise<void> {
  const slug = portalSlugSchema.safeParse(slugValue);
  const token = await readPortalSessionToken();

  if (token) {
    await signOut(token);
  }

  await clearPortalSessionCookie();
  redirect(slug.success ? `/portal/${slug.data}/sign-in` : "/");
}
