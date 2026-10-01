import type { LeadStatus } from "@/db/schema";
import type { StatusTone } from "@/types/status-tone";

export const leadStatuses = [
  "NEW",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
] as const satisfies readonly LeadStatus[];

export const openLeadStatuses = [
  "NEW",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
] as const satisfies readonly LeadStatus[];

export type OpenLeadStatus = (typeof openLeadStatuses)[number];

export const manualLeadStatuses = leadStatuses.filter((status) => status !== "WON");

export const leadStatusLabels: Record<LeadStatus, string> = {
  NEW: "New",
  QUALIFIED: "Qualified",
  PROPOSAL_SENT: "Proposal sent",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
};

export const pipelineStageColors: Record<OpenLeadStatus, string> = {
  NEW: "bg-brand-200",
  QUALIFIED: "bg-brand-400",
  PROPOSAL_SENT: "bg-brand-600",
  NEGOTIATION: "bg-brand-800",
};

export const leadStatusTones: Record<LeadStatus, StatusTone> = {
  NEW: "neutral",
  QUALIFIED: "brand",
  PROPOSAL_SENT: "brand",
  NEGOTIATION: "warning",
  WON: "success",
  LOST: "danger",
};
