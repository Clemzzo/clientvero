import { MailPlus } from "lucide-react";

import { InvitationRowActions } from "@/components/settings/InvitationRowActions";
import type { InvitationView } from "@/components/settings/team-types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardHeader } from "@/components/ui/card";
import { roleLabels, roleTones } from "@/features/settings/team-roles";

type PendingInvitationsCardProps = {
  invitations: InvitationView[];
  canManage: boolean;
  now: Date;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function expiryLabel(invitation: InvitationView, now: Date) {
  if (invitation.expired) return "Expired";
  const days = Math.max(1, Math.ceil((new Date(invitation.expiresAt).getTime() - now.getTime()) / DAY_MS));
  return `Expires in ${days} ${days === 1 ? "day" : "days"}`;
}

export function PendingInvitationsCard({ invitations, canManage, now }: PendingInvitationsCardProps) {
  return (
    <Card>
      <CardHeader
        title="Pending invitations"
        description="People who have a link but haven't joined yet."
        icon={{ node: <MailPlus />, tone: "ocean" }}
      />
      <ul className="mt-4 divide-y divide-ink-200 border-t border-ink-200">
        {invitations.map((invitation) => (
          <li key={invitation.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-5 py-3.5 sm:px-6">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-ink-900">{invitation.email}</p>
              <p className="truncate text-[13px] text-ink-500">
                {invitation.invitedBy ? `Invited by ${invitation.invitedBy} · ` : ""}
                <span className={invitation.expired ? "font-medium text-amber-800" : undefined}>{expiryLabel(invitation, now)}</span>
              </p>
            </div>
            <StatusBadge label={roleLabels[invitation.role]} tone={roleTones[invitation.role]} className="shrink-0" />
            {canManage && <InvitationRowActions invitation={invitation} />}
          </li>
        ))}
      </ul>
    </Card>
  );
}
