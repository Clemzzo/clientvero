"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Users } from "lucide-react";

import { MemberRowMenu } from "@/components/settings/MemberRowMenu";
import type { TeamMemberView } from "@/components/settings/team-types";
import { Avatar } from "@/components/shared/Avatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardHeader } from "@/components/ui/card";
import { roleLabels, roleTones } from "@/features/settings/team-roles";
import { formatDate } from "@/lib/utils/format";

type TeamMembersCardProps = {
  members: TeamMemberView[];
  canManage: boolean;
};

export function TeamMembersCard({ members, canManage }: TeamMembersCardProps) {
  const reduced = useReducedMotion() ?? false;

  return (
    <Card>
      <CardHeader
        title="Members"
        description={`${members.length} ${members.length === 1 ? "person" : "people"} in this workspace`}
        icon={{ node: <Users />, tone: "brand" }}
      />
      <ul className="mt-4 divide-y divide-ink-200 border-t border-ink-200">
        <AnimatePresence initial={false}>
          {members.map((member) => (
            <motion.li
              key={member.id}
              layout={!reduced}
              initial={reduced ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-3 px-5 py-3.5 sm:px-6"
            >
              <Avatar name={member.name} src={member.avatarSrc} className="size-10 text-[13px]" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate text-[14px] font-semibold text-ink-900">
                  <span className="truncate">{member.name}</span>
                  {member.isYou && <span className="shrink-0 text-[12.5px] font-medium text-ink-500">(you)</span>}
                </p>
                <p className="truncate text-[13px] text-ink-500">{member.email}</p>
              </div>
              <p className="hidden shrink-0 text-[13px] text-ink-500 md:block">Joined {formatDate(member.joinedAt.slice(0, 10))}</p>
              <StatusBadge label={roleLabels[member.role]} tone={roleTones[member.role]} className="shrink-0" />
              <div className="flex w-8 shrink-0 justify-end">
                {canManage && !member.isYou && member.role !== "OWNER" && <MemberRowMenu member={member} />}
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </Card>
  );
}
