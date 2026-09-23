import Image from "next/image";

import type { TeamMember } from "@/components/marketing/solutions/agencies/agencyTeam";
import { cn } from "@/lib/utils";

type TeamAvatarProps = {
  member: TeamMember;
  size: number;
  className?: string;
};

export function TeamAvatar({ member, size, className }: TeamAvatarProps) {
  return (
    <Image
      src={member.avatar}
      alt=""
      width={size}
      height={size}
      sizes={`${size}px`}
      style={{ width: size, height: size }}
      className={cn("shrink-0 rounded-full object-cover", className)}
    />
  );
}

export function TeamAvatarStack({ members, size }: { members: TeamMember[]; size: number }) {
  return (
    <div className="flex items-center">
      {members.map((member, index) => (
        <TeamAvatar key={member.id} member={member} size={size} className={cn("ring-2 ring-white", index > 0 && "-ml-2")} />
      ))}
    </div>
  );
}
