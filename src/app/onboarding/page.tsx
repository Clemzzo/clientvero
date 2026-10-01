import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthShell } from "@/components/auth/AuthShell";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { countryOptions, currencyOptions } from "@/features/organizations/business-profile";
import { getCurrentAccount } from "@/server/auth/current-user";

export const metadata: Metadata = {
  title: "Set up your workspace",
};

export default async function OnboardingPage() {
  const account = await getCurrentAccount();

  if (!account) {
    redirect("/sign-in");
  }

  if (account.membership) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      title="Set up your workspace"
      description="It takes less than a minute."
      aside={<AuthBrandPanel />}
    >
      <OnboardingForm countries={countryOptions()} currencies={currencyOptions()} />
    </AuthShell>
  );
}
