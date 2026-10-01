"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { requireCurrentAccount } from "@/server/auth/current-user";
import { createWorkspace } from "@/server/services/organization.service";
import { onboardingSchema } from "@/validators/onboarding";

export type OnboardingFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
} | null;

const invalidForm = "Check the highlighted fields and try again.";
const createFailed = "We couldn't create your workspace. Please try again.";

function readForm(formData: FormData) {
  return {
    name: formData.get("name") ?? undefined,
    businessType: formData.get("businessType") ?? undefined,
    country: formData.get("country") ?? undefined,
    currency: formData.get("currency") ?? undefined,
  };
}

export async function completeOnboardingAction(
  _previous: OnboardingFormState,
  formData: FormData,
): Promise<OnboardingFormState> {
  const { user, membership } = await requireCurrentAccount();

  if (membership) {
    redirect("/dashboard");
  }

  const parsed = onboardingSchema.safeParse(readForm(formData));

  if (!parsed.success) {
    return { error: invalidForm, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    await createWorkspace(user.id, parsed.data);
  } catch (error) {
    console.error("[onboarding] workspace creation failed", error instanceof Error ? error.message : error);
    return { error: createFailed };
  }

  redirect("/dashboard");
}
