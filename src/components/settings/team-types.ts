import type { OrganizationRole } from "@/db/schema";

export type TeamMemberView = {
  id: string;
  name: string;
  email: string;
  role: OrganizationRole;
  avatarSrc: string | null;
  joinedAt: string;
  isYou: boolean;
};

export type InvitationView = {
  id: string;
  email: string;
  role: OrganizationRole;
  invitedBy: string | null;
  expiresAt: string;
  expired: boolean;
};
