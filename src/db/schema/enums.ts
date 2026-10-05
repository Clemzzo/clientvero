import { pgEnum } from "drizzle-orm/pg-core";

export const organizationRoleEnum = pgEnum("organization_role", ["OWNER", "ADMIN", "MEMBER"]);

export const leadStatusEnum = pgEnum("lead_status", [
  "NEW",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
]);

export const proposalStatusEnum = pgEnum("proposal_status", [
  "DRAFT",
  "SENT",
  "VIEWED",
  "ACCEPTED",
  "DECLINED",
  "EXPIRED",
  "WITHDRAWN",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "PLANNING",
  "IN_PROGRESS",
  "REVIEW",
  "COMPLETED",
  "PAUSED",
  "CANCELLED",
]);

export const milestoneStatusEnum = pgEnum("milestone_status", ["PENDING", "IN_PROGRESS", "COMPLETED"]);
