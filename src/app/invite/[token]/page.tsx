import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CircleAlert } from "lucide-react";

import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthShell } from "@/components/auth/AuthShell";
import { JoinInvitationCard } from "@/components/settings/JoinInvitationCard";
import { Button } from "@/components/ui/button";
import { logoSrc } from "@/features/settings/image-urls";
import { publicLimits, withinLimits } from "@/lib/redis/rate-limit";
import { signOutAction } from "@/server/actions/auth";
import { acceptInvitationTokenAction } from "@/server/actions/team";
import { getClientIp } from "@/server/auth/client-ip";
import { getCurrentAccount } from "@/server/auth/current-user";
import { getInvitationByToken, type InvitationState } from "@/server/services/team.service";
import { invitationTokenSchema } from "@/validators/settings";

export const metadata: Metadata = {
  title: "Join a workspace",
  robots: { index: false, follow: false },
};

const closedCopy: Record<Exclude<InvitationState, "open">, { title: string; description: string }> = {
  expired: { title: "This invitation has expired", description: "Invitation links last 7 days. Ask the person who invited you to send a new one." },
  revoked: { title: "This invitation was cancelled", description: "Ask the person who invited you for a new link." },
  accepted: { title: "This invitation has been used", description: "Sign in to open the workspace, or ask for a new link." },
};

function Notice({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return (
    <AuthShell title={title} description={description} aside={<AuthBrandPanel />}>
      <div className="space-y-3">
        {children ?? (
          <Button asChild className="h-11 w-full rounded-lg">
            <Link href="/sign-in">Go to sign in</Link>
          </Button>
        )}
      </div>
    </AuthShell>
  );
}

export default async function InvitePage(props: PageProps<"/invite/[token]">) {
  const allowed = await withinLimits([publicLimits.invitationViewsPerIp, await getClientIp()]);

  if (!allowed) {
    return <Notice title="Too many attempts" description="Please wait a minute, then open your invitation link again." />;
  }

  const token = invitationTokenSchema.safeParse((await props.params).token);
  const invitation = token.success ? await getInvitationByToken(token.data) : null;

  if (!token.success || !invitation) {
    return <Notice title="This link isn't valid" description="Check that you copied the whole invitation link, or ask for a new one." />;
  }

  if (invitation.state !== "open") {
    return <Notice {...closedCopy[invitation.state]} />;
  }

  const account = await getCurrentAccount();
  const signInHref = `/sign-in?next=${encodeURIComponent(`/invite/${token.data}`)}`;

  if (!account) {
    return (
      <Notice
        title={`Join ${invitation.organizationName}`}
        description={`${invitation.inviterName ?? "Someone"} invited ${invitation.email} to work together in ClientVero.`}
      >
        <Button asChild className="h-11 w-full rounded-lg">
          <Link href="/sign-up">Create your account</Link>
        </Button>
        <Button asChild variant="outline" className="h-11 w-full rounded-lg">
          <Link href={signInHref}>I already have an account</Link>
        </Button>
        <p className="pt-1 text-[13px] text-ink-500">Use {invitation.email} so we can match you to this invitation.</p>
      </Notice>
    );
  }

  if (account.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    return (
      <Notice
        title="This invitation is for someone else"
        description={`It was sent to ${invitation.email}, but you're signed in as ${account.user.email}.`}
      >
        <form action={signOutAction}>
          <Button type="submit" className="h-11 w-full rounded-lg">
            Sign out and switch account
          </Button>
        </form>
      </Notice>
    );
  }

  if (account.membership) {
    if (account.membership.organizationId === invitation.organizationId) {
      redirect("/dashboard");
    }

    return (
      <Notice
        title="You already have a workspace"
        description={`Each account can belong to one workspace for now, so you can't join ${invitation.organizationName} with ${account.user.email}.`}
      >
        <Button asChild className="h-11 w-full rounded-lg">
          <Link href="/dashboard">Go to your workspace</Link>
        </Button>
      </Notice>
    );
  }

  return (
    <AuthShell
      title={`Join ${invitation.organizationName}`}
      description="Accept the invitation to start working with your team."
      aside={<AuthBrandPanel />}
    >
      <JoinInvitationCard
        organizationName={invitation.organizationName}
        logoSrc={logoSrc(invitation.organizationSlug, invitation.logoKey)}
        inviterName={invitation.inviterName}
        role={invitation.role}
        onJoin={acceptInvitationTokenAction.bind(null, token.data)}
      />
      <p className="mt-4 flex items-start gap-2 text-[13px] text-ink-500">
        <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
        Joining gives the workspace owner and admins control over your access.
      </p>
    </AuthShell>
  );
}
