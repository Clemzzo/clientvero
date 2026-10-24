import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthShell } from "@/components/auth/AuthShell";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { JoinInvitationCard } from "@/components/settings/JoinInvitationCard";
import { countryOptions, currencyOptions } from "@/features/organizations/business-profile";
import { logoSrc } from "@/features/settings/image-urls";
import { acceptInvitationAction } from "@/server/actions/team";
import { getCurrentAccount } from "@/server/auth/current-user";
import { pendingInvitationsFor } from "@/server/services/team.service";

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

  const invitations = await pendingInvitationsFor(account.user.email);

  return (
    <AuthShell
      title={invitations.length > 0 ? "Join your team" : "Set up your workspace"}
      description={invitations.length > 0 ? "You've been invited to a workspace. Join it, or create your own instead." : "It takes less than a minute."}
      aside={<AuthBrandPanel />}
    >
      {invitations.length > 0 && (
        <div className="mb-8 space-y-3">
          {invitations.map((invitation) => (
            <JoinInvitationCard
              key={invitation.id}
              organizationName={invitation.organizationName}
              logoSrc={logoSrc(invitation.organizationSlug, invitation.logoKey)}
              inviterName={invitation.inviterName}
              role={invitation.role}
              onJoin={acceptInvitationAction.bind(null, invitation.id)}
            />
          ))}
          <div className="flex items-center gap-3 pt-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-500">
            <span className="h-px flex-1 bg-ink-200" />
            Or create your own
            <span className="h-px flex-1 bg-ink-200" />
          </div>
        </div>
      )}
      <OnboardingForm countries={countryOptions()} currencies={currencyOptions()} />
    </AuthShell>
  );
}
