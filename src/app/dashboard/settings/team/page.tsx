import type { Metadata } from "next";
import { UsersRound } from "lucide-react";

import { InviteMemberDialog } from "@/components/settings/InviteMemberDialog";
import { LeaveWorkspaceCard } from "@/components/settings/LeaveWorkspaceCard";
import { PendingInvitationsCard } from "@/components/settings/PendingInvitationsCard";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { TeamMembersCard } from "@/components/settings/TeamMembersCard";
import type { InvitationView, TeamMemberView } from "@/components/settings/team-types";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/card";
import { avatarSrc } from "@/features/settings/image-urls";
import { personName } from "@/lib/utils/format";
import { requireOrganizationContext } from "@/server/auth/organization";
import { hasPermission, permissions, requirePermission } from "@/server/authorization/permissions";
import { canLeaveWorkspace, getTeam, MAX_TEAM_SIZE } from "@/server/services/team.service";

export const metadata: Metadata = {
  title: "Team settings",
};

export default async function TeamSettingsPage() {
  const ctx = await requireOrganizationContext();
  requirePermission(ctx, permissions.teamRead);

  const canManage = hasPermission(ctx.membership.role, permissions.teamManage);
  const team = await getTeam(ctx.organization.id);
  const now = new Date();

  const members: TeamMemberView[] = team.members.map((member) => ({
    id: member.id,
    name: personName(member),
    email: member.email,
    role: member.role,
    avatarSrc: avatarSrc(member.userId, member.avatarKey),
    joinedAt: member.joinedAt.toISOString(),
    isYou: member.userId === ctx.user.id,
  }));

  const invitations: InvitationView[] = team.invitations.map((invitation) => ({
    id: invitation.id,
    email: invitation.email,
    role: invitation.role,
    invitedBy: invitation.inviterEmail
      ? personName({ firstName: invitation.inviterFirstName, lastName: invitation.inviterLastName, email: invitation.inviterEmail })
      : null,
    expiresAt: invitation.expiresAt.toISOString(),
    expired: invitation.expiresAt <= now,
  }));

  const isAlone = members.length === 1 && invitations.length === 0;

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Team"
        description={`Invite up to ${MAX_TEAM_SIZE} people and choose what each of them can do.`}
        action={canManage && <InviteMemberDialog />}
      />

      <TeamMembersCard members={members} canManage={canManage} />

      {invitations.length > 0 && <PendingInvitationsCard invitations={invitations} canManage={canManage} now={now} />}

      {isAlone && (
        <Card>
          <EmptyState
            icon={<UsersRound />}
            title="It's just you for now"
            description={
              canManage
                ? "Invite teammates to share leads, clients, projects and invoices in one workspace."
                : "When the owner or an admin invites people, they'll appear here."
            }
            action={canManage && <InviteMemberDialog />}
          />
        </Card>
      )}

      {canLeaveWorkspace(ctx.membership) && <LeaveWorkspaceCard workspaceName={ctx.organization.name} />}
    </div>
  );
}
