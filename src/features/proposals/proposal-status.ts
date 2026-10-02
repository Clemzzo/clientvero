import type { ProposalStatus } from "@/db/schema";
import type { StatusTone } from "@/types/status-tone";

export const proposalStatusLabels: Record<ProposalStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  VIEWED: "Viewed",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  EXPIRED: "Expired",
  WITHDRAWN: "Withdrawn",
};

export const proposalStatusTones: Record<ProposalStatus, StatusTone> = {
  DRAFT: "neutral",
  SENT: "brand",
  VIEWED: "warning",
  ACCEPTED: "mint",
  DECLINED: "danger",
  EXPIRED: "neutral",
  WITHDRAWN: "neutral",
};

export function isEditable(status: ProposalStatus) {
  return status === "DRAFT" || status === "WITHDRAWN";
}

export function canSend(status: ProposalStatus) {
  return isEditable(status);
}

export function isOpenForResponse(status: ProposalStatus) {
  return status === "SENT" || status === "VIEWED";
}

export const canWithdraw = isOpenForResponse;
