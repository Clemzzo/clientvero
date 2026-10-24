import type { OrganizationRole } from "@/db/schema";
import type { StatusTone } from "@/types/status-tone";

export const roleLabels: Record<OrganizationRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
};

export const roleTones: Record<OrganizationRole, StatusTone> = {
  OWNER: "brand",
  ADMIN: "mint",
  MEMBER: "neutral",
};

export const roleDescriptions: Record<OrganizationRole, string> = {
  OWNER: "Full access, including billing. Can't be removed.",
  ADMIN: "Full access: can manage the team, business details, billing and deletions.",
  MEMBER: "Works with leads, clients, proposals, projects and invoices. Can't delete records or manage the team.",
};
