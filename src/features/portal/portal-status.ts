import type { PortalAccountStatus } from "@/db/schema";
import type { StatusTone } from "@/types/status-tone";

export const portalStatusLabels: Record<PortalAccountStatus, string> = {
  INVITED: "Portal invited",
  ACTIVE: "Portal active",
  REVOKED: "Portal revoked",
};

export const portalStatusTones: Record<PortalAccountStatus, StatusTone> = {
  INVITED: "warning",
  ACTIVE: "mint",
  REVOKED: "neutral",
};
