import type { MilestoneStatus } from "@/db/schema";
import type { StatusTone } from "@/types/status-tone";

export const milestoneStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED"] as const satisfies readonly MilestoneStatus[];

export const milestoneStatusLabels: Record<MilestoneStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

export const milestoneStatusTones: Record<MilestoneStatus, StatusTone> = {
  PENDING: "neutral",
  IN_PROGRESS: "brand",
  COMPLETED: "mint",
};

export const MAX_MILESTONES = 50;
